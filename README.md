# SiteTrack Pro — GitHub Pages Self-Contained Package (`app-github-pages.zip`)

This archive is a **self-contained, portable static web application** ready for deployment to **GitHub Pages** without requiring Node.js, a build command, or a backend server. All file links use relative `./` paths so it works cleanly under any GitHub Pages repository subpath (`https://<username>.github.io/<repo>/`).

## Included File Structure
```text
main/
├── index.html                   # Main application entry point (all links use relative ./ paths)
├── style.css                    # Complete compiled application & print stylesheet
├── app.js                       # Complete compiled production React bundle (IIFE)
├── fonts.css                    # Local high-legibility system font stack (zero external CDNs)
├── data.json                    # Synthetic placeholder dataset for explicit Dev Sandbox mode
├── logo.svg                     # Local SVG brand logo
├── favicon.svg                  # Local SVG favicon
├── google-apps-script/
│   └── Code.gs                  # Google Apps Script Web App bridge for full Read & Write to Google Sheets
├── README.md                    # Step-by-step deployment & Google Sheet setup guide
├── 404.html                     # GitHub Pages SPA fallback
└── .nojekyll                    # Disables Jekyll processing on GitHub Pages
```

## Step-by-Step GitHub Pages Deployment Instructions

### Method A: Upload Directly via GitHub Web Interface
1. **Extract `app-github-pages.zip`** on your computer.
2. Open your GitHub repository on the **`main`** branch and click **Add file → Upload files**.
3. Drag and drop all extracted files (`index.html`, `404.html`, `.nojekyll`, `style.css`, `app.js`, `fonts.css`, `data.json`, `logo.svg`, `favicon.svg`, `README.md`, and the `google-apps-script/` folder).
4. Click **Commit changes**.
5. In your GitHub repository, navigate to **Settings → Pages**.
6. Under **Build and deployment → Source**, select **Deploy from a branch**, choose branch **`main`** / folder **`/ (root)`**, and click **Save**.
7. Your application will be live at `https://<your-github-username>.github.io/<repository-name>/`.

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

## Connecting Your Live Google Sheet (Google Apps Script Primary Bridge — v2.1.0)

SiteTrack Pro preserves your existing 8-worksheet Google Sheet schema (`Sites`, `ProjectTypes`, `Projects`, `SubProjects`, `Contractors`, `ContractsTCP`, `ContractPayments`, `UserAccounts`) and default Spreadsheet ID `1HNmAdZe7POIzIm9mCUPxQJL7p9BoBZEO1hXq6PZNs5M`.

### Mode 1 (Primary & Required for Normal Operation): Full Read & Write via Google Apps Script (`google-apps-script/Code.gs` v2.1.0)
1. Open your Google Sheet: `https://docs.google.com/spreadsheets/d/1HNmAdZe7POIzIm9mCUPxQJL7p9BoBZEO1hXq6PZNs5M/edit`
2. Click **Extensions → Apps Script**.
3. Replace all code in `Code.gs` with the complete contents of **`google-apps-script/Code.gs`** (also available via one-click Copy inside the app's **Google Sheet Connection** modal).
   - **v2.1.0 Reliability Enhancements**: Adds strict Spreadsheet ID verification (`healthCheck` / `ping`), post-timeout commit verification (`verifyRecord`), and `SpreadsheetApp.flush()` inside `LockService` on every write.
4. Click **Save**, then click **Deploy → New deployment** (or **Deploy → Manage deployments → Edit → New version** to keep the same `/exec` URL):
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` (for pre-authentication development testing; restrict with server-side auth in Phase 2).
5. Copy the deployed `https://script.google.com/macros/s/.../exec` URL.
6. In SiteTrack Pro, click the connection status control in the sidebar/header → select **Google Apps Script Web App (Primary — Full Read & Write)** → paste the `/exec` URL → click **Test & Verify** → **Save & Connect**.
7. Your browser persists the Spreadsheet ID, Apps Script URL, and last verified connection metadata across refreshes and browser restarts. SiteTrack Pro will **never** silently downgrade a configured Apps Script bridge to Read-Only mode on a transient error.

### Mode 2 (Manual Fallback Only): Link-Shared Read-Only CSV Sync
- Only used if you explicitly select **Read-Only CSV Mode**. Requires the Google Sheet to be shared as *"Anyone with the link → Viewer"*. Writes are explicitly disabled rather than faking a save.

### Mode 3: Dev Sandbox (Browser Local Only)
- Explicitly switch to **Dev Sandbox** to test CRUD operations against the included synthetic placeholder dataset (`./data.json`) stored only in your browser's `localStorage`.

> **Development-Mode Security Notice (Next Phase Required Before Production)**
> Authentication (login, user registration, account approval, and server-side RBAC) is intentionally NOT implemented in this phase. Do not expose real confidential records via an unauthenticated public Web App URL in production — add server-side identity verification and role enforcement in the Authentication & Production Deployment phase.

## Pre-Export Quality Assurance (QA) Validation Summary
- **All File Links in Main (Zero Root `/` Links)**: Verified `index.html` and `404.html` reference `./favicon.svg`, `./fonts.css`, `./style.css`, `./app.js`, `./logo.svg`, and `./data.json` with **zero root-relative (`/...`) links**.
- **Clean Archive (Zero Redundant Duplicate Copies)**: Only canonical files in main plus `google-apps-script/Code.gs`.
- **Zero External CDNs or Dev URLs**: Verified zero Google Fonts CDN links, zero temporary preview URLs, and zero Firebase auth config keys.
- **Zero Personal/Confidential Fixtures**: Bundled `./data.json` contains strictly synthetic placeholder records.
