# ARVR Club Circular Generator

A web application for the ARVR Club (Department of CSE, Pragati University) that lets a
coordinator fill in event details, see a live preview of the official circular, and
download it as a print-ready PDF or an editable DOCX — replacing the manual process of
building each circular by hand.

This is **Phase 1**: circular generation only. The data model and file structure are
already set up so **Phase 2** (event report generation) can be added later without
reworking the app — see [Adding report generation in Phase 2](#15-adding-report-generation-in-phase-2).

> **Note:** This is an internal prototype with no login screen — anyone who can reach
> the app URL can use it. See [Firebase security rules](#12-firebase-security-rules)
> for what that means for data access.

## Contents

1. [Project overview](#1-project-overview)
2. [Technology stack](#2-technology-stack)
3. [Installation](#3-installation)
4. [Environment variables](#4-environment-variables)
5. [Create a Firebase project](#5-create-a-firebase-project)
6. [Create Firestore](#6-create-firestore)
7. [Create Firebase Storage](#7-create-firebase-storage)
8. [Configure the app](#8-configure-the-app)
9. [Run locally](#9-run-locally)
10. [Build](#10-build)
11. [Deploy to Firebase Hosting](#11-deploy-to-firebase-hosting)
12. [Firebase security rules](#12-firebase-security-rules)
13. [How circular generation works](#13-how-circular-generation-works)
14. [How to replace the logos](#14-how-to-replace-the-logos)
15. [Adding report generation in Phase 2](#15-adding-report-generation-in-phase-2)
16. [Troubleshooting](#16-troubleshooting)

---

## 1. Project overview

Workflow:

```
Dashboard → Create New Circular → Enter event info →
Live Preview → Generate → Download PDF / DOCX → Saved to Firestore
```

Fixed university/club information (name, department, HOD, faculty coordinator, club
president, address, etc.) lives in `src/config/clubConfig.ts` and appears automatically
on every circular — the coordinator only enters event-specific fields.

## 2. Technology stack

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend-as-a-service:** Firestore, Storage, Hosting (no custom server)
- **Document generation:** HTML/CSS circular template rendered in the browser;
  `html2canvas` + `jsPDF` for PDF, the `docx` library for Word documents

There is no separate Node/Express backend — Firebase is called directly from the
frontend.

## 3. Installation

```bash
npm install
```

## 4. Environment variables

Copy the example file and fill in your Firebase project's web app config:

```bash
cp .env.example .env
```

```
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
```

Never commit `.env` — it's already in `.gitignore`.

## 5. Create a Firebase project

1. Go to the [Firebase Console](https://console.firebase.google.com/) → **Add project**.
2. Name it (e.g. `arvr-club-circulars`) and finish the wizard (Google Analytics is optional).
3. Once created, click the **Web** icon (`</>`) to register a web app.
4. Copy the `firebaseConfig` values shown into your `.env` file (see step 4).

## 6. Create Firestore

1. Go to **Build → Firestore Database → Create database**.
2. Choose **Production mode** (the security rules in this repo lock it down to only
   the collections the app uses).
3. Pick a Firestore location close to your users.
4. No manual collection setup is needed — the app creates the `events` and
   `counters` collections automatically the first time you save a draft or
   generate a circular.

## 7. Create Firebase Storage

1. Go to **Build → Storage → Get started**.
2. Accept the default bucket and location.
3. This is used only if/when you upload replacement logos through Storage
   (see [section 14](#14-how-to-replace-the-logos)); it's not required for
   PDF/DOCX generation, which happens entirely in the browser.

## 8. Configure the app

Install the Firebase CLI (once) and log in:

```bash
npm install -g firebase-tools
firebase login
```

Point the CLI at your project:

```bash
cp .firebaserc.example .firebaserc
# then edit .firebaserc and replace "your-firebase-project-id"
# with the Project ID shown in Firebase Console → Project settings
```

## 9. Run locally

```bash
npm run dev
```

This starts the Vite dev server (usually at `http://localhost:5173`) and opens straight
to the Dashboard — there is no login step.

If `.env` isn't filled in yet, Firebase calls (loading/saving circulars) will fail; a
warning is logged to the browser console so it's obvious what to fix.

## 10. Build

```bash
npm run build
```

Type-checks the project and outputs a production build to `dist/`.

## 11. Deploy to Firebase Hosting

```bash
npm run build
firebase deploy --only hosting,firestore:rules,storage:rules
```

The first deploy prints the Hosting URL (`https://<project-id>.web.app`). Share that URL
with the coordinators.

## 12. Firebase security rules

This app has **no Firebase Authentication and no login screen** — it's an internal
prototype, and the rules below reflect that:

- `firestore.rules` — anyone who can reach the app can read/write the `events` and
  `counters` collections; everything else is denied.
- `storage.rules` — anyone who can reach the app can read/write files under
  `branding/` (used for logo replacement), capped at 5MB and restricted to image
  files; everything else is denied.

Deploy rule changes with:

```bash
firebase deploy --only firestore:rules,storage:rules
```

Before any public/production deployment, add a real access-control mechanism
(e.g. re-introduce Firebase Authentication, put the Hosting URL behind an
organization-only proxy, or use App Check).

## 13. How circular generation works

- `src/templates/circular/CircularTemplate.tsx` is a **fixed HTML/CSS template**
  with placeholders filled from the event form data — it is never generated by AI at
  request time. The same component renders the live preview, the on-screen Print view,
  and the PDF capture, so what you see is what you get.
- `src/utils/circularContent.ts` contains the deterministic sentence templates
  (subject line, introduction paragraph, participation paragraph) described in the
  original spec — no AI calls are made to produce circular text.
- **PDF:** `src/services/pdfService.ts` rasterizes the template with `html2canvas` and
  places it on an A4 page with `jsPDF`, slicing across multiple pages if the content is
  taller than one page.
- **DOCX:** `src/services/docxService.ts` builds an equivalent Word document directly
  with the `docx` library (headings, a details table, objectives, and a signature row),
  so it's a real editable document, not a converted image.
- **Reference numbers:** `src/utils/referenceNumber.ts` uses a Firestore transaction on
  a `counters/{year}` document to hand out `ARVR/YYYY/001`, `ARVR/YYYY/002`, … without
  collisions, resetting to `001` each new year.

## 14. How to replace the logos

Simplest option — replace the files directly and redeploy:

```
public/assets/pragati-logo.png
public/assets/arvr-logo.png
```

Recommended: square PNGs, ≥200×200px, transparent background. Until real files are
added, the circular shows a small labeled placeholder box instead of a fake logo, and
the app header simply omits the image.

## 15. Adding report generation in Phase 2

The `EventRecord` type (`src/types/event.ts`) already reserves `reportStatus` and
`reportGeneratedDate` fields, unused in Phase 1. To add Report Generation later:

1. Create `src/templates/report/ReportTemplate.tsx` (mirroring the circular template
   pattern) reusing the same `EventRecord` fields (name, date, venue, coordinators,
   description, objectives) plus any report-only fields you add.
2. Create `src/services/reportPdfService.ts` / extend `docxService.ts` following the
   same pattern as the circular's PDF/DOCX services.
3. Replace the disabled **"Reports — Coming Soon"** item in
   `src/components/common/AppShell.tsx` with a real route once the report editor exists.

No changes to the `events` Firestore collection schema are required.

## 16. Troubleshooting

| Symptom | Fix |
|---|---|
| Blank screen | `.env` is missing or incomplete — see [section 4](#4-environment-variables) |
| "Missing or insufficient permissions" in the console | Firestore/Storage rules haven't been deployed — see [section 12](#12-firebase-security-rules) |
| Logos don't appear | Add the files described in [section 14](#14-how-to-replace-the-logos) |
| PDF text looks slightly different from the preview font | Ensure you have an internet connection on first load so the Google Fonts (Inter, Source Serif 4) can load before generating |


## 16. Troubleshooting

| Symptom | Fix |
|---|---|
| Firestore is unavailable | The app falls back to browser local storage for drafts and generated events, so local creation/export can continue. Fix the Firebase project configuration/rules for shared cloud storage. |
| PDF does not download | The PDF generator waits for fonts/images, captures the actual circular element, creates a Blob, and downloads it with FileSaver. Check the browser console for a generation error. |
| DOCX does not download | The DOCX generator creates a browser Blob and downloads it with FileSaver. Check the browser console for a generation error. |
| Logos don't appear | Add the files described in [section 14](#14-how-to-replace-the-logos) |
| PDF text looks slightly different from the preview font | Ensure you have an internet connection on first load so the Google Fonts (Inter, Source Serif 4) can load before generating |
## Firebase Hosting deployment

Build the Vite app and deploy the `dist` folder:

```powershell
npm install
npm run build
firebase deploy --only hosting
```

The Firebase Hosting configuration is already set to `dist` with an SPA rewrite to `index.html`.


### PDF pagination
PDF export always produces a single A4 page. If unusually long content exceeds the natural A4 height, the complete circular is proportionally scaled down rather than split across multiple pages.
