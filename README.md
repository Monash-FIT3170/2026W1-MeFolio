# 2026W1-MeFolio

## Team Members
* Sienna Howie - show0032@student.monash.edu
* Justin Sandoval - jsan0056@student.monash.edu
* Joy Jasmine Kaur - joyj0001@student.monash.edu
* Marcus Chan - mcha0202@student.monash.edu
* Jonah Rudzki - jrud0005@student.monash.edu
* Bilal Bahtiyar - bbah0004@student.monash.edu
* Lakshmi Meena Palaniappan- lpal0018@student.monash.edu
* Alaric Sim - asim0048@student.monash.edu
* Joyce Leung - jleu0009@student.monash.edu
* Elisa Puan - epua0001@student.monash.edu
* Sandrina Ghaniya - sgha0035@student.monash.edu
* Jashith Karna Kumar - jkar0027@student.monash.edu
* Muskan Gupta - mgup0019@student.monash.edu
* Harry Mills - hmil0014@student.monash.edu
* Venkata Ankit Kumar Kakanoor - vkak0003@student.monash.edu 

---

# Handover Documentation

This section provides essential information for future developers continuing work on the MeFolio project.

## System Requirements

### Software Requirements
- **Meteor**: The application pins `METEOR@3.4` in [mefolio/.meteor/release](mefolio/.meteor/release); use this release rather than assuming the latest version is compatible.
- **Node.js**: Docker and CI use Node 20. Use Meteor's bundled Node/npm for local app commands; review Node 20's security support and Meteor compatibility before future production releases.
- **Docker & Docker Compose v2**: Recommended for development, not required for the native Meteor option.
- **Git**: For version control

### Hardware Requirements
- **Minimum**: 4GB RAM, 10GB free disk space
- **Recommended**: 8GB RAM, 20GB free disk space (for Docker containers and node_modules)
- **Processor**: Modern multi-core processor (Docker containers benefit from multiple cores)

### Operating Systems
- **Windows**: Windows 10/11 with WSL2 or native Docker Desktop
- **macOS**: A version supported by the installed Docker Desktop and Meteor release
- **Linux**: Any modern distribution with Docker support

---

## Getting Started

### Quick Start with Docker (Recommended)

This is the recommended approach for development as it provides a consistent environment.

1. **Install Docker Desktop** from https://www.docker.com/products/docker-desktop

2. **Clone the repository** and navigate to the project directory:
   ```bash
   git clone <repository-url>
   cd 2026W1-MeFolio/mefolio
   ```

3. **Configure local settings, then start the Docker containers**:

   Copy [mefolio/server/oauth-login/oauth.settings.example.json](mefolio/server/oauth-login/oauth.settings.example.json) to `server/oauth-login/oauth.settings.json` inside `mefolio`. Supply authorised Google/GitHub credentials locally. The Dockerfile requires this settings file; never commit real secrets.
   
   **First time only** - build and start the containers:
   ```bash
   docker compose up --build
   ```
   This builds the images and starts both services. Initial Meteor downloads/builds may take several minutes.
   
   **Subsequent runs** - just start the containers (much faster):
   ```bash
   docker compose up
   ```

4. **Verify everything is running**:
   - Application: http://localhost:3000
   - MongoDB: Connect via MongoDB Compass using `mongodb://localhost:3001/meteor`
   - Check startup errors with `docker compose ps` and `docker compose logs --tail=100 app mongo`.

5. **Stop the containers** when finished developing:
   ```bash
   docker compose down
   ```
   To stop without removing containers: `docker compose stop`, then `docker compose start` to restart. Named volumes survive `down`; `down -v` deletes them, including the database.

   This Compose setup runs Meteor's development server, not a production deployment. See [docker.md](docker.md).

### Local Development (Without Docker)

If you prefer not to use Docker:

1. **Install Meteor**:
   ```bash
   curl https://install.meteor.com/ | sh
   ```

2. Meteor can start a local development MongoDB automatically. Install a separate MongoDB only if you intend to configure an external database with `MONGO_URL`.

3. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd 2026W1-MeFolio/mefolio
   ```

4. **Install dependencies**:
   ```bash
   meteor npm install
   ```

5. For an external database, start it and set `MONGO_URL` to its full connection string. Otherwise leave `MONGO_URL` unset to use Meteor's development database. Do not run native Meteor and Docker on port 3000 at the same time.

6. **Configure OAuth settings**: Copy the provided example to `server/oauth-login/oauth.settings.json` and add your Google/GitHub OAuth credentials and, if needed, a GitHub API token.

7. **Start the development server**:
   ```bash
   npm start
   ```

### Project Text-to-Audio (Piper)

Narration is generated server-side using a private, self-hosted
[Piper](https://github.com/OHF-Voice/piper1-gpl) service. There is no API key or
per-request billing; hosting still uses server resources. Generation requires
login and ownership of the supplied portfolio. Visitors do not receive scripts
or sample audio from this method.

#### Start Everything

Install and open Docker Desktop. From `mefolio`, run:

```powershell
docker compose up --build -d
docker compose ps
```

The first build installs Piper and downloads its voice model automatically;
it needs internet access and may take several minutes. Later starts reuse the
image. Wait for `piper` and `mongo` to show `healthy`, then open
http://localhost:3000. If Meteor is still starting, check `docker compose logs app`.
The app waits for Piper's readiness check before starting.

No Python installation, API key or Piper settings edit is needed. Compose sets
`PIPER_URL` automatically. Piper's port is not published to the host or internet.
Do not add a public port mapping: Piper itself has no authentication and may
retain the most recent script in its internal status endpoint.

If running Meteor without Docker, the service URL is resolved in this order:
`private.piper.url` in Meteor settings, `PIPER_URL` in the server environment,
then `http://127.0.0.1:5000/synthesize`. A separate Piper service must be running
for that workflow. Do not put models or narration samples in `public/`.

#### Manually Test Real Audio

There is no narration UI yet. This tests the real server method without editing
any app code:

1. Open http://localhost:3000 and log in as the portfolio owner. Open their
   portfolio editor so you know which portfolio you are testing.
2. Open browser developer tools (F12), select Console and run `Meteor.userId()`.
   Copy the returned user ID. It must not be `null`.
3. In a terminal in `mefolio`, run `docker compose exec mongo mongosh meteor`.
   At the Mongo shell prompt, paste this query with your actual user ID:
   ```js
   db.portfolios.find(
      { userId: "YOUR_USER_ID" },
      { _id: 1, title: 1 }
   ).toArray()
   ```
   Copy the `_id` for the portfolio you own. Type `exit` to leave the Mongo shell.
   If there are no results, create a portfolio in the app and repeat the query.
4. Back in the browser Console, paste the following using that portfolio ID:
   ```js
   var sampleAudioUrl = await Meteor.callAsync(
      "projects.generateNarration",
      "YOUR_PORTFOLIO_ID",
      "I built a portfolio website using React and Meteor."
   );
   var samplePlayer = new Audio(sampleAudioUrl);
   samplePlayer.controls = true;
   document.body.prepend(samplePlayer);
   ```
5. Click Play on the audio controls at the top of the page. You should hear the
   sentence. Using the Play control avoids browser autoplay restrictions.
6. Log out and repeat only the `Meteor.callAsync` call using the same portfolio
   ID. It must fail with `not-authorized`. Log in with a different account and
   repeat it: it must also fail. These checks must not generate audio.

Refresh the page to remove the temporary player. If synthesis fails, check
`docker compose ps` and `docker compose logs piper`. For a startup/network error,
ensure Docker Desktop is running and the `piper` service is healthy.

#### Automated Tests

With Meteor installed locally, run the focused mocked tests from `mefolio`:

```powershell
$env:MOCHA_GREP = "project narration"
$env:TEST_CLIENT = "0"
$env:TEST_SERVER = "1"
meteor test --once --driver-package meteortesting:mocha --port 3100
Remove-Item Env:MOCHA_GREP, Env:TEST_CLIENT, Env:TEST_SERVER
```

These verify ownership, validation, endpoint selection, failures and timeouts;
they do not require Piper or prove audible output. Use the manual test above
for real synthesis.

#### Integration Contract

From the authenticated portfolio owner's editor, call:

```js
const sampleAudioUrl = await Meteor.callAsync(
   "projects.generateNarration",
   portfolioId,
   narrationScript,
);
```

The result is a WAV data URL for the owner's private preview or downstream
storage. Plain text must contain 1-5,000 characters. It is read as-is, not
summarised. Scripts are sent only from the owner to Meteor and the private Piper
service; this tool does not store scripts, audio or change project records.

Permanent storage, publishing and playback remain separate team tasks. Store
scripts and sample audio in owner-only storage, not publicly published project
fields. Expose only approved final audio for public playback, without returning
the script or sample URLs. Public audio can still be transcribed by listeners.
Check Piper's GPL licence and the chosen voice model's licence before deployment.

### Available NPM Scripts

```bash
npm start                  # Start development server with OAuth settings
npm test                   # Run tests once
npm run test-app           # Run tests with full app context in watch mode
npm run test-ci            # Run tests with Puppeteer (CI environment)
npm run visualize          # Generate bundle visualizer for production build
npm run format             # Auto-format all files with Prettier
npm run lint               # Check for linting issues with ESLint
npm run lint:fix           # Fix linting issues automatically
```

Run these scripts from `mefolio`. CI uses `npm ci`, `npx prettier --check .`, `npm run lint`, and `bash scripts/run-ci-tests.sh`. The Bash test wrapper handles a known browser-test teardown hang and can terminate browser/database processes; run it only in an isolated CI environment, not on a shared production host.

---

## Project Structure Overview

```
mefolio/
├── client/                 # Client-side entry point and global styles
├── server/                 # Server-side code and publications
│   ├── oauth-login/       # GitHub OAuth configuration
│   ├── publications/      # Data publications (Meteor reactivity)
│   └── recruiter-tokens/  # Recruiter token management
├── imports/
│   ├── api/              # Meteor methods and collections
│   ├── models/           # Data models and view models
│   └── ui/              # React components organized by feature
│       ├── components/   # Reusable UI components
│       ├── Portfolio Builder/
│       ├── Portfolio Preview/
│       ├── Projects Editor/
│       ├── Login/
│       ├── Public/
│       ├── Recruiter/
│       └── Contexts/     # React Context providers
├── public/               # Static assets
├── private/              # Private server assets
└── _build/              # Build outputs (generated)
```

---

## OAuth Configuration

MeFolio supports **Google OAuth** and **GitHub OAuth**.

OAuth credentials are not committed to the repository.

The previous handover identifies a MeFolio admin account for provider administration. The successor must confirm authorised access and transfer account ownership securely; credentials and account recovery details must not be documented in Git.


### Local Development

Each developer creates:

    server/oauth-login/oauth.settings.json

using the provided example/template file:

    {
      "private": {
        "google": {
          "clientId": "YOUR_GOOGLE_CLIENT_ID",
          "secret": "YOUR_GOOGLE_CLIENT_SECRET"
        },
        "github": {
          "clientId": "YOUR_GITHUB_CLIENT_ID",
          "secret": "YOUR_GITHUB_CLIENT_SECRET",
          "apiToken": "YOUR_OPTIONAL_GITHUB_API_TOKEN"
        }
      }
    }

There is an existing .gitignore already to prevent committing OAuth credentials or secrets.

### Staging and Production

The previous handover reports credentials in **Meteor Galaxy Private Meteor Settings**. Confirm the current settings in the authorised Galaxy account; their live presence is not verified by the repository.

Prefer separate OAuth applications/credentials for development, staging and production. Configure the provider callbacks for each origin (`/_oauth/google` and `/_oauth/github`) and ensure `ROOT_URL` matches the public application URL.

The OAuth configuration code is located at:

    server/oauth-login/oauth.js

---

## Key Technologies

- **Meteor.js**: Full-stack JavaScript framework for real-time applications
- **React**: UI component library (v18.2.0)
- **MongoDB**: NoSQL database for data persistence
- **Tailwind CSS**: Utility-first CSS framework
- **Rspack**: Fast Rust-based bundler (replacing Webpack)
- **ESLint & Prettier**: Code quality and formatting tools
- **Mocha & Chai**: Testing framework and assertion library

## Developer Orientation and Production Risks

- [mefolio/server/main.js](mefolio/server/main.js) is the server entry point; [mefolio/client/main.jsx](mefolio/client/main.jsx) is the client entry point. [mefolio/tests/main.js](mefolio/tests/main.js) loads the test suite.
- Portfolio operations and indexes live in [mefolio/server/portfolio-methods.js](mefolio/server/portfolio-methods.js) and [mefolio/server/portfolio-indexes.js](mefolio/server/portfolio-indexes.js). Public data access is controlled by server publications; preserve ownership and publish-state checks when changing them.
- Recruiter-token generation/verification and owner visit notifications live under `mefolio/server/recruiter-tokens`. GitHub repository statistics are fetched by [mefolio/server/github-api.js](mefolio/server/github-api.js), including rate-limit/timeout handling.
- **Production blocker:** server startup creates a sample account with a fixed password and seeds sample data. Gate/remove production seeding and secure or remove the existing seeded account before public deployment. Startup must not recreate an insecure account.
- [mefolio/imports/api/files/resumeFiles.js](mefolio/imports/api/files/resumeFiles.js) stores PDF uploads in `uploads/resumes` and declares public downloads. Verify durable storage and privacy/access requirements; a database backup does not back up uploaded files. Ephemeral hosting filesystems must not be relied on for persistence.
- Do not commit OAuth settings, deployment settings, database URLs, user exports or backups. Use an authorised secret store and least-privilege account access.

---

## Common Issues & Troubleshooting

### Docker-Related Issues

**Issue**: "Cannot connect to Docker daemon"
- **Solution**: Ensure Docker Desktop is running. On Windows/Mac, start Docker Desktop. On Linux, run `sudo systemctl start docker`

**Issue**: "Port 3000 or 27017 already in use"
- **Solution**: 
   - Compose exposes host ports 3000 and 3001. Identify the conflicting service and stop it safely, or change the host port mapping in Compose.

### Meteor-Related Issues

**Issue**: "Cannot find module" or "Module not found" errors
- **Solution**: Run `meteor npm install` to ensure all dependencies are installed

**Issue**: "MONGO_URL connection refused"
- **Solution**: 
  - Check MongoDB is running: `mongosh --eval "db.adminCommand('ping')"`
  - Verify connection string in environment variables
  - For Docker: Ensure mongo service is running with `docker compose ps`

**Issue**: Application won't hot-reload on file changes
- **Solution**: This is often related to file watchers. The docker-compose.yml sets `METEOR_WATCH_FORCE_POLLING: "true"` to handle this

### GitHub OAuth Issues

**Issue**: "OAuth settings not found" or OAuth login fails
- **Solution**: 
  - Ensure `server/oauth-login/oauth.settings.json` exists and contains valid credentials
  - Check GitHub OAuth app is properly configured in GitHub Settings
  - Verify `ROOT_URL` matches your OAuth app's authorized redirect URI

**Issue**: "Cannot POST /oauth/login"
- **Solution**: Verify oauth.settings.json is correctly formatted JSON without syntax errors

### Performance Issues

**Issue**: Application runs slowly or Docker uses excessive CPU
- **Solution**: 
  - Restart Docker: `docker compose restart`
  - Check for infinite loops in React components using React DevTools
  - Review MongoDB query performance using MongoDB Compass

**Issue**: node_modules folder is very large (>500MB)
- **Solution**: This is normal for Meteor/Node.js projects. The docker-compose.yml keeps this in a separate volume to avoid syncing to host machine

### Database Issues

**Issue**: Database data is lost after restarting containers
- **Solution**: Verify that `mongo_data` persists in Compose and that you are using the same Compose project/volume. Data survives `docker compose down`; `docker compose down -v` deletes it.

**Issue**: "Duplicate key error" or database constraint violations
- **Solution**: Inspect the conflicting record/index and resolve the inconsistency with an authorised, backed-up data change. Do not delete the database as a routine troubleshooting step.

### Windows-Specific Meteor Issues

**Issue**: "Can't create '\\\\?...\\\\.bin\\semver': Invalid argument" and tar extraction errors when running meteor
- **Root Cause**: Windows MAX_PATH limitation combined with Meteor's deep package tree, and symlink creation requiring elevated permissions
- **Solution**:
  1. Enable long paths (requires Admin rights and PC restart):
     ```powershell
     New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
     ```
  2. Restart your PC
  3. Run installer/commands as Administrator: Open PowerShell as Admin and run `npx meteor` so symlinks can be created

**Issue**: Meteor command not found in PATH
- **Solution**: Add Meteor to your user PATH (PowerShell as Admin):
  ```powershell
  $new = "C:\Users\$env:USERNAME\AppData\Local\.meteor;" + [Environment]::GetEnvironmentVariable("Path","User")
  [Environment]::SetEnvironmentVariable("Path",$new,"User")
  ```
  Then open a new terminal and verify with: `meteor --version`

**Issue**: Symlink creation fails during installation
- **Solution**: Run PowerShell as Administrator and try again. Meteor requires elevated permissions to create symlinks on Windows.

Prefer Docker Desktop with WSL2 on Windows to avoid native path/symlink issues. For current release-specific guidance, see the [Meteor Installation Docs](https://docs.meteor.com/about/install.html).

---

## Deployment & CI/CD

### Continuous Integration (GitHub Actions)

The project uses GitHub Actions for PRs targeting `main` or `dev`. Two checked-in workflows run automatically:

1. **Linting and Formatting Check** - Verifies code follows project standards
2. **Test Suite Check** - Runs all unit and integration tests

**Required strategy**: All checks must pass before merging. The repository administrator must enable branch protections/required checks in GitHub; those settings cannot be verified from workflow files alone.

#### Resolving Failing CI

1. Navigate to the **Checks** tab in your PR
2. Review error logs to identify the issue
   - *Tip*: Use GitHub Copilot's 'Explain Error' button if you're stuck
3. If logs do not identify the issue, ask the appointed maintainer and provide the failing job/commit reference.

#### Known Issue: Hidden Client Test Failures

Sometimes the CI test runner shows "CLIENT FAILURES: 1" without displaying the error. To debug locally:

1. In your local terminal, run:
   ```bash
   meteor test --driver-package meteortesting:mocha
   ```
2. Open `localhost:3000` as prompted in the terminal
3. Inspect the page using browser DevTools (F12)
4. Check the **Console** tab - client test failures will be displayed there

### Deployment Strategy

Staging and production are hosted on Meteor Galaxy, with `dev` intended for staging and `main` for production. The MongoDB database is also hosted through Meteor Galaxy. The Galaxy account logs in with the MeFolio admin email; billing is currently on an outgoing team member's card and is handed over by adding the incoming owner's company card to that account, then removing the outgoing card. As agreed with the tutor (12 Oct 2026), the incoming owner is not named in advance (see [MAINTENANCE_PLAN.md](MAINTENANCE_PLAN.md#billing-handover)). Confirm live app URLs and database backup settings in the Galaxy dashboard. The checked-in workflows only test/lint; automatic deployment is not established by this repository.


#### Staging Environment
- Intended release source: the `dev` branch
- Confirm any external deployment triggers before merging; do not assume a merge deploys
- Use this to test feature integration before milestone completion
- URL and access details available in team resources

#### Production Environment
- Intended release source: the reviewed and tagged `main` branch
- Deploy only after release approval, passing checks and a verified backup
- The 'polished' version of MeFolio available to end users

*Note*: During local feature development, continue using Docker and `localhost:3000`

### Accessing the Deployed Database

Obtain an authorised, least-privilege connection string from the incoming owner's secret store, not a public document or an old chat link. Use the provider's required TLS configuration with certificate validation enabled. Do not disable certificate validation as standard practice, and do not use production data for local testing without approval.

### Manual Galaxy Deployment Runbook

This is the proposed deployment procedure; the outgoing owner must supply the actual environment identifiers and verify it in staging. No live deployment was performed for this documentation update.

1. Resolve the production risks listed above. Confirm durable resume storage, OAuth callbacks, database connectivity and the runtime supported by Meteor 3.4/Galaxy.
2. Check out the approved `dev` commit for staging, or the release tag from `main` for production, in a clean checkout. Run `meteor npm ci` from `mefolio`, then require passing PR CI.
3. Back up MongoDB and uploaded resumes. Record the previous working release and any migration/recovery steps.
4. Authenticate to the authorised Meteor/Galaxy account. Obtain private environment settings securely outside the repository. Include `private.google` and `private.github` settings as needed, plus the provider-required database/runtime configuration. Configure `MONGO_URL` and the public URL through the host's supported settings/environment mechanism.
5. From `mefolio`, use the actual app hostname and settings path:

   ```sh
   meteor deploy <galaxy-app-hostname> --settings <secure-settings-file.json>
   ```

   Use the organisation's regional deployment endpoint if required by Galaxy. The hostname, endpoint and billing authority must be confirmed with the owner; this command must not be run against an unapproved app.
6. Inspect deployment/build logs and check HTTPS availability, Google/GitHub login, portfolio editing/publishing, draft privacy, public portfolio rendering, recruiter-token expiry/access, visit notifications, GitHub sync and resume upload/download persistence.
7. Record the deployed tag, time, operator and check results in the release notes. If checks fail, stop further rollout and redeploy the last verified release; restore data/files only under the approved recovery plan.

After Week 12, follow [MAINTENANCE_PLAN.md](MAINTENANCE_PLAN.md): hosting requires an accepting owner and payer; otherwise use a controlled shutdown. Former students have no ongoing support or funding obligation.

## Versioning Strategy

Adopt Semantic Versioning (`MAJOR.MINOR.PATCH`) for future approved releases:

- `MAJOR`: incompatible changes to public behaviour, data contracts or deployment requirements.
- `MINOR`: backward-compatible functionality.
- `PATCH`: backward-compatible bug/security fixes.

Use annotated Git tags such as `v1.0.0` on approved `main` commits and `v1.1.0-rc.1` for release candidates. These are examples, not claims that those releases already exist. Before the first tag, inspect existing tags and agree the initial version. The application package currently has no `version` field; if package metadata is adopted as a version source, add it intentionally and keep it aligned with tags.

Publish GitHub release notes describing changes, known issues, dependency/runtime changes, data migrations and rollback instructions. A code rollback is not necessarily a data rollback; document compatibility and backup requirements before schema changes.

## Pull Request Strategy

1. Find/create a GitHub issue and agree scope with the appointed maintainer. If no maintainer exists, a PR may be proposed but cannot imply review, support or release commitments.
2. Create a focused branch from up-to-date `dev`, for example `feature/<issue>-summary` or `fix/<issue>-summary`. External contributors should fork if they lack write access. Do not push directly to `main` or `dev`.
3. Implement the change, add relevant tests and update affected documentation. Keep secrets and unrelated generated output out of the diff.
4. From `mefolio`, run tests, lint and a formatting check. Push the branch and open a PR targeting `dev`; copy [pull_request_template.md](pull_request_template.md) into the description because the root filename does not establish automatic GitHub template loading.
5. Include the issue reference, change summary, test evidence, screenshots for UI changes, risks/migrations/rollback, and the extent of Generative AI use (explicitly state none if not used).
6. Require at least one code owner review (see [.github/CODEOWNERS](.github/CODEOWNERS)), passing test/lint/format checks and resolved review comments before merge. Prefer squash-merging feature PRs; the administrator should enforce required checks/reviews through branch protection.
7. Release via a reviewed `dev` to `main` PR, tag the approved commit and follow the deployment runbook. Urgent production fixes may target `main` with the same review/check requirements, then be brought back into `dev`.

---

## Development Workflow

1. **Before starting work**:
   - Pull latest changes: `git pull`
   - Install any new dependencies: `meteor npm install`

2. **While developing**:
   - Use `npm run lint:fix` to auto-fix linting issues
   - Use `npm run format` to maintain code style
   - Run `npm test` frequently to catch issues early

3. **Before committing**:
   - Run `npm run format` and `npm run lint:fix`
   - Run `npm test` to ensure tests pass
   - Follow the PR template in `pull_request_template.md`

4. **Code Quality Standards**:
   - Use Tailwind CSS variables from `styles.css` (no hardcoded values)
   - Avoid large components - break into smaller reusable pieces
   - Write tests for new features when applicable
   - Clean up stale code and unused comments

---

## Useful Resources

- **Meteor Documentation**: https://docs.meteor.com/
- **React Documentation**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **MongoDB Documentation**: https://docs.mongodb.com/
- **Docker Documentation**: https://docs.docker.com/

---

## Contact & Support

For questions about specific features or issues:
- Check existing GitHub issues for similar problems
- Review inline code comments and JSDoc documentation
- Code maintainers: Joy Jasmine Kaur (@JkGiThuB821), Jonah Rudzki (@jonahrudzki) and Joyce Leung (@jyc-leung02). They are listed in [.github/CODEOWNERS](.github/CODEOWNERS), so GitHub requests their review on every PR.
- The rest of the team list is historical attribution, not a commitment to support after Week 12.

---
