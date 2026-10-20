# Vehicle Parking App

A Flask application with a Vue frontend, a SQLite database, Redis caching, and Celery background jobs.

**Use this README for setup.** The older README inside `vehicle-parking-app/` contains outdated instructions.

## Before you start

- These commands are for **macOS with zsh** (the default Terminal shell).
- Use **Python 3.11** for this project's pinned dependencies.
- Redis must be running for caching and background jobs.
- You do **not** need Node.js, `npm install`, or a separate frontend server. Flask serves the frontend directly.
- You do **not** need `flask db init`. The app creates missing database tables and initial accounts at startup.
- An internet connection is needed to load Vue, Bootstrap, and other frontend libraries from CDNs.

### Find the project root

The project root is the directory containing **this README**, `requirements.txt`, and the `vehicle-parking-app/` directory.

On the original developer's machine:

```bash
cd "/Users/yogeshberwal/Desktop/Vehicle Parking/Project"
```

On another machine, replace that path with your own project location. Quote paths containing spaces.

**All terminal instructions below start from the project root unless stated otherwise.**

## First-time setup — do this once

### 1. Install Python and Redis

If you use [Homebrew](https://brew.sh/):

```bash
brew install python@3.11 redis
```

Check that both are available:

```bash
python3.11 --version
redis-server --version
```

Skip installation if Python 3.11 and Redis are already installed.

### 2. Create the Python environment and install dependencies

From the project root:

```bash
python3.11 -m venv .venv
source .venv/bin/activate

python -m pip install --upgrade pip
python -m pip install 'setuptools<81'
python -m pip install -r <(grep -v '^Flask-Security==' requirements.txt)
python -m pip check
```

Why these installation commands differ from a plain `pip install -r requirements.txt`:

- `Flask-Security` and `Flask-Security-Too` both provide the `flask_security` module. The command skips the obsolete `Flask-Security` entry and installs `Flask-Security-Too` instead, without editing `requirements.txt`.
- The pinned Flask-Security-Too version needs `pkg_resources`, so setuptools must remain below version 81.
- `<(...)` is shell process substitution, supported by zsh and bash. Do not run this command inside a Python interpreter.

Use `.venv` for the commands in this guide. The existing `.parking` environment may have stale paths or missing packages; it is not needed.

### 3. Start the app

Follow the next section. You only need to repeat dependency installation when rebuilding the environment or updating dependencies.

## Run the app — every time, including returning users

Open **three terminal tabs/windows**. Keep the processes running while you use the app.

### Terminal 1 — Redis

```bash
redis-server
```

If Redis is already running, do not start another instance. Check it with:

```bash
redis-cli ping
```

Expected response: `PONG`. If you launched Redis in the foreground, run this check from another terminal.

### Terminal 2 — Flask web app

Navigate to the project root, then run:

```bash
source .venv/bin/activate
cd vehicle-parking-app
python -m flask --app app run --port 5001 --no-reload
```

Wait for `Running on http://127.0.0.1:5001`, then open:

**http://127.0.0.1:5001**

This guide uses port **5001** because macOS AirPlay Receiver can occupy Flask's default port 5000.

### Terminal 3 — Celery worker

Navigate to the project root, then run:

```bash
source .venv/bin/activate
cd vehicle-parking-app
python -m celery -A app:celery_app worker --loglevel=info --pool=solo
```

Wait for the worker to report `ready`. `--pool=solo` avoids common macOS multiprocessing issues.

The worker is needed for CSV exports and other background tasks. Redis and Flask alone are enough to browse and use the main app, but exports will not finish without the worker.

**Important:** Run Flask and Celery from `vehicle-parking-app/`, not `backend/`. Some file paths depend on this working directory.

## Log in

| Role | Email | Password |
| --- | --- | --- |
| Admin | `admin@parking.com` | `admin123` |
| Test user | `user01@parking.com` | `user123` |

Startup creates these accounts only if the email addresses do not already exist. Existing passwords are **not** reset. You can also register a new regular user through the app.

The SQLite database is stored at `vehicle-parking-app/instance/database.sqlite3`. Keep this file to preserve users, parking lots, and bookings between runs. Do not delete it as a troubleshooting step unless you intend to lose that data.

These default credentials and the hardcoded configuration are for local development, not public deployment.

## Optional — scheduled emails

Skip this section if you only need the main app and CSV exports.

The app sends email through SMTP at `localhost:1025`. For local testing, use MailHog to capture emails instead of delivering them to real inboxes.

### Install MailHog once

Skip this step if MailHog is already installed.

```bash
brew install mailhog
```

### Terminal 4 — local email server

```bash
MailHog
```

View captured messages at **http://localhost:8025**.

### Terminal 5 — Celery Beat scheduler

With Redis, Flask, the Celery worker, and MailHog already running, navigate to the project root and run:

```bash
source .venv/bin/activate
cd vehicle-parking-app
python -m celery -A app:celery_app beat --loglevel=info
```

Run only one Beat scheduler. Scheduled jobs use the `Asia/Kolkata` timezone; they do not run immediately on startup. Schedules are defined in `vehicle-parking-app/backend/celery/celery_schedule.py`.

## Stop and restart

- Press **Ctrl+C** in each terminal running Flask, the worker, Beat, MailHog, or foreground Redis.
- To leave an activated Python environment, run `deactivate`.
- To restart later, follow **Run the app** above. You do not need to recreate `.venv` or reinstall packages every time.
- If Redis is managed by another service, leave it alone unless you intend to stop that service.

## Troubleshooting

### Login does nothing / `POST /login` returns 400

The login screen currently does not display failed-login messages. A 400 from this route means missing email/password or an unrecognized email. Enter the full email address exactly, without surrounding spaces, and try the credentials above.

An incorrect password currently returns a `wrong password` JSON message with HTTP 200, so status 200 alone does not prove authentication succeeded. In browser developer tools, check **Network → login → Response** for the actual message.

### 404 for `/favicon.ico` or `/json/version`

Neither is a login endpoint. These requests can return 404 without affecting authentication. Check the status and response of **`POST /login`** instead.

### `ModuleNotFoundError: No module named 'pkg_resources'`

From the project root, with `.venv` activated:

```bash
python -m pip install 'setuptools<81'
```

Then restart Flask and the Celery worker.

### Other missing Python modules / wrong Flask version

Confirm you activated `.venv`, not `.parking` or another environment:

```bash
which python
python --version
```

The Python path should end in `Project/.venv/bin/python` (or the equivalent path on your machine). Repeat the dependency installation commands from first-time setup if necessary.

### Address already in use

Check whether the app is already available at http://127.0.0.1:5001 before starting another copy. To see what owns the port:

```bash
lsof -nP -iTCP:5001 -sTCP:LISTEN
```

Do not stop an unfamiliar process. If necessary, use another port, such as `--port 5002`, and open that port in your browser.

### Redis connection refused / port 6379 already in use

Run `redis-cli ping`. If it returns `PONG`, Redis is already running; do not start another instance. Otherwise, start Redis and check that it is listening locally on port 6379.

### CSV export stays pending

Ensure Redis is running and the Celery worker reports `ready`. Check the worker terminal for task errors. Confirm you started the worker from `vehicle-parking-app/`.

### Emails fail with connection refused

Start MailHog before running email jobs. The code expects SMTP on port 1025; the MailHog browser interface is on port 8025.

### Blank or unstyled page

Check your internet connection and browser console. The frontend loads libraries from external CDNs, so blocked CDN requests can prevent the app from rendering.

## Demo data / reset for experiments

See [DEMO_DATA.md](DEMO_DATA.md) for saved demo credentials, parking lots, booking scenarios, and reset instructions.

From `vehicle-parking-app/` with `.venv` activated, use `python seed_demo.py --reset --profile large` for 60 lots, 300 users, and 12,180 bookings. Use `--profile small` instead for the original focused demo (5 lots, 6 users, 65 bookings); omitting the profile also selects small.

**Stop Flask, the Celery worker, and Beat first. This deletes existing local application data and generated exports.** Do not run it if you want to keep your current users and bookings.

## Project structure

```text
Project/
├── README.md                     # This setup guide
├── requirements.txt              # Python dependencies
├── .venv/                        # Local Python environment (created during setup)
└── vehicle-parking-app/
    ├── app.py                    # Flask entry point and Celery initialization
    ├── backend/
    │   ├── config.py             # SQLite, security, and Redis cache settings
    │   ├── models/
    │   │   ├── models.py         # Database models
    │   │   └── create_initial_data.py  # Tables, roles, and default accounts
    │   ├── routes.py             # Login, registration, exports, and other routes
    │   ├── resources.py          # REST API resources
    │   └── celery/               # Worker setup, tasks, schedules, and email service
    ├── frontend/
    │   ├── index.html            # Flask-rendered entry page and CDN libraries
    │   ├── app.js                # Vue application
    │   ├── components/           # Reusable components
    │   ├── pages/                # Page components
    │   └── utils/                # Router and Vuex store
    └── instance/
        └── database.sqlite3      # Persistent SQLite database
```
