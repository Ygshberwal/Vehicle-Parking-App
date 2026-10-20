# Free portfolio deployment: Render + Neon

This guide deploys the Flask backend **and Vue frontend together** on one Render Free web service, using Neon Free PostgreSQL for persistent data. No Vercel, Redis instance, worker, paid disk, object-storage account, email provider, or purchased domain is required.

| Feature | Local version | Hosted portfolio demo |
| --- | --- | --- |
| Database | SQLite | Neon PostgreSQL |
| Cache | Redis | In-process SimpleCache |
| CSV exports | Celery background jobs | Authenticated direct downloads |
| Email and scheduled jobs | MailHog + Celery + Beat | Disabled |
| Web server | Flask development server | Gunicorn |

**This is a public, shared, fictional demo, not a service for real customers.** Demo login credentials are deliberately shown on the website. Visitors can modify shared data, including through the demo admin account. Never enter real personal information or reuse these passwords.

## 1. Push the prepared code

From the project root, review and commit the changes, including `render.yaml`, `start.sh`, `requirements.txt`, the backend/frontend changes, and `vehicle-parking-app/migrations/`. Push to the branch you intend to deploy.

Do not commit a real `.env` file, database connection string, or secret. `.env.example` is documentation only; it is not automatically loaded. The application now reads the tracked `backend/settings.py`, not the old untracked `backend/config.py`.

## 2. Create a free Neon database

1. Sign up at https://neon.com and choose the **Free** plan.
2. Create a project, for example `vehicle-parking-demo`.
3. Select a region near Render's Singapore region, or change the Render region before deploying to match your preferred location.
4. Use the default database or create a dedicated empty database for this demo. **Do not point the app at a database used by another project.**
5. Click **Connect**, enable connection pooling, and copy the PostgreSQL connection string.
6. Keep all connection-string options Neon supplies, including `sslmode=require` and any channel-binding option.

It should resemble `postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require`. Copy it exactly; the app automatically selects the psycopg 3 driver. Do not post this string in GitHub issues, screenshots, or chat.

## 3. Deploy the Render Blueprint (recommended)

1. Sign up at https://render.com and connect GitHub.
2. Choose **New → Blueprint**.
3. Select the repository and the branch containing `render.yaml`.
4. Render should find **one Free web service**, `vehicle-parking-demo`. No paid services or Render databases are defined.
5. When prompted for **`DATABASE_URL`**, paste the Neon connection string privately.
6. Review the plan and region, then deploy.

The Blueprint supplies:

| Setting | Value |
| --- | --- |
| Runtime | Python 3.11.17 |
| Plan | Free |
| Build | `pip install -r requirements.txt` |
| Start | `bash start.sh` |
| Health check | `/healthz` |
| `APP_ENV` | `demo` |
| `DEMO_PROFILE` | `large` |
| `SECRET_KEY` | Automatically generated |
| `SECURITY_PASSWORD_SALT` | Separately generated |

**Do not replace the start command with `python app.py` or plain Gunicorn:** `start.sh` also applies migrations and safely initializes an empty database.

### Alternative: create the web service manually

If you do not use Blueprints, create a **Python Web Service**, connect the same repository, leave **Root Directory blank**, choose **Free**, and copy the build/start/health settings above. Set Python version through `PYTHON_VERSION=3.11.17` in the service environment.

Add `APP_ENV=demo`, `DEMO_PROFILE=large`, and your private `DATABASE_URL`. Generate **two different secrets**, each at least 32 characters, and enter them as `SECRET_KEY` and `SECURITY_PASSWORD_SALT`:

```bash
python3 -c 'import secrets; print(secrets.token_hex(32))'
```

Run the command separately for each secret. Keep both stable across deployments; changing them invalidates sessions, and changing the password salt prevents verification of previously seeded passwords.

## 4. Understand the first startup

`start.sh` runs the following automatically before starting Gunicorn:

```bash
python vehicle-parking-app/manage.py init-demo --if-empty --profile large
```

It:

1. Connects to PostgreSQL and acquires a transaction-scoped initialization lock.
2. Applies versioned Alembic database migrations.
3. Seeds only if **all application tables are empty**.
4. Starts the web server on Render's assigned `$PORT`.

With the large profile, initialization creates **1 admin, 300 regular users, 60 lots, 2,238 slots, 12,000 completed bookings, and 180 active bookings**. It may take longer than subsequent starts. Look for `Created large profile` in the startup logs.

On subsequent starts, look for `Existing application data found; preserving it (no demo reset).` Existing users, passwords, edits and bookings are preserved. Changing `DEMO_PROFILE` does **not** replace populated data.

There is no web-accessible reset endpoint. The local destructive `seed_demo.py --reset` command refuses PostgreSQL databases. Render Free has no interactive shell; none is required for deployment or initialization.

Initialization or migration failure stops the start script; it does not silently launch an app with an incomplete database. Seed inserts commit together or roll back together.

## 5. Test the live app

Open the HTTPS URL shown by Render, such as `https://vehicle-parking-demo.onrender.com` (the actual name may differ).

- `/healthz` should return `{"status":"ok"}`.
- The home page should display the portfolio-demo banner.
- User login: `user01@parking.com` / `user123`.
- Admin login: `admin@parking.com` / `admin123`.
- Fresh-user login: `riya@parking.com` / `RiyaDemo123!`.
- Additional accounts and scenarios: [DEMO_DATA.md](DEMO_DATA.md).

Check all of these:

1. Admin can see 60 lots, 300 regular users, statistics and bookings.
2. Admin CSV exports download without a worker. User exports exclude passwords, authentication identifiers and profile-image bytes.
3. A regular user can book an available slot and release their own booking.
4. Regular users cannot view another user's history or modify admin resources.
5. Create an identifiable test lot or booking, then use **Manual Deploy → Deploy latest commit**. Confirm the edit remains and startup reports existing data was preserved.

CSV exports are generated in memory; they do not rely on Render's temporary filesystem. The database is on Neon and survives Render sleeping/redeploying.

## 6. Staying within a zero budget

- Keep Render's service on **Free** and Neon on **Free**. Do not enable paid upgrades or add paid services.
- Render sleeps after 15 minutes without inbound traffic. The first visitor may wait about a minute; Neon can also pause its compute when idle.
- Do not add artificial keep-alive pings. Sleeping is normal for this free demo.
- Free tiers have compute, storage, bandwidth, and build limits. Monitor both dashboards. Availability can stop when limits are reached; free hosting has no always-on guarantee.
- Render's own free PostgreSQL expires after 30 days, which is why this guide uses Neon instead.
- Keep payment methods absent where possible. If a provider requires verification, review overage controls before proceeding. Free tiers and account requirements can change.
- A Render subdomain includes HTTPS; a custom domain is optional and its registration is not free.

The public demo caps growth at **500 total accounts, 100 lots and 20,000 bookings**, with at most 200 slots per newly edited/created lot. It also applies basic per-process, per-address write/authentication request limits. This is a portfolio safeguard, not production-grade abuse protection. A shared-IP group may encounter a brief rate limit.

## Troubleshooting

| Problem | Check |
| --- | --- |
| `Demo deployment requires ...` | `APP_ENV`, both secrets (at least 32 characters), and the complete PostgreSQL `DATABASE_URL` |
| Database connection/SSL error | Use the exact Neon connection string and preserve SSL options; make sure the project is available |
| `relation ... does not exist` | Ensure Render starts with `bash start.sh`, not a command that skips migrations |
| Initialization reports existing data | This is expected after the first deploy; no automatic reset occurs |
| Slow first load | Wait for free Render/Neon services to wake up; inspect startup logs if it persists |
| Login fails after changing settings | Restore the original password salt; log in again if only the secret key changed |
| Login/session expired | Sign in again. Old tokens do not survive a reset or secret-key change |
| HTTP 429 | Wait a minute; the hosted demo limits authentication and write requests |
| HTTP 409 demo limit | An application quota was reached; do not upgrade hosting just to work around demo-data growth |
| Blank frontend | Check browser console and CDN access; frontend libraries still load from external CDNs |
| CSV pending / Redis connection error | Verify `APP_ENV=demo`. Hosted exports must use the direct-download path |
| Emails not arriving | Expected: hosted email and schedules are intentionally disabled |

## Local development after these changes

Follow [README.md](README.md), including the returning-user dependency upgrade. Clear hosted environment variables before starting the local SQLite version. Local Celery exports still use the same buttons; the frontend automatically handles either mode. Never copy hosted credentials into the tracked source.

Run regression tests from the project root, with the updated environment activated:

```bash
python -m unittest discover -s tests -v
```

Tests use temporary SQLite databases and never reset the application's existing local database.

## Future schema changes

Hosted startup runs existing migrations; it does not invent schema changes automatically. Create and review a migration against a dedicated development PostgreSQL database before committing it:

```bash
cd vehicle-parking-app
python -m flask --app app db migrate -m "describe schema change"
```

Use hosted-demo environment settings pointed at that **development** database, with migrations already applied. Do not generate migrations directly against the live portfolio database. Do not run `flask db init`; the migration directory already exists.

References: https://render.com/docs/free and https://neon.com/pricing.
