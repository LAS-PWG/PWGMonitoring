# SiteTrack Pro — GitHub Pages Self-Contained Package (`app-github-pages.zip`)

This archive is a **100% self-contained, portable static web application** ready for deployment to **GitHub Pages** without requiring Node.js, a build command, or a backend server. All file links are located directly in the **main** folder (`./style.css`, `./app.js`, `./fonts.css`, `./data.json`, `./logo.svg`, `./favicon.svg`) — never in root (`/`).

## Included File Structure
```text
main/
├── index.html          # Main application entry point (all links point to ./ in main)
├── style.css           # Complete compiled application & printable ledger CSS in main
├── app.js              # Complete compiled application JS bundle in main
├── fonts.css           # Local high-legibility font stack in main (Zero external CDNs)
├── data.json           # Complete local portable dataset (8 tables) in main
├── logo.svg            # Local brand SVG logo in main
├── favicon.svg         # Local favicon SVG in main
├── README.md           # Step-by-step deployment & validation guide
├── 404.html            # GitHub Pages SPA fallback in main
├── .nojekyll           # Disables Jekyll filtering on GitHub Pages
├── assets/             # Mirrored asset copies for structured folder compatibility
│   ├── images/logo.svg
│   ├── icons/favicon.svg
│   └── fonts/fonts.css
├── css/style.css       # Mirrored stylesheet copy
├── js/app.js           # Mirrored JS bundle copy
└── data/data.json      # Mirrored dataset copy
```

## Step-by-Step GitHub Pages Deployment Instructions

### Method A: Upload Directly via GitHub Web Interface into `main`
1. **Extract `app-github-pages.zip`** on your computer.
2. Open your GitHub repository on the **`main`** branch and click **Add file → Upload files**.
3. Drag and drop the extracted files (`index.html`, `404.html`, `.nojekyll`, `style.css`, `app.js`, `fonts.css`, `data.json`, `logo.svg`, `favicon.svg`, `README.md`) directly into the **`main`** directory.
   - Because all file links in `index.html` point directly to the main directory (`./style.css`, `./app.js`, `./fonts.css`, `./data.json`, `./logo.svg`, `./favicon.svg`), the app works immediately even if you only upload the main directory files!
4. Click **Commit changes**.
5. In your GitHub repository, navigate to **Settings → Pages**.
6. Under **Build and deployment → Source**, select **Deploy from a branch**, choose branch **`main`**, and click **Save**.
7. Your application will be live at `https://<your-github-username>.github.io/<repository-name>/`.

### Method B: Push via Git CLI to `main`
```bash
unzip app-github-pages.zip -d sitetrack-gh-pages
cd sitetrack-gh-pages
git init
git add -A
git commit -m "Deploy self-contained SiteTrack Pro to GitHub Pages main"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

## Optional External Services & Separation of Concerns

### 1. Default Mode: 100% Self-Contained Local Data (`./data.json` + `localStorage`)
- Out of the box, this package operates **100% independently** with **zero external servers or API calls required**.
- All file links in `index.html` and the application point directly to the **main** directory (`./style.css`, `./app.js`, `./fonts.css`, `./data.json`, `./logo.svg`, `./favicon.svg`) — never to domain root (`/`).
- On startup, the application loads the preloaded dataset and `./data.json` (which contains all Sites, Project Types, Main Projects, Sub-Projects, Contractors, Contracts/TCPs, RFPs/CVs/Payments, BIR Tax configurations, and User Accounts).
- Any new projects, contracts, payments, or edits you make in the UI are automatically saved to browser `localStorage` (`sitetrack_portable_data_v1`), and you can export or update `data.json` at any time.

### 2. Optional External Integration: Live Google Sheets v4 API Sync
- If you later choose to synchronize this application with a live Google Spreadsheet in the cloud:
  1. Click **Connect Google Sheet (Optional)** in the top right header bar.
  2. Authorize your deployed domain (e.g., `https://<username>.github.io` or `https://<site-name>.netlify.app`) in:
     - **Firebase Console** → Authentication → Settings → **Authorized Domains**
     - **Google Cloud Console** → APIs & Services → Credentials → OAuth 2.0 Client ID → **Authorized JavaScript Origins**
  3. No private API keys or client secrets are stored in client-side code; authentication uses browser-side OAuth 2.0 Bearer tokens.

## Pre-Export Quality Assurance (QA) Validation Summary
- **All File Links in Main (Zero Root `/` Links)**: Verified `index.html` and `404.html` reference `./favicon.svg`, `./fonts.css`, `./style.css`, `./app.js`, `./logo.svg`, and `./data.json` directly in the main folder with **zero root-relative (`/...`) links**.
- **CSS & Local Fonts**: Verified `./style.css` and `./fonts.css` are locally bundled with **zero external Google Fonts or CDN stylesheet links**.
- **JavaScript Bundle**: Verified `./app.js` is the full production React bundle (~708 KB) wrapped in a self-executing IIFE with **zero development paths or external script CDNs**.
- **Images & Icons**: Verified `./logo.svg` and `./favicon.svg` exist locally in the main directory.
- **Data Portability**: Verified `./data.json` contains valid JSON records for all 8 application tables and is pre-hydrated in `index.html`.
- **Zero Temporary URLs**: Verified zero references to temporary preview URLs or local development paths.
