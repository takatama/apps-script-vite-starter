# Apps Script + Vite Starter Template

A minimalist template for building simple, static web pages and deploying them as Google Apps Script web apps. It uses Vite for fast, efficient builds with zero unnecessary complexity.

Perfect for quickly creating web interfaces, landing pages, or dashboards on Google's free infrastructure without complex frameworks or server setup.

## ✨ Features

- **Zero Framework:** Plain HTML and CSS—no unnecessary dependencies.
- **Fast Build Tooling:** Powered by Vite for optimized development and production builds.
- **Effortless Deployment:** Deploy as a free web app on Google's infrastructure using `clasp`.
- **Mock google.script.run:** Develop locally with automatic mock data—works exactly like the real API.
- **GitHub Ready:** Pre-configured as a template repository for instant setup.

---

## 🚀 Quick Start

Get your web app live in minutes. Follow these five simple steps.

### Prerequisites

Before you begin, ensure you have:

- **Node.js** (latest LTS version recommended)
- **clasp** (3.x or later) installed and authenticated:
  ```bash
  npm install -g @google/clasp
  clasp login
  ```

> Note: clasp requires Node.js 22.0.0 or later. Check your version with `node -v`.

### 5 Steps to Deploy

**Step 1: Create Your Project**

Use the "Use this template" button on GitHub, then clone it locally:

```bash
git clone https://github.com/your-username/your-new-repo.git
cd your-new-repo
```

**Step 2: Install Dependencies**

```bash
npm install
```

**Step 3: Connect to Apps Script**

Choose one of the following options:

**Option A: Create a new project**

```bash
clasp create-script --type webapp --title "MyViteWebApp"
```

(Other types: `sheets`, `docs`, `slides`, `forms`, `standalone`)

**Option B: Clone an existing project**

```bash
clasp clone-script YOUR_SCRIPT_ID
```

Both commands create `.clasp.json`. The first build automatically adds `rootDir: "dist"` via the `prebuild` hook.

> **Advanced**: You can set `rootDir` immediately with `clasp create-script --rootDir dist` or manually edit `.clasp.json`.

**Step 3.5: Initialize Deployment Configuration (First Time Only)**

After creating or cloning your Apps Script project, push once to create deployments, then initialize the `.env` file:

```bash
npm run stg          # Create @HEAD deployment
npm run prod             # Create production deployment
npm run update-env       # Save deployment IDs to .env
```

This one-time setup stores deployment IDs in `.env` for faster subsequent operations. The `.env` file is git-ignored and contains:

```bash
STAGING_DEPLOYMENT_ID=AKfycbz...
PROD_DEPLOYMENT_ID=AKfycby...
```

> **Note**: If you skip this step, deployment IDs will be auto-detected on first use, but running `update-env` explicitly is recommended for clarity.

**Step 4: Deploy to Staging**

Bundle your code and upload to the staging (@HEAD) environment:

```bash
npm run stg
```

> If prompted to overwrite the manifest, answer `yes`.

Open the staging web app in your browser:

```bash
npm run stg:open
```

**Step 5: Deploy to Production**

When ready for production, deploy to the versioned environment:

```bash
npm run prod
```

Open the production web app in your browser:

```bash
npm run prod:open
```

✅ Done! Your web app is now live.

---

### Local Development

Develop locally with live reload and mock data:

```bash
npm run dev          # Start Vite dev server
npm run dev:open     # Start Vite dev server and open in browser
```

---

## 🔄 Deployment Workflow

This template uses a three-tier deployment strategy:

### **Development (Local)**

Local development with Vite dev server and mock data:

```bash
npm run dev          # Start local server at http://localhost:5173
npm run dev:open     # Start and automatically open in browser
```

- **Environment**: Local machine
- **Use case**: Active development with hot reload
- **Data**: Uses mock data from `src/lib/googleScriptRunMockData.js`

### **Staging (@HEAD Deployment)**

The `@HEAD` deployment is automatically updated when you push. Use this for testing with real Apps Script:

```bash
npm run stg        # Build and push to @HEAD
npm run stg:open   # Open staging web app in browser
```

- **URL**: Ends with `.../dev`
- **Environment**: Google Apps Script @HEAD
- **Use case**: Quick testing with real backend
- **Updates**: Instant (no version creation needed)

### **Production (Versioned Deployment)**

Production uses a single versioned deployment for stable releases:

```bash
npm run prod           # Build, push, and update production deployment
npm run prod:open      # Open production web app in browser
```

- **URL**: Ends with `.../exec`
- **Environment**: Google Apps Script versioned deployment
- **Use case**: Production releases for end users
- **Updates**: Creates or updates the production deployment
- **Constraint**: Only one production deployment is maintained

#### Additional Production Commands

```bash
npm run prod:new        # Recreate production deployment from scratch
npm run deployments     # List all deployments
npm run update-env      # Manually update .env with current deployment IDs
```

### **Deployment Configuration (.env)**

Deployment IDs are stored in `.env` for performance:

```bash
STAGING_DEPLOYMENT_ID=AKfycbz...
PROD_DEPLOYMENT_ID=AKfycby...
```

**When to run `npm run update-env`:**

- After creating a new Apps Script project (`clasp create-script`)
- After cloning an existing project (`clasp clone-script`)
- After recreating production deployment (`npm run prod:new`)
- When deployment IDs change (rare)

**Auto-detection:**
If `.env` is missing or empty, deployment IDs are automatically detected and saved on first use. Running `update-env` explicitly is recommended for clarity.

**Git:**
`.env` is git-ignored. Use `.env.example` as a template for new clones.

### **Typical Workflow**

```bash
# 1. Develop and test locally
npm run dev:open

# 2. Push to staging for testing with real backend
npm run stg
npm run stg:open     # Test in browser

# 3. When ready for production, deploy versioned release
npm run prod
npm run prod:open        # Verify production deployment

# 4. Share the production URL (ends with .../exec) with users
```

---

## � Using google.script.run API

This template includes a `googleScriptRun` wrapper that works exactly like the official `google.script.run` API, but automatically uses mock data during local development.

### Quick Example

```javascript
import { googleScriptRun } from "./lib/googleScriptRun.js";

// Method 1: Async/await (modern approach)
const users = await googleScriptRun.getUserList();

// Method 2: Callbacks (traditional google.script.run way)
googleScriptRun
  .withSuccessHandler((data) => console.log(data))
  .withFailureHandler((error) => console.error(error))
  .getUserList();
```

### Key Benefits

- **Identical API**: Works exactly like `google.script.run`—no learning curve
- **Auto-detection**: Automatically switches between mock and production
- **Dual Style**: Supports both callback and async/await styles
- **Local Development**: Test your UI without deploying to Apps Script

### Adding Mock Data

Edit `src/lib/googleScriptRunMockData.js` to add mock responses for your server functions:

```javascript
export const mockData = {
  getUserList: [
    { id: 1, name: "Alice", email: "alice@example.com" },
    { id: 2, name: "Bob", email: "bob@example.com" },
  ],

  saveData: (data) => ({
    success: true,
    message: "Data saved successfully",
  }),
};
```

📖 **See [GOOGLE_SCRIPT_RUN_API.md](GOOGLE_SCRIPT_RUN_API.md) for detailed documentation and examples.**

---

## �📥 Clone an Existing Apps Script Project

Already have a Google Apps Script project you'd like to bring into this template? No problem. Follow these steps.

### Prerequisites for Cloning

You'll need:

- Your Apps Script project's **Script ID** (found in the Google Apps Script editor URL: `script.google.com/home/projects/{SCRIPT_ID}/edit`)
- This repository cloned and dependencies installed (steps 1–2 from Quick Start above)

### Cloning Steps

**Step 1: Clone This Repository**

```bash
git clone https://github.com/your-username/your-repo.git
cd your-repo
npm install
```

**Step 2: Link Your Existing Apps Script Project**

Using your Script ID:

```bash
clasp clone-script {SCRIPT_ID}
```

Alternatively, if you already have a `.clasp.json` file, pull the existing code:

```bash
clasp pull
```

**Step 3: Organize Files into the Template Structure**

After cloning, `clasp` will create several files in your project root. You need to reorganize them:

```bash
# Files created by clasp clone-script:
# - appsscript.json
# - index.html (if exists)
# - Code.js (or similar .js/.gs files)

# 1. Move appsscript.json to apps-script folder
mv appsscript.json apps-script/

# 2. Move any .js/.gs server code to apps-script folder
mv Code.js apps-script/
# (repeat for other server-side .js/.gs files)

# 3. If there's an HTML file, move it to src/
mv index.html src/
# (or integrate it with the existing src/index.html)

# 4. Remove any unwanted server files that conflict with template
# rm apps-script/Code.js  # if you want to use the template's Code.js instead
```

Organize your code according to this template's structure:

- **Apps Script server code** → `apps-script/` (e.g., `doGet()`, `doPost()`, utilities)
- **HTML UI** → `src/index.html`

**Step 4: Build and Upload**

```bash
npm run build && clasp push
```

**Step 4: Initialize Deployment Configuration**

After organizing files, initialize the `.env` configuration:

```bash
npm run stg          # Create/update @HEAD deployment
npm run prod             # Create production deployment
npm run update-env       # Save deployment IDs to .env
```

This ensures deployment IDs are cached for faster subsequent operations.

### Checking for Differences

To sync the latest code from Google Apps Script:

```bash
clasp pull
```

---

## 🔄 Workflows

### Create a New Project

Use `clasp create-script` to bootstrap a fresh Apps Script project:

```bash
clasp create-script --type webapp --title "MyWebApp"
npm run stg           # Deploy to staging
npm run prod              # Create first production deployment
npm run update-env        # Save deployment IDs to .env (recommended)
```

### Continue Developing an Existing Project

```bash
clasp clone-script {SCRIPT_ID}  # or: clasp pull
npm install
npm run dev:open          # Local dev server
npm run stg           # Deploy to staging
npm run stg:open      # Test staging deployment
npm run prod              # Deploy to production
npm run prod:open         # Open production deployment
```

### Manual Deployment Commands

If you need fine-grained control, use clasp directly:

```bash
clasp list-deployments                                    # List all deployments
clasp create-deployment                                   # Create new versioned deployment
clasp update-deployment {DEPLOYMENT_ID}                   # Update specific deployment
clasp update-deployment {DEPLOYMENT_ID} --versionNumber {VERSION}  # Deploy specific version
```

---

## 📚 Project Structure

```
src/
├── index.html                      # Main UI file
├── style.css                       # Styles
├── main.js                         # Application entry point
└── lib/
    ├── googleScriptRun.js          # google.script.run wrapper with mock support
    └── googleScriptRunMockData.js  # Mock data for local development

apps-script/
├── appsscript.json         # Apps Script manifest
└── Code.js                 # Server-side Apps Script code (doGet, doPost, etc.)

public/                     # Static assets (copied as-is)
dist/                       # Bundled files for deployment (generated)
.clasp.json                 # clasp configuration (created by clasp create-script/clone-script)
vite.config.js              # Vite build configuration
```

> **Note**: After `clasp clone-script`, you'll need to move files from the root directory into their proper locations within this structure.

---

## 📖 Tips & Tricks

### Development & Testing

- **Local Development:** Use `npm run dev:open` to develop with mock data and live reload
- **Mock Data:** Add your own mock responses in `src/lib/googleScriptRunMockData.js` for any server functions you create. This allows full client-side development without deploying to Apps Script.
- **Faster iterations:** Develop locally with `npm run dev`, then test with real backend using `npm run stg`

### Deployment Management

- **Three Environments:**
  - **Development (local)**: `npm run dev` / `npm run dev:open` - Local Vite server with mock data
  - **Staging (@HEAD)**: `npm run stg` / `npm run stg:open` - Quick testing with real Apps Script backend (`.../dev` URL)
  - **Production (versioned)**: `npm run prod` / `npm run prod:open` - Stable releases for end users (`.../exec` URL)
- **Quick Testing:** Use `npm run stg` to update @HEAD instantly without creating versions
- **Production Release:** Use `npm run prod` to update your production deployment
- **Production Constraint:** Only one production deployment is maintained for simplicity
- **Reset Production:** Use `npm run prod:new` to recreate production deployment from scratch
- **View Deployments:** Run `npm run deployments` to see all active deployments

### Other Tips

- **Auto-open Browser:** Use `:open` suffix (`dev:open`, `stg:open`, `prod:open`) to automatically open in browser
- **Environments:** Use `.env.local` for local variables (not committed to git)
- **Debugging:** Open your web app URL and use the browser console for client-side errors. In local dev mode, check the console for mock data messages.
- **Enable APIs:** Use `clasp enable-api {apiName}` if your script needs access to Google services

---

## 🛠️ Troubleshooting

### Node.js Version

Clasp 3.x requires **Node.js 22.0.0 or later**. Check your version:

```bash
node -v
```

If you need to update Node.js:

```bash
npm install -g npm
npx n latest  # Uses the 'n' package to update Node
```

### Common clasp Commands (3.x)

The `clasp` CLI was updated in version 3.x. Here are the most commonly renamed commands:

| 2.x                | 3.x                       |
| ------------------ | ------------------------- |
| `clasp create`     | `clasp create-script`     |
| `clasp clone`      | `clasp clone-script`      |
| `clasp open`       | `clasp open-script`       |
| `clasp open --web` | `clasp open-web-app`      |
| `clasp deploy`     | `clasp create-deployment` |

See the [clasp documentation](https://github.com/google/clasp) for the full list of commands.

---

## 📝 License

This template is open-source and available for personal and commercial use.

---

## ❓ Support

For issues with:

- **clasp:** See the [official clasp documentation](https://github.com/google/clasp)
- **Vite:** Check the [Vite docs](https://vitejs.dev)
- **Apps Script:** Review the [Google Apps Script guide](https://developers.google.com/apps-script)

```


```
