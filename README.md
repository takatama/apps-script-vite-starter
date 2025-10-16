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

**Step 3: Create a New Apps Script Project**

This links your local project to a new Google Apps Script project in your Drive:

```bash
clasp create-script --type sheets --title "MyViteWebApp"
```

(Change `"MyViteWebApp"` to your preferred name. Other types include `docs`, `slides`, `forms`, `standalone`, and `webapp`.)

**Step 4: Build and Deploy**

Bundle your code and upload to Apps Script:

```bash
npm run build && clasp push
```

> If prompted to overwrite the manifest, answer `yes`.

**Step 5: Publish the Web App**

Make it public with:

```bash
clasp deploy
```

✅ Done! Your web app is now live. The command outputs a URL ending in `/exec`.

---

### Local Development

See changes locally before pushing to Google:

```bash
npm run dev
```

Test updates on your development deployment (`.../dev` URL) by rebuilding and pushing—no need to run `clasp deploy` again:

```bash
npm run build && clasp push
```

Open the development URL in your browser:

```bash
clasp open-web-app
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

Edit `src/mocks/mockData.js` to add mock responses for your server functions:

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
clasp create-script --type sheets --title "MyWebApp"
npm run build && clasp push
clasp create-deployment
```

### Continue Developing an Existing Project

```bash
clasp clone-script {SCRIPT_ID}  # or: clasp pull
npm install
npm run dev                      # local dev server
npm run build && clasp push      # upload changes to Google
```

### Publishing Updates

After making changes, create and deploy a new version:

```bash
clasp create-deployment  # creates a version and deploys
```

To redeploy a specific version:

```bash
clasp update-deployment {DEPLOYMENT_ID} --versionNumber {VERSION}
```

---

## 📚 Project Structure

```
src/
├── index.html              # Main UI file (client-side)
├── style.css               # Styles
├── lib/
│   └── googleScriptRun.js  # google.script.run wrapper with mock support
├── client/
│   └── main.js             # Client application logic
└── mocks/
    └── mockData.js         # Mock data for local development

apps-script/
├── appsscript.json         # Apps Script manifest
└── Code.js                 # Server-side Apps Script code (doGet, doPost, etc.)

public/                     # Static assets (copied as-is)
dist/                       # Bundled files for deployment (generated)
.clasp.json                 # clasp configuration (created by clasp create/clone)
vite.config.js              # Vite build configuration
```

> **Note**: After `clasp clone-script`, you'll need to move files from the root directory into their proper locations within this structure.

---

## 📖 Tips & Tricks

- **Local Development:** Use `npm run dev` to develop with mock data. The `googleScriptRun` wrapper automatically detects when `google.script.run` is unavailable and uses mock data from `src/mocks/mockData.js`.
- **Mock Data:** Add your own mock responses in `src/mocks/mockData.js` for any server functions you create. This allows full client-side development without deploying to Apps Script.
- **Faster iterations:** Use `npm run dev` for rapid local development, then `npm run push` to deploy and test with real Apps Script integration.
- **Live Updates:** Combine `npm run dev` with `clasp open-web-app` to preview your deployed app while making changes.
- **Rollback:** Each `clasp create-deployment` creates a version; use Google's version history to revert.
- **List deployments:** Run `clasp list-deployments` to see all active versions.
- **Environments:** Use `.env.local` for local variables (not committed to git).
- **Debugging:** Open your web app URL and use the browser console for client-side errors. In local dev mode, check the console for mock data messages.
- **Enable APIs:** Use `clasp enable-api {apiName}` if your script needs access to Google services.

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
