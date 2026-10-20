# Demo data and login credentials

**Local testing only. These passwords are intentionally documented; never reuse them for real accounts or deploy this dataset publicly.**

## Accounts

The following seven accounts exist in **both profiles**. The scenario column describes the small profile; large-profile scenarios are listed below.

| Name | Role | Email | Password | Scenario |
| --- | --- | --- | --- | --- |
| admin | Admin | `admin@parking.com` | `admin123` | Manage lots, users, exports, and statistics |
| user01 | User | `user01@parking.com` | `user123` | Active booking at Connaught Place |
| Aarav Sharma | User | `aarav@parking.com` | `AaravDemo123!` | Active booking at Saket |
| Diya Patel | User | `diya@parking.com` | `DiyaDemo123!` | Active booking at Dwarka |
| Kabir Singh | User | `kabir@parking.com` | `KabirDemo123!` | Active booking at Dwarka |
| Meera Gupta | User | `meera@parking.com` | `MeeraDemo123!` | Active booking at Dwarka |
| Riya Verma | User | `riya@parking.com` | `RiyaDemo123!` | New user: no bookings yet |

## Large profile — volume testing

Run `python seed_demo.py --reset --profile large` from `vehicle-parking-app/` with the environment activated and Flask, the worker, and Beat stopped.

| Data | Quantity |
| --- | --- |
| Admins | 1 |
| Regular users | 300 |
| Parking lots | 60 |
| Parking slots | 2,238 |
| Completed bookings | 12,000 |
| Active bookings | 180 |
| Total bookings | 12,180 |

### Additional login credentials

- The original seven accounts above keep their passwords.
- **294 additional users:** `demo007@parking.com` through `demo300@parking.com`, inclusive (three-digit numbers).
- **Password for every additional user:** `ParkingDemo123!`
- Example: `demo007@parking.com` / `ParkingDemo123!`.
- Passwords are hashed separately in the database. Seeding 300 users can take a minute or two.

### Large-profile scenarios

- 280 users have roughly 42–43 completed visits each, spread over the previous year for monthly charts. Of these, 180 also have one active booking each.
- Riya (`riya@parking.com`) and `demo282@parking.com` through `demo300@parking.com` have no bookings: 20 fresh users total.
- **Dwarka Express Parking** and **Karol Bagh Metro Parking** are completely full.
- **Nehru Place Plaza** and **Greater Kailash Community Parking** have no bookings at all.
- **Rohini Market Parking** has historical bookings but no occupied slots.
- Other lots have a mix of available and occupied slots, with varied capacities and hourly prices.
- Vehicles use `DL02CD1000` through `DL02CD1279`; the first 180 are currently parked.
- All lots predate their bookings. Each slot and vehicle has non-overlapping visits; charges use the app's hourly rounding rule.

This is a UI-volume dataset, **not** a concurrency/load benchmark. Current screens may render every row/card and chart label without pagination; crowded layouts or slow rendering are useful things to inspect, not hidden by the seed script.

## Small profile — parking lots immediately after reset

Prices are per hour in rupees. Completed visits use the app's billing rule: round duration up to the next whole hour, then multiply by the lot's price.

| Lot | PIN code | Price/hour | Total slots | Available | Occupied |
| --- | --- | --- | --- | --- | --- |
| Connaught Place Central | 110001 | ₹60 | 12 | 11 | 1 |
| Saket Metro Parking | 110017 | ₹40 | 8 | 7 | 1 |
| Rohini Market Parking | 110085 | ₹30 | 6 | 6 | 0 |
| Nehru Place Plaza | 110019 | ₹50 | 4 | 4 | 0 |
| Dwarka Express Parking | 110075 | ₹25 | 3 | 0 | 3 |

## Small profile — bookings and test scenarios

- **65 bookings:** 60 completed and 5 active.
- Each of the first five users has 12 completed visits spread across approximately the previous 100 days, plus one active booking. Riya has no history.
- Historical bookings have departure times and calculated costs. Active bookings have neither until released.
- Vehicles are `DL01AB1001` through `DL01AB1005`, assigned in account-table order starting with user01.
- All dates are relative to the time you run the reset script, using the app's local, timezone-naive datetime convention.
- Dwarka is full: test the no-availability state, then release one of its bookings.
- Nehru Place has no booking history: test empty revenue/history states and booking a first visit.
- Rohini is unoccupied but has completed bookings: test historical statistics independently of current occupancy.
- Use Riya to test a fresh user's first booking and empty dashboard.
- Use the admin to inspect occupancy, user statistics, and CSV exports (exports require Redis and the Celery worker).

Counts and scenarios describe the initial seed; interacting with the app changes them.

## Reset to this dataset again

**This permanently replaces all users, roles, lots, slots, and bookings in the local database. Git does not necessarily back up your runtime database.**

1. Stop Flask, the Celery worker, and Celery Beat with Ctrl+C. Keep Redis running if you want to inspect its app-specific cache.
2. From the project root:

   ```bash
   source .venv/bin/activate
   cd vehicle-parking-app
    # Large dataset for volume testing:
    python seed_demo.py --reset --profile large

    # OR: small dataset for focused testing (not both commands):
    python seed_demo.py --reset --profile small
   ```

3. Restart the app and worker using [README.md](README.md).
4. Log out and log back in. Previous authentication tokens reference deleted accounts and are no longer valid. If necessary, clear the site's browser storage.

The script also removes CSV exports in `backend/celery/user-downloads/`, local `celerybeat-schedule*` files, and the two project-local `dump.rdb` snapshots. It preserves the downloads directory, source files, and Python environments. Redis can recreate a snapshot during normal operation.

Redis is deliberately **not flushed**, because the server may be shared with other projects. Before a reset, check for old tasks/cache if you have used the app since the last seed; do not run a blanket `FLUSHALL`. MailHog messages are also left untouched.

Running `python seed_demo.py` without `--reset` refuses to change data. The script restricts itself to this app's local `instance/database.sqlite3` database.
