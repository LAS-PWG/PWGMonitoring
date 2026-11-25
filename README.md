# SiteTrack Pro — GitHub Pages Self-Contained Package (`app-github-pages.zip`)

This archive is a **100% self-contained, portable static web application** ready for deployment to **GitHub Pages** without requiring Node.js, a build command, or a backend server.

## Included File Structure
```text
project/
├── index.html
├── README.md
├── 404.html
├── .nojekyll
├── assets/
│   ├── images/
│   │   └── logo.svg
│   ├── icons/
│   │   └── favicon.svg
│   └── fonts/
│       └── fonts.css
├── css/
│   └── style.css
├── js/
│   └── app.js
└── data/
    └── data.json
```

## Step-by-Step GitHub Pages Deployment Instructions

### Method A: Upload Directly via GitHub Web Interface (No Git CLI or Node.js Required)
1. **Extract `app-github-pages.zip`** on your computer into a folder.
2. Create a new repository on GitHub (or open an existing repository).
3. Click **Add file → Upload files**.
4. Drag and drop **all extracted files and folders** (`index.html`, `404.html`, `.nojekyll`, `README.md`, `assets/`, `css/`, `js/`, `data/`) into the repository root.
   - *Important*: Make sure the hidden file `.nojekyll` is included so GitHub Pages serves all folders without Jekyll processing.
5. Click **Commit changes**.
6. In your GitHub repository, navigate to **Settings → Pages** (under "Code and automation").
7. Under **Build and deployment → Source**, select **Deploy from a branch**.
8. Choose your branch (e.g., `main` or `master`) and folder `/ (root)`, then click **Save**.
9. After 30–60 seconds, your site will be live at:
   - `https://<your-github-username>.github.io/<repository-name>/`
   - Because all assets use relative paths (`./css/style.css`, `./js/app.js`, `./assets/...`, `./data/data.json`), the application works automatically under any GitHub repository subpath!

### Method B: Push via Git CLI
```bash
unzip app-github-pages.zip -d sitetrack-gh-pages
cd sitetrack-gh-pages
git init
git add -A
git commit -m "Deploy self-contained SiteTrack Pro to GitHub Pages"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Optional External Services & Separation of Concerns

### 1. Default Mode: 100% Self-Contained Local Data (`./data/data.json` + `localStorage`)
- Out of the box, this package operates **100% independently** with **zero external servers or API calls required**.
- On startup, the application loads `./data/data.json` (which contains all Sites, Project Types, Main Projects, Sub-Projects, Contractors, Contracts/TCPs, RFPs/CVs/Payments, BIR Tax configurations, and User Accounts).
- Any new projects, contracts, payments, or edits you make in the UI are automatically saved to browser `localStorage` (`sitetrack_portable_data_v1`), and you can export or update `data/data.json` at any time.

### 2. Optional External Integration: Live Google Sheets v4 API Sync
- If you later choose to synchronize this application with a live Google Spreadsheet in the cloud:
  1. Click **Connect Live Google Sheet (Optional)** in the top right header bar.
  2. Authorize your deployed domain (e.g., `https://<username>.github.io` or `https://<site-name>.netlify.app`) in:
     - **Firebase Console** → Authentication → Settings → **Authorized Domains**
     - **Google Cloud Console** → APIs & Services → Credentials → OAuth 2.0 Client ID → **Authorized JavaScript Origins**
  3. No private API keys or client secrets are stored in client-side code; authentication uses browser-side OAuth 2.0 Bearer tokens.

## Pre-Export Quality Assurance (QA) Validation Summary
- **HTML & Navigation**: Verified `index.html` and `404.html` use relative paths (`./`) and client-side tab routing with zero broken links.
- **CSS & Local Fonts**: Verified `./css/style.css` and `./assets/fonts/fonts.css` are locally bundled with **zero external Google Fonts or CDN stylesheet links**.
- **JavaScript Bundle**: Verified `./js/app.js` is locally bundled and self-contained with **zero external script CDNs**.
- **Images & Icons**: Verified `./assets/images/logo.svg` and `./assets/icons/favicon.svg` exist locally and are referenced via relative paths.
- **Data Portability**: Verified `./data/data.json` contains valid JSON records for all 8 application tables.
- **Zero Temporary URLs**: Verified zero references to temporary preview URLs or local development paths.
