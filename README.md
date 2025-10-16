# Apps Script + Vite Starter Template

A minimalist template for building a simple, static web page and deploying it as a Google Apps Script web app. It uses Vite for an efficient build process.

This template is perfect for quickly creating and deploying simple web interfaces, landing pages, or dashboards without needing a complex framework or server setup.

## ✨ Features

- **Zero Framework:** Just plain HTML, CSS.
- **Modern Build Tooling:** Uses Vite for fast and efficient builds.
- **Simple Deployment:** Deploy as a free web app on Google's infrastructure with `clasp`.
- **Ready for GitHub:** Setup as a template repository so you can get started immediately.

---

## 🚀 Quick Start

Follow these steps to deploy your own version of this web app.

### Prerequisites

- **Node.js**: Make sure you have Node.js installed (v18 or later is recommended).
- **clasp**: Install the Google Apps Script CLI and log in.
  ```console
  npm install -g @google/clasp
  clasp login
  ```

### 5 Steps to Deploy

**1. Create Your Project from This Template**

Click the "Use this template" button on GitHub to create a new repository, then clone it to your local machine.
```console
git clone https://github.com/your-username/your-new-repo.git
cd your-new-repo
```

**2. Install Dependencies**

Install the necessary development packages.
```console
npm install
```

**3. Create a New Apps Script Project**

This command creates a new Google Apps Script project in your Google Drive, linked to your local project.
```console
# You can change "MyViteWebApp" to any name you like
clasp create --type sheets --title "MyViteWebApp"
```

**4. Build and Push to Google**

This command bundles your `src` files into a single HTML file and uploads everything to your Apps Script project.
```console
npm run build && clasp push
```
> **Note**: If asked to overwrite the manifest file, answer `yes`.

**5. Deploy as a Web App**

Publish your project to the web. This command will output a public URL ending in `.../exec`.
```console
clasp deploy
```

That's it! Your static page is now live.

---

### Development

To see your changes locally before pushing, you can use the Vite development server:
```console
npm run dev
```

To test changes on your development deployment (`.../dev` URL), just build and push. A new `clasp deploy` is not needed.
```console
npm run build && clasp push
```
You can open your development URL with `clasp open --webapp`.


