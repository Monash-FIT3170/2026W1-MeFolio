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
- **Node.js**: v18.x or higher (required for Meteor)
- **Meteor**: Latest stable version (installed via `curl https://install.meteor.com/ | sh`)
- **Docker & Docker Compose**: Required for development
- **Git**: For version control

### Hardware Requirements
- **Minimum**: 4GB RAM, 10GB free disk space
- **Recommended**: 8GB RAM, 20GB free disk space (for Docker containers and node_modules)
- **Processor**: Modern multi-core processor (Docker containers benefit from multiple cores)

### Operating Systems
- **Windows**: Windows 10/11 with WSL2 or native Docker Desktop
- **macOS**: macOS 10.14+
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

3. **Start the Docker containers**:
   
   **First time only** - build and start the containers:
   ```bash
   docker compose up --build
   ```
   This will build the images and start all services (may take 2-3 minutes).
   
   **Subsequent runs** - just start the containers (much faster):
   ```bash
   docker compose up
   ```

4. **Verify everything is running**:
   - Application: http://localhost:3000
   - MongoDB: Connect via MongoDB Compass using `mongodb://localhost:27017`

5. **Stop the containers** when finished developing:
   ```bash
   docker compose down
   ```
   To pause instead of stopping (faster restart): `docker compose stop`

### Local Development (Without Docker)

If you prefer not to use Docker:

1. **Install Meteor**:
   ```bash
   curl https://install.meteor.com/ | sh
   ```

2. **Install MongoDB**: Download from https://www.mongodb.com/try/download/community

3. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd 2026W1-MeFolio/mefolio
   ```

4. **Install dependencies**:
   ```bash
   meteor npm install
   ```

5. **Start MongoDB** (ensure it's running on port 27017)

6. **Configure OAuth settings**: Copy `server/oauth-login/oauth.settings.example.json` to `server/oauth-login/oauth.settings.json` and add your GitHub OAuth credentials

7. **Start the development server**:
   ```bash
   npm start
   ```

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

## Key Technologies

- **Meteor.js**: Full-stack JavaScript framework for real-time applications
- **React**: UI component library (v18.2.0)
- **MongoDB**: NoSQL database for data persistence
- **Tailwind CSS**: Utility-first CSS framework
- **Rspack**: Fast Rust-based bundler (replacing Webpack)
- **ESLint & Prettier**: Code quality and formatting tools
- **Mocha & Chai**: Testing framework and assertion library

---

## Common Issues & Troubleshooting

### Docker-Related Issues

**Issue**: "Cannot connect to Docker daemon"
- **Solution**: Ensure Docker Desktop is running. On Windows/Mac, start Docker Desktop. On Linux, run `sudo systemctl start docker`

**Issue**: "Port 3000 or 27017 already in use"
- **Solution**: 
  - Kill existing processes: `lsof -ti:3000 | xargs kill -9` (macOS/Linux)
  - Or modify docker-compose.yml to use different ports

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
- **Solution**: Verify that `mongo_data` volume persists in docker-compose.yml. Data should survive restarts unless `docker compose down` is used

**Issue**: "Duplicate key error" or database constraint violations
- **Solution**: Clear the database and restart: `docker compose down -v && docker compose up -d`

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

For additional help, see the [Meteor Installation Docs](https://v2-docs.meteor.com/install)

---

## Deployment & CI/CD

### Continuous Integration (GitHub Actions)

The project uses GitHub Actions for automated testing and linting on every PR. Two workflows run automatically:

1. **Linting and Formatting Check** - Verifies code follows project standards
2. **Test Suite Check** - Runs all unit and integration tests

**Important**: PRs cannot be merged unless all checks pass.

#### Resolving Failing CI

1. Navigate to the **Checks** tab in your PR
2. Review error logs to identify the issue
   - *Tip*: Use GitHub Copilot's 'Explain Error' button if you're stuck
3. If no visible error logs appear, contact an SA for assistance

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

The project has two deployed environments:

#### Staging Environment
- Automatically deployed from the `dev` branch
- Updated with each merged PR into `dev`
- Use this to test feature integration before milestone completion
- URL and access details available in team resources

#### Production Environment
- Automatically deployed from the `main` branch
- Updated at end-of-sprint/milestone when `dev` is merged into `main`
- The 'polished' version of MeFolio available to end users

*Note*: During local feature development, continue using Docker and `localhost:3000`

### Accessing the Deployed Database

To access the staging MongoDB database while testing:

1. Open MongoDB Compass and click **Add Connection**
2. Paste the connection string from the #important-info channel in Discord (pinned by Jonah)
3. In **Advanced Connection Options**:
   - Set **TLS/SSL** to **On**
   - Check **tlsAllowInvalidCertificates** to **True**
4. Click **Save & Connect**

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
- Refer to the original team members listed above for contextual knowledge

---
