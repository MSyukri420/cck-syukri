← [Back to README](../README.md)

# CCK HR Performance Measure System: technical details

## How it works

The app runs as one Node.js process:

1. **API**: Express serves every endpoint under `/api` ([server/app/routes.js](../server/app/routes.js)), with data in MongoDB through Mongoose ([server/app/models/](../server/app/models/)).
2. **Website**: the same server serves the built React client from `client/dist`, sending `index.html` for page URLs so React Router can handle them.
3. **Login**: `POST /api/login` sets an httpOnly cookie holding a JWT that lasts one day. Each protected route checks the cookie, loads the user's role and permissions, and returns 401 or 403 if they're missing.
4. **PDFs**: appraisals and survey responses are rendered by Puppeteer (headless Chromium) from the Handlebars templates in `server/resources/views`, and saved in `server/resources/uploads`. The templates load their logo and stylesheet from `/assets` on the same server.
5. **Email**: Nodemailer sends password resets, appraisal PDFs and survey invitations, through any SMTP provider or a Gmail account.

### Roles

On an empty database the server creates 30 permissions and 4 roles ([server/bootstrap.js](../server/bootstrap.js)). An admin can change what each role can do under **Settings → Roles & Permissions**.

| Role | Can see and do |
|---|---|
| Super Admin | Every module: departments, designations, job grades, employees, appraisals, criteria, surveys, roles and settings |
| HR | Employees in every department (including CSV updates), appraisals, performance criteria and surveys |
| HOD | Their own department's employees, and appraising them |
| Employee | Their own profile, viewing and commenting on their own appraisals, their department's employee list, and answering surveys sent to them |

Server messages, such as why a delete was refused, follow the language chosen in Settings: the client sends it in an `X-Language` header (`en`, `ms` or `zh`).

Only roles with the `performance_appraisal` permission can create, edit or delete appraisals, and only roles with the `survey` permission can create, edit, delete or see the results of surveys. A survey response is visible only to the person who gave it and to roles with `survey`. Databases created before employees lost appraisal management are updated once on startup, which is recorded in the `_migrations` collection, so a permission an admin grants back later is kept.

### Appraisal scoring

Each job grade has a percentage carry for the three categories, adding up to 100. Each criterion (attribute) in a category has sub-items whose weights add up to 100, and the appraiser gives each sub-item a mark from 0 to 100.

```
category score = (sum of marks × weight / 100) / (sum of weights) × percentage carry
total score    = Know-How + Problem-Solving + Accountability        (0 to 100)
```

Grades: **A** 85 and above, **B** 70–84, **C** 50–69, **D** 30–49, **E** below 30. For example, with carries of 30 / 30 / 40 and every mark at 80, the total is 24 + 24 + 32 = 80, a B. The calculation lives in `getNewPerformanceAppraisalStats` in [server/app/functions.js](../server/app/functions.js).

## Deployment

All three options use `server/.env` for settings. Create it first and set `JWT_SECRET`; the server refuses to start without it.

```bash
cp server/.env.example server/.env

# generate a JWT_SECRET to paste into server/.env
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

### Option A: Docker Compose (simplest)

Needs Docker with Compose. This runs the app and MongoDB together; nothing else needs to be installed.

```bash
# build the image and start both containers in the background
docker compose up -d --build

# follow the app's log
docker compose logs -f app

# update after pulling new code
git pull && docker compose up -d --build
```

- The site is on http://localhost:3000. To use another port: `APP_PORT=8080 docker compose up -d`.
- Compose uses its own MongoDB, so `MONGODB_URI` in `server/.env` is ignored. Data, uploads and logs are kept in the volumes `mongo-data`, `uploads` and `logs`, which survive restarts and rebuilds.
- The image includes Chromium, so PDFs work without extra setup.
- The app image is about 1.6 GB and MongoDB about 1.2 GB on disk. Tested with Docker Desktop 4.95 on Windows 11.
- To add the mock test data inside Docker: `docker compose exec -e NODE_ENV=development app node scripts/seed-mock-data.js` (add `--clear` to remove it).
- To stop: `docker compose down`. Adding `-v` also deletes the database, uploads and logs.

### Option B: Node.js on a server

Needs Node.js 18 or later (22 recommended) and MongoDB 7 (local or a hosted service such as MongoDB Atlas). Tested on Windows with Node 18 and MongoDB 7.

```bash
# install the root, server and client packages (Puppeteer downloads Chromium here)
npm run install:all

# build the website into client/dist
npm run build

# start the app on PORT (default 3000)
npm start
```

For production, also set in `server/.env`:

- `NODE_ENV=production`
- `APP_URL` to the public address, e.g. `https://hr.example.com`, so links in emails point to the right place
- `MONGODB_URI` if the database isn't on the same machine

To keep it running and restart it after crashes or reboots, use a process manager, e.g. `npx pm2 start npm --name cck-hrpms -- start`. For HTTPS, put a reverse proxy such as Nginx or Caddy in front of port 3000, and set `TRUST_PROXY=1` so the login limits see each visitor's address. On minimal Linux servers, Chromium may need extra system libraries for PDFs; the Docker image avoids this.

### Option C: development

```bash
npm run install:all

# API on http://localhost:3000 and the website with hot reload on http://localhost:3001
npm run dev
```

Both run in one terminal, labelled `[server]` and `[client]`, and `Ctrl+C` stops both.

### First admin account

On an empty database, the first visit redirects to `/first-run`, where you create the Super Admin account. This page only works while no users exist. After logging in, add departments, designations and job grades, then employees, then the appraisal criteria for each designation.

## Configuration

Every setting goes in `server/.env`. [server/.env.example](../server/.env.example) explains each one.

| Setting | Default | Purpose |
|---|---|---|
| `JWT_SECRET` | none (required) | Signs login tokens. Use a long random string |
| `PORT` | `3000` | Port for the website and API |
| `MONGODB_URI` | `mongodb://127.0.0.1:27017` | MongoDB connection string |
| `MONGODB_NAME` | `cck_hrpms` | Database name |
| `NODE_ENV` | `development` | Set to `production` when deploying |
| `APP_URL` | `http://localhost:3001` in development, `http://` + `BASE_URL` in production | Public address used in email links |
| `CORS_ORIGIN` | `http://localhost:3001` | Origins allowed to call the API from another address (development only) |
| `TRUST_PROXY` | empty | Set to `1` behind one reverse proxy, so login limits apply per visitor instead of to everyone |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASSWORD` | empty, `465` | SMTP provider for all email; used when `SMTP_HOST` is set |
| `EMAIL_USERNAME`, `EMAIL_PASSWORD` | empty | Gmail account and app password; used when `SMTP_HOST` is empty |
| `EMAIL_FROM` | the account above | Sender shown on emails |
| `APP_NAME` | CCK Group HR Performance Measure System | Name used in emails |
| `CHROME_BIN` | Puppeteer's own Chromium | Path to a system Chrome or Chromium for PDFs |
| `CLIENT_DIST_PATH` | `../client/dist` | Where the server finds the built website |

The built client calls `/api` on its own domain, which is the recommended setup. To host the API separately, set `VITE_API_URL` when running `npm run build` and add the website's address to `CORS_ORIGIN`. Both must be on the same site (for example `hr.example.com` and `api.example.com`), because browsers don't send the login cookie across different sites.

## Test data

[server/scripts/seed-mock-data.js](../server/scripts/seed-mock-data.js) adds the smallest set of records that lets you try every page as each role. It refuses to run with `NODE_ENV=production`.

```bash
# add mock data (replaces any earlier mock data)
npm run seed:mock

# remove only the mock data
npm run seed:mock:clear
```

Every mock account uses the password `Password123`:

| Role | Email | Name | Try |
|---|---|---|---|
| HR | `hr@mock.cck.test` | Nurul Aisyah binti Rahman | Surveys and their results, all appraisals |
| HOD | `hod@mock.cck.test` | Daniel Lee Chee Keong | Appraising the two employees in IT |
| Employee | `employee@mock.cck.test` | Aiman Hakim bin Zulkifli | Viewing and commenting on appraisals, answering the open survey |
| Employee | `employee2@mock.cck.test` | Priya a/p Ramasamy | An employee who has already answered the survey |

- **Structure**: 2 departments (Human Resources, Information Technology), 3 designations with their job grades, and the appraisal criteria for each.
- **Appraisals**: 5 across 2025 H2 and 2026 H1, graded A, B, B, C and C. One has an employee comment.
- **Survey**: one open survey with 3 questions, dated from a week before to two weeks after the day you seed, so it can always be answered.

The script records every inserted id in a `_mockseed` collection, so clearing removes exactly those records, any responses given to the mock survey while testing, and the PDFs generated for them. It never touches real data.

## Project layout

```
package.json                root scripts: dev, build, start, install:all, seed:mock
Dockerfile                  builds the client and server into one image
docker-compose.yml          the app plus MongoDB
docs/images/                screenshots used in the README (demo data)
client/                     React app (Vite, Tailwind CSS)
  src/App.jsx               page routes
  src/components/           pages and shared components
server/
  index.js                  startup: settings check, folders, default roles, static files, API
  constants.js              settings read from server/.env, with defaults
  bootstrap.js              default roles and permissions, first admin account
  .env.example              every setting, explained
  app/
    routes.js               every API endpoint and the permission it needs
    modules/                request handlers (users, appraisals, surveys, departments, ...)
    models/                 Mongoose schemas (RateLimit.js holds the login and reset limits)
    i18n.js                 server messages in English, Bahasa Melayu and Chinese
    functions.js            password hashing, tokens, CSV parsing, scoring, PDF generation
    mail-config.js          the email transport (SMTP or Gmail)
  resources/
    views/                  Handlebars templates for PDFs and emails
    public/                 logo and stylesheet used by those templates, served at /assets
  scripts/
    seed-mock-data.js       mock data for testing

produced at runtime:
client/dist/                the built website, from npm run build
server/resources/uploads/   uploaded files and generated PDFs
server/resources/logs/      log files
```

The original two-repository deployment (`server/Dockerfile`, `server/docker-compose.yml`, the GitHub Actions workflows in `server/.github` and `client/.github`, and the copy of the client build in `server/resources/public` and `server/resources/views/index.html`) has been removed. The root `Dockerfile` and `docker-compose.yml` replace it. `server/env.config.js` and `server/app/logger-config.js` are also left over from the original setup and are no longer loaded.

## Known issues

Nothing from the code review remains open. Points to be aware of:

- **Translations**: the Bahasa Melayu and Chinese server messages in [server/app/i18n.js](../server/app/i18n.js) haven't been checked by a native speaker yet.
- **Large lists**: some pages, such as the survey list and the top performers chart, load every matching record at once, which will slow down with thousands of records.

## Version history

- **v2 (current).** Reviewed and hardened, and made deployable by other people:
  - **Crashes**: async errors no longer stop the server, and invalid or expired login cookies return 401.
  - **Access control**: account editing, registration and CSV imports now need login and the right permission, and only a Super Admin can grant Super Admin.
  - **Passwords**: registered and CSV-imported users can log in, and passwords set by admins are hashed.
  - **Surveys**: logged-in employees can open surveys inside the app, and survey tokens are only issued for your own account.
  - **Roles**: employees can no longer create, edit or delete appraisals or manage surveys, and survey responses are private to the person who answered and to survey managers. Existing databases are updated once on startup.
  - **Appraisal access**: everyone sees only their own appraisals and the ones they reviewed; heads of department see and appraise only their department, and nobody can appraise themselves.
  - **Follow-up fixes**: login limits are stored in MongoDB, so they survive restarts and apply across servers; server messages follow the language chosen in Settings; the default HR role's `appraisal_table` typo is fixed (existing databases are updated once); and the unused `POST /api/attributes/add` and `POST /api/create-designation` endpoints are removed.
  - **Display fixes**: the dashboard's top performers rank people rather than appraisals, so nobody appears twice; long names no longer push the page title under the top bar; and appraisals show a formatted, labelled join date.
  - **Former known issues**: survey edits keep their responses, surveys can't be answered before they start, only a Super Admin can set someone's password, failed logins and reset emails are rate limited, reset tokens are stored hashed, searches treat typed text literally, imported CSVs are deleted after use, criteria delete on a standalone MongoDB, departments, designations, job grades and roles can't be deleted while in use, department dashboards show only that department, and the profile picture preview works again.
  - **Deployment**: the server serves the website again, creates its default roles on first start, has one email setup and one `APP_URL` for links, and comes with `.env.example`, Docker Compose and mock data.
- **Repository setup (August 2025).** The client and server were combined into this repository, and `server/index.js` was rewritten. The rewrite dropped three things the original did:
  - catching unhandled errors, so one malformed or expired login cookie then stopped the whole server;
  - creating the default roles on first run, so a fresh install could not create its first admin;
  - serving the website and the PDF template assets.
- **v1 (original).** The final-year project by Group 6 (Software Engineering, SUTS 2023), with the client and server in two repositories. GitHub Actions copied the client build into the server and published a Docker image. A review found that this version already had:
  - several endpoints, including editing any user's email, role or password, that needed no login at all;
  - users created by registration or CSV import whose passwords were hashed twice, so they could never log in;
  - an "Add user" action that reported an error even after creating the user.
