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

## Connecting Your Live Google Sheet (No Firebase Popup Required)

SiteTrack Pro preserves your existing 8-worksheet Google Sheet schema (`Sites`, `ProjectTypes`, `Projects`, `SubProjects`, `Contractors`, `ContractsTCP`, `ContractPayments`, `UserAccounts`) and default Spreadsheet ID `1HNmAdZe7POIzIm9mCUPxQJL7p9BoBZEO1hXq6PZNs5M`.

### Mode 1 (Recommended): Full Read & Write via Google Apps Script (`google-apps-script/Code.gs`)
1. Open your Google Sheet: `https://docs.google.com/spreadsheets/d/1HNmAdZe7POIzIm9mCUPxQJL7p9BoBZEO1hXq6PZNs5M/edit`
2. Click **Extensions → Apps Script**.
3. Delete any default code and paste the complete contents of **`google-apps-script/Code.gs`** (also available via one-click Copy inside the app's **Google Sheet Setup** modal).
4. Click **Save**, then click **Deploy → New deployment → Web app**:
   - **Execute as**: `Me`
   - **Who has access**: `Anyone` (for development testing; restrict with server-side auth in Phase 2).
5. Copy the deployed `https://script.google.com/macros/s/.../exec` URL.
6. In SiteTrack Pro, click the connection badge in the header → select **Google Apps Script Web App (Full Read & Write)** → paste the `/exec` URL → click **Test Connection** → **Save & Sync**.
7. Your browser remembers the Spreadsheet ID and Apps Script URL across every page refresh.

### Mode 2: Link-Shared Read-Only CSV Sync
- If your Google Sheet is shared as *"Anyone with the link → Viewer"* and no Apps Script is deployed yet, SiteTrack Pro can read all 8 worksheets directly in **Read-Only** mode. Writes are explicitly blocked with a clear notice rather than faking a save.

### Mode 3: Dev Sandbox (Browser Local Only)
- Explicitly switch to **Dev Sandbox** to test CRUD operations against the included synthetic placeholder dataset (`./data.json`) stored only in your browser's `localStorage`.

> **Development-Mode Security Notice (Next Phase Required Before Production)**
> Authentication (login, user registration, account approval, and server-side RBAC) is intentionally NOT implemented in this phase. Do not expose real confidential records via an unauthenticated public Web App URL in production — add server-side identity verification and role enforcement in the Authentication & Production Deployment phase.

## Pre-Export Quality Assurance (QA) Validation Summary
- **All File Links in Main (Zero Root `/` Links)**: Verified `index.html` and `404.html` reference `./favicon.svg`, `./fonts.css`, `./style.css`, `./app.js`, `./logo.svg`, and `./data.json` with **zero root-relative (`/...`) links**.
- **Clean Archive (Zero Redundant Duplicate Copies)**: Only canonical files in main plus `google-apps-script/Code.gs`.
- **Zero External CDNs or Dev URLs**: Verified zero Google Fonts CDN links, zero temporary preview URLs, and zero Firebase auth config keys.
- **Zero Personal/Confidential Fixtures**: Bundled `./data.json` contains strictly synthetic placeholder records.
