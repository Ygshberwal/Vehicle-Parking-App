"""Browser smoke tests against an isolated, temporary large demo database.

Install tests/requirements-ui.txt and run `playwright install chromium` first.
Then: python tests/ui_smoke.py [--browser-executable /path/to/chromium]
"""
import argparse
import csv
import logging
import os
from pathlib import Path
import re
import sys
import tempfile
from threading import Thread

from playwright.sync_api import sync_playwright, expect
from werkzeug.serving import make_server

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "vehicle-parking-app"))
os.environ.update(APP_ENV="demo", DATABASE_URL="postgresql://unused@localhost/unused",
                  SECRET_KEY="ui-test-secret-" * 5, SECURITY_PASSWORD_SALT="ui-test-salt-" * 5)
from app import createApp
from backend.models.models import db
from seed_demo import seed_demo

logging.getLogger("werkzeug").setLevel(logging.ERROR)


def run(executable=None, screenshot_dir=None):
    with tempfile.TemporaryDirectory(dir=os.getenv("PARKING_TEST_TMPDIR")) as directory:
        app = createApp({"TESTING": True, "SQLALCHEMY_DATABASE_URI": "sqlite:///" + str(Path(directory) / "ui.sqlite3"),
                         "SQLALCHEMY_ENGINE_OPTIONS": {}, "SECURITY_PASSWORD_HASH_PASSLIB_OPTIONS": {"bcrypt__rounds": 4}})
        with app.app_context():
            db.create_all()
        seed_demo("large", application=app, reset=False)
        server = make_server("127.0.0.1", 0, app, threaded=True)
        thread = Thread(target=server.serve_forever, daemon=True)
        thread.start()
        base = f"http://127.0.0.1:{server.server_port}/"
        shots = Path(screenshot_dir or directory)
        shots.mkdir(parents=True, exist_ok=True)
        try:
            with sync_playwright() as p:
                browser = p.chromium.launch(headless=True, **({"executable_path": executable} if executable else {}))
                context = browser.new_context(ignore_https_errors=True, viewport={"width": 1440, "height": 1000})
                page = context.new_page()
                errors = []
                page.on("pageerror", lambda error: errors.append(str(error)))

                def visit(path, heading):
                    page.goto(base + "#" + path, wait_until="networkidle")
                    expect(page.get_by_role("heading", name=heading, exact=True)).to_be_visible(timeout=15000)
                    expect(page.locator('.app-state[aria-busy="true"]')).to_have_count(0, timeout=20000)

                def screenshot(name):
                    dismiss = page.get_by_role('button', name='Dismiss notification', exact=True)
                    while dismiss.count():
                        dismiss.first.click()
                    page.evaluate('() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)))')
                    page.screenshot(path=str(shots / (name + ".png")), full_page=not name.startswith("mobile-"))

                def no_overflow():
                    assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), page.url
                    assert page.locator('.stat-card > strong').evaluate_all('elements => elements.every(element => element.scrollWidth <= element.clientWidth + 1)'), 'Stat value overflow: ' + page.url

                def sign_in(email, password):
                    visit("/login", "Welcome back")
                    page.get_by_label("Email address", exact=True).fill(email)
                    page.get_by_label("Password", exact=True).fill(password)
                    page.get_by_role("button", name="Sign in", exact=True).click()

                visit("/", "Less searching. More parking.")
                screenshot("home")
                sign_in("admin@parking.com", "wrong-password")
                expect(page.get_by_role("alert")).to_contain_text("Invalid email or password")
                page.get_by_label("Password", exact=True).fill("admin123")
                page.get_by_role("button", name="Sign in", exact=True).click()
                expect(page.get_by_role("heading", name="Parking overview")).to_be_visible()
                expect(page.locator(".stat-card")).to_have_count(4)
                expect(page.locator(".lot-card")).to_have_count(6)
                screenshot("admin-overview")

                visit("/lots", "Parking lots")
                expect(page.locator(".lot-card")).to_have_count(12)
                page.get_by_label("Search parking lots").fill("no-such-place-xyz")
                expect(page.get_by_role("heading", name="No matching parking lots")).to_be_visible()
                page.get_by_role("button", name="Clear filters").click()
                page.get_by_role("button", name="Next page").click()
                expect(page.locator(".page-indicator")).to_have_text("2 / 5")
                screenshot("parking-lots")

                visit("/users", "User management")
                expect(page.locator("tbody tr")).to_have_count(20)
                page.get_by_label("Search users").fill("riya@parking.com")
                row = page.locator("tbody tr").first
                row.get_by_role("button", name="Block Riya Verma").click()
                expect(page.get_by_role("alertdialog")).to_be_visible()
                expect(page.get_by_role("button", name="Cancel", exact=True)).to_be_focused()
                page.keyboard.press("Shift+Tab")
                expect(page.get_by_role("alertdialog").get_by_role("button", name="Block user", exact=True)).to_be_focused()
                page.keyboard.press("Tab")
                expect(page.get_by_role("button", name="Cancel", exact=True)).to_be_focused()
                page.keyboard.press("Escape")
                expect(page.get_by_role("alertdialog")).to_have_count(0)
                row.get_by_role("button", name="Block Riya Verma").click()
                page.get_by_role("button", name="Block user", exact=True).click()
                expect(row.locator(".status-badge")).to_have_text("Blocked")
                row.get_by_role("button", name="Unblock Riya Verma").click()
                page.get_by_role("button", name="Restore access", exact=True).click()
                expect(row.locator(".status-badge")).to_have_text("Active")
                row.get_by_role("link", name="Riya Verma", exact=True).click()
                expect(page.get_by_role("heading", name="Riya Verma", exact=True)).to_be_visible()
                page.get_by_role("link", name="View parking insights", exact=False).click()
                expect(page.get_by_role("heading", name="Driver insights", exact=True)).to_be_visible()
                expect(page.get_by_role("heading", name="Insights start with your first visit", exact=True)).to_be_visible()
                visit("/users", "User management")
                page.get_by_label("Search users").fill("")
                screenshot("users")
                with page.expect_download() as event:
                    page.get_by_role("button", name="Export users", exact=True).click()
                downloaded = event.value
                downloaded.save_as(str(Path(directory) / "users.csv"))
                with open(Path(directory) / "users.csv", encoding="utf-8-sig") as file:
                    fields = next(csv.reader(file))
                    assert "password" not in fields and "fs_uniquifier" not in fields

                visit("/add-lot", "Add a parking lot")
                page.get_by_label("Location name", exact=True).fill("UI Test Courtyard")
                page.get_by_label("Street address", exact=True).fill("1 Test Lane, New Delhi")
                page.get_by_label("PIN code", exact=True).fill("110001")
                page.get_by_label("Hourly price (₹)", exact=True).fill("45")
                page.get_by_label("Total parking spaces", exact=True).fill("8")
                screenshot("lot-form")
                page.get_by_role("button", name="Create parking lot", exact=True).click()
                expect(page.get_by_role("heading", name="Parking lots", exact=True)).to_be_visible()
                page.get_by_label("Search parking lots").fill("UI Test Courtyard")
                page.locator(".lot-card").get_by_role("link", name="View lot", exact=False).click()
                expect(page.get_by_role("heading", name="UI Test Courtyard", exact=True)).to_be_visible()
                page.get_by_role("link", name="Edit details").click()
                expect(page.get_by_label("Hourly price (₹)")).to_have_value("45")
                page.get_by_label("Hourly price (₹)").fill("55")
                page.get_by_role("button", name="Save changes", exact=True).click()
                expect(page.get_by_role("heading", name="UI Test Courtyard", exact=True)).to_be_visible()
                screenshot("lot-details")
                page.get_by_role("button", name="Delete lot", exact=True).click()
                page.get_by_role("alertdialog").get_by_role("button", name="Delete lot", exact=True).click()
                expect(page.get_by_role("heading", name="Parking lots", exact=True)).to_be_visible()

                visit("/all-stats", "Parking analytics")
                expect(page.locator("canvas")).to_have_count(6)
                page.wait_for_function("typeof Chart !== 'undefined' && Object.keys(Chart.instances).length === 6")
                screenshot("analytics")
                page.get_by_text("View data table", exact=True).first.click()
                expect(page.locator(".chart-data[open] tbody tr").first).to_be_visible()

                visit("/user-dashboard/1", "Bookings")
                expect(page.locator("tbody tr")).to_have_count(25)
                screenshot("admin-bookings")
                page.get_by_label("Search bookings").fill("DL02CD1000")
                page.get_by_role("button", name=re.compile("^Active")).click()
                expect(page.locator("tbody tr")).to_have_count(1)

                for path, heading in [("/admin-dashboard", "Parking overview"), ("/lots", "Parking lots"), ("/users", "User management"), ("/user-dashboard/1", "Bookings"), ("/all-stats", "Parking analytics")]:
                    visit(path, heading)
                    for width in (320, 390, 768):
                        page.set_viewport_size({"width": width, "height": 844})
                        no_overflow()
                    page.set_viewport_size({"width": 390, "height": 844})
                    if path == "/user-dashboard/1": screenshot("mobile-bookings")
                    if path == "/all-stats": screenshot("mobile-analytics")
                    page.set_viewport_size({"width": 1440, "height": 1000})

                page.get_by_role("button", name="Sign out", exact=True).click()
                sign_in("riya@parking.com", "RiyaDemo123!")
                expect(page.get_by_role("heading", name="Parking lots", exact=True)).to_be_visible()
                visit("/user-stats/7", "My parking insights")
                expect(page.get_by_role("heading", name="Insights start with your first visit")).to_be_visible()
                page.route("**/api/lots", lambda route: route.fulfill(status=503, content_type="application/json", body='{"message":"Temporary test outage"}'))
                visit("/lots", "Parking lots")
                expect(page.get_by_role("alert")).to_contain_text("Temporary test outage")
                page.unroute("**/api/lots")
                page.get_by_role("button", name="Try again", exact=True).click()
                expect(page.locator(".lot-card")).to_have_count(12)
                visit("/lots/5", "Dwarka Express Parking")
                expect(page.locator(".booking-panel")).to_contain_text("This lot is currently full")
                expect(page.get_by_role("button", name="Confirm booking", exact=True)).to_have_count(0)
                visit("/lots", "Parking lots")
                page.get_by_label("Search parking lots").fill("Nehru Place")
                page.locator(".lot-card").get_by_role("link", name="View lot", exact=False).click()
                page.get_by_label("Vehicle number", exact=True).fill("DL99UI0001")
                page.get_by_role("button", name="Confirm booking", exact=True).click()
                expect(page.locator('.booking-panel .inline-feedback').filter(has_text='is booked.')).to_be_visible()
                page.get_by_role("link", name="View your bookings", exact=False).click()
                expect(page.locator("tbody tr")).to_have_count(1)
                page.get_by_role("button", name=re.compile("^Release booking")).click()
                page.get_by_role("button", name="Release parking slot", exact=True).click()
                expect(page.locator("tbody .status-badge")).to_have_text("Completed")
                screenshot("driver-bookings")
                visit("/user-stats/7", "My parking insights")
                expect(page.locator("canvas")).to_have_count(3)
                screenshot("driver-insights")
                page.set_viewport_size({"width": 390, "height": 844})
                page.get_by_role("button", name="Open navigation", exact=True).click()
                page.get_by_role("link", name="My bookings", exact=True).click()
                expect(page.get_by_role("button", name="Open navigation", exact=True)).to_have_attribute("aria-expanded", "false")
                no_overflow()

                page.set_viewport_size({"width": 1440, "height": 1000})
                page.get_by_role("button", name="Sign out", exact=True).click()
                visit("/register", "Create your account")
                page.get_by_label("Full name", exact=True).fill("UI Test Driver")
                page.get_by_label("Email address", exact=True).fill("ui-test-driver@parking.com")
                page.get_by_label("Password", exact=True).fill("UITest123!")
                page.get_by_role("button", name="Show password", exact=True).click()
                expect(page.get_by_label("Password", exact=True)).to_have_attribute("type", "text")
                page.get_by_role("button", name="Hide password", exact=True).click()
                screenshot("registration")
                for width in (320, 390, 768):
                    page.set_viewport_size({"width": width, "height": 844}); no_overflow()
                page.get_by_role("button", name="Create account", exact=True).click()
                expect(page.get_by_role("heading", name="Welcome back", exact=True)).to_be_visible()
                sign_in("admin@parking.com", "admin123")
                expect(page.get_by_role("heading", name="Parking overview", exact=True)).to_be_visible()
                visit("/user-dashboard/1", "Bookings")
                page.evaluate("const user = JSON.parse(localStorage.getItem('user')); user.token = 'expired-test-token'; localStorage.setItem('user', JSON.stringify(user));")
                page.reload(wait_until="networkidle")
                expect(page.get_by_role("heading", name="Welcome back", exact=True)).to_be_visible()
                expect(page.locator('.notice-stack')).to_contain_text('Your session has expired')
                assert not errors, errors
                browser.close()
                print("PASS: guest/admin/driver flows, forms, booking/release, exports, account controls, charts, pagination, responsive layouts, and no browser JavaScript errors.")
                if screenshot_dir: print("Screenshots:", shots)
        finally:
            server.shutdown(); thread.join(timeout=5)
            with app.app_context(): db.session.remove(); db.engine.dispose()


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--browser-executable")
    parser.add_argument("--screenshots")
    args = parser.parse_args()
    run(args.browser_executable, args.screenshots)
