# Scripts Directory

This directory contains deployment and utility scripts for managing Google Apps Script deployments.

## 📁 Structure

```
scripts/
├── lib/
│   └── clasp-utils.js          # Shared utility functions for clasp operations
├── deploy.js                   # Main deployment script (updates versioned deployment)
├── deploy-interactive.js       # Interactive deployment with user prompts
├── deploy-with-env.js          # Deployment with .env file support
├── open-staging.js             # Opens @HEAD deployment in browser
├── open-prod.js                # Opens versioned deployment in browser
└── setup-rootdir.js            # Configures .clasp.json rootDir setting
```

## 🔧 Core Utilities (lib/clasp-utils.js)

Shared functions used across all deployment scripts:

### Deployment Management

- `getDeployments()` - Fetches all deployments from Apps Script
- `findHeadDeployment(deployments)` - Finds the @HEAD deployment
- `findVersionedDeployment(deployments)` - Finds the first versioned deployment
- `createDeployment()` - Creates a new versioned deployment
- `updateDeployment(deploymentId)` - Updates an existing deployment

### Web App Operations

- `openWebApp(deploymentId)` - Opens a deployment in the browser

### Shell Utilities

- `exec(command, options)` - Executes shell commands with error handling

## 📝 Script Descriptions

### `deploy.js`

Main deployment script for production releases.

- Finds the first versioned (non-@HEAD) deployment
- Updates it if exists, creates new if not
- Used by: `npm run prod`

### `deploy-interactive.js`

Interactive deployment with user selection.

- Lists all existing deployments
- Lets user choose which to update or create new
- Used by: `npm run prod:interactive`

### `deploy-with-env.js`

Environment-variable driven deployment.

- Reads `DEPLOYMENT_ID` from `.env` file
- Falls back to auto-detection if not set
- Useful for CI/CD pipelines

### `open-staging.js`

Opens the @HEAD deployment web app.

- Finds the @HEAD deployment automatically
- Opens it in the default browser
- Used by: `npm run staging:open`

### `open-prod.js`

Opens the versioned (production) deployment web app.

- Finds the same deployment that `deploy.js` updates
- Opens it in the default browser
- Used by: `npm run prod:open`

### `setup-rootdir.js`

Ensures `.clasp.json` has correct configuration.

- Sets `rootDir: "dist"` automatically
- Runs before every build via `prebuild` hook
- Provides helpful messages if `.clasp.json` is missing

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
