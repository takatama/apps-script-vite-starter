# Scripts Directory

This directory contains deployment and utility scripts for managing Google Apps Script deployments.

## 📁 Structure

```
scripts/
├── lib/
│   └── clasp-utils.js          # Shared utility functions for clasp operations
├── deploy.js                   # Updates existing production deployment
├── deploy-new.js               # Recreates production deployment from scratch
├── open-staging.js             # Opens @HEAD deployment in browser
├── open-prod.js                # Opens production deployment in browser
├── setup-rootdir.js            # Configures .clasp.json rootDir setting
└── update-env.js               # Updates .env with current deployment IDs
```

## 🔧 Core Utilities (lib/clasp-utils.js)

Shared functions used across all deployment scripts:

### Environment Configuration

- `loadEnv()` - Loads `.env` file and parses key-value pairs
- `saveEnv(env)` - Saves environment variables to `.env` file
- `getDeploymentId(envKey, findFn)` - Gets deployment ID from `.env` or auto-detects and saves
- `updateDeploymentIds()` - Updates `.env` with current deployment IDs (staging & production)

### Deployment Management

- `getDeployments()` - Fetches all deployments from Apps Script
- `findHeadDeployment(deployments)` - Finds the @HEAD deployment
- `findVersionedDeployment(deployments)` - Finds the first versioned deployment (production)
- `createDeployment()` - Creates a new versioned deployment
- `updateDeployment(deploymentId)` - Updates an existing deployment
- `deleteDeployment(deploymentId)` - Deletes a deployment
- `recreateProductionDeployment()` - Deletes all versioned deployments and creates a new one

### Web App Operations

- `openWebApp(deploymentId)` - Opens a deployment in the browser

### Shell Utilities

- `exec(command, options)` - Executes shell commands with error handling

## 🔐 Environment Configuration

Deployment IDs are stored in `.env` for fast access and persistence:

### Setup

```bash
# .env.example is provided as a template
cp .env.example .env
```

### Auto-Detection

All scripts automatically detect and save deployment IDs on first use:

- **STAGING_DEPLOYMENT_ID**: Automatically populated when staging deployment exists
- **PROD_DEPLOYMENT_ID**: Automatically populated when production deployment exists

### Manual Configuration

You can manually set deployment IDs in `.env`:

```bash
STAGING_DEPLOYMENT_ID=AKfycbx...
PROD_DEPLOYMENT_ID=AKfycby...
```

### Automatic Updates

Deployment IDs are automatically updated:

- After every `npm run build` (via `postbuild` hook)
- After `npm run prod:new` (when production is recreated)

## 📝 Script Descriptions

### `deploy.js`

Main deployment script for production releases.

- Gets production deployment ID from `.env` (auto-detects if not set)
- Updates it if exists, creates new if not
- **Constraint**: Assumes only one production deployment exists
- Used by: `npm run prod`

### `deploy-new.js`

Recreates production deployment from scratch.

- Deletes all existing versioned deployments
- Creates a fresh production deployment
- Use this when you want to reset the production deployment
- Used by: `npm run prod:new`

### `open-staging.js`

Opens the @HEAD deployment web app.

- Gets staging deployment ID from `.env` (auto-detects if not set)
- Opens it in the default browser
- Used by: `npm run staging:open`

### `open-prod.js`

Opens the versioned (production) deployment web app.

- Gets production deployment ID from `.env` (same as `deploy.js`)
- Opens it in the default browser
- Used by: `npm run prod:open`

### `setup-rootdir.js`

Ensures `.clasp.json` has correct configuration.

- Sets `rootDir: "dist"` automatically
- Runs before every build via `prebuild` hook
- Provides helpful messages if `.clasp.json` is missing

### `update-env.js`

Updates `.env` with current deployment IDs.

- Runs automatically after every build via `postbuild` hook
- Synchronizes `.env` with latest deployment IDs
- Silently fails if deployments don't exist yet (e.g., first build)

## 🔄 Maintenance

When adding new deployment-related functionality:

1. **Add shared logic to `lib/clasp-utils.js`**

   - Keep it simple and focused
   - Add JSDoc comments
   - Export as named functions

2. **Create focused scripts**

   - Import from `clasp-utils.js`
   - Keep business logic minimal
   - Provide clear error messages

3. **Update this README**
   - Document the new script's purpose
   - Explain when it should be used
   - Add to the npm scripts in package.json

## 🧪 Testing

To test scripts without deploying:

```bash
# Dry run - see what would happen
node scripts/deploy.js --dry-run  # (if implemented)

# List deployments
npm run deployments

# Manually test utility functions
node -e "import('./scripts/lib/clasp-utils.js').then(m => console.log(m.getDeployments()))"
```

## 🐛 Debugging

Enable verbose output:

```bash
DEBUG=1 npm run prod
```

View raw deployment data:

```bash
clasp list-deployments --json | jq
```
