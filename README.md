# Apps Script + Vite Starter Template

A minimalist template for building simple, static web pages and deploying them as Google Apps Script web apps. It uses Vite for fast, efficient builds with zero unnecessary complexity.

Perfect for quickly creating web interfaces, landing pages, or dashboards on Google's free infrastructure without complex frameworks or server setup.

## ✨ Features

- **Zero Framework:** Plain HTML and CSS—no unnecessary dependencies.
- **Fast Build Tooling:** Powered by Vite for optimized development and production builds.
- **Effortless Deployment:** Deploy as a free web app on Google's infrastructure using `clasp`.
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

## 📥 Clone an Existing Apps Script Project

Already have a Google Apps Script project you'd like to bring into this template? No problem. Follow these steps.

### Prerequisites for Cloning

You'll need:

- Your Apps Script project's **Script ID** (found in the Google Apps Script editor URL: `script.google.com/macros/d/{SCRIPT_ID}/edit`)
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

**Step 3: Organize Code into the Project Structure**

Move your existing code to follow this project's layout:

- **Server-side Apps Script code** → `src/server/` (e.g., `doGet()`, `doPost()`)
- **HTML UI** → `src/index.html`
- **Client-side JavaScript** → `src/client/`
- **Shared utilities** → `src/shared/`

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
├── index.html          # Main UI file
├── style.css           # Styles
└── client/
    └── main.ts         # Client entry point (optional)

public/                 # Static assets (copied as-is)
apps-script/
└── appsscript.json     # Apps Script manifest
build/                  # Compiled output (generated)
dist/                   # Bundled files (generated)
```

---

## 📖 Tips & Tricks

- **Faster iterations:** Use `npm run dev` + `clasp open-web-app` to see live updates.
- **Rollback:** Each `clasp create-deployment` creates a version; use Google's version history to revert.
- **List deployments:** Run `clasp list-deployments` to see all active versions.
- **Environments:** Use `.env.local` for local variables (not committed to git).
- **Debugging:** Open your web app URL and use the browser console for client-side errors.
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
