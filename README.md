# Smart Tools Hub

**Your Everyday Tools, All in One Place.**

Smart Tools Hub is a standalone, responsive static web application offering **46 genuinely working browser-based utilities** across **10 categories**:

1. **Image & Photo Tools** — Image Resizer (single & batch ZIP), Image Compressor (quality & 20KB/50KB/100KB target presets), Image Cropper (aspect ratios), Format Converter (JPG/PNG/WebP), Passport Photo Maker (with printable A4 sheet), Signature Resizer.
2. **PDF Tools** — JPG/PNG to PDF, PDF to JPG/PNG (with ZIP export), PDF Merger (reorderable), PDF Splitter & Page Extractor, PDF Page Rotator & Deleter, PDF Watermark, Page Numbers, Metadata & Text Extractor.
3. **Calculators & Converters** — Age Calculator, Date Difference & Days Between Dates, Percentage & Discount Calculator, BMI Calculator, GST / EMI / Loan & Simple/Compound Interest Calculator, Live Currency Converter (real exchange-rate API with timestamps), Unit Converter (Length, Weight, Temperature, Time, Data Storage).
4. **QR & Barcode Tools** — Multi-Type QR Code Generator (URL, Wi-Fi, Text, Email, Phone, Contact with PNG & SVG export), QR Code Scanner (image upload + HTTPS camera fallback), Barcode Generator (CODE128, EAN-13, UPC, CODE39, ITF-14).
5. **Text & Writing Tools** — Word/Character/Sentence/Paragraph & Reading Time Counter, Case Converter & Text-to-Slug, Remove Extra Spaces & Duplicate Lines, Find & Replace / Sorter / Reverser, Text Compare (Diff) & Lorem Ipsum Generator.
6. **Developer Tools** — JSON Formatter & Validator, Base64 / URL / HTML Encoder & Decoder, CSS / HTML / JS Minifier, UUID v4 & Web Crypto Hash Generator (SHA-1/256/512), Color Picker & HEX/RGB/HSL Converter, Regex Tester & Unix Timestamp Converter.
7. **Security & Random Tools** — Cryptographic Password & Passphrase Generator (`crypto.getRandomValues`) + Strength Checker, Random Number / Dice Roller / Coin Flip, Random Name & Color Palette Generator.
8. **Student & Education Tools** — GPA / CGPA & Marks-to-Grade Calculator, Typing Speed Test, Exam Countdown & Study Time Planner, Interactive Quiz Generator.
9. **Document & Productivity Tools** — Resume & Cover Letter Builder (printable A4), Invoice Generator (GST/tax + print/PDF), Online Notepad & Daily Planner / Checklist, Meeting Notes & Printable Calendar / A4 Sheet Maker.
10. **Social & Creator Tools** — Social Media / YouTube Thumbnail / Instagram Post & Story Resizer, Hashtag Generator & YouTube Tag Counter, Open Graph Social Card Previewer.

## Features

- **Privacy-First Local Processing**: Images, PDFs, QR scans, passwords, and text stay in your browser—no files are uploaded to remote servers.
- **Trilingual UI**: Instant switching between **English**, **বাংলা (Bengali)**, and **हिन्दी (Hindi)**.
- **Light & Dark Mode**: Crisp Light mode default with complete Dark mode support.
- **Global Keyboard Search**: Press `Ctrl+K` or `⌘K` to search tools with arrow-key navigation and recent searches.
- **Favorites & History**: Local `localStorage` persistence with graceful fallback if browser storage is disabled.

## Local Development & Testing

```bash
npm install
npm run dev
```

Open `http://localhost:3000` in your browser.

To create a static production build ready for hosting:

```bash
npm run build
```

The static deployable files (`index.html`, `404.html`, `robots.txt`, `sitemap.xml`, and `assets/`) are generated in `dist/`.

## Deployment Guide

### GitHub Pages
1. Push this repository to GitHub (e.g., `smart-tools-hub`).
2. Run `npm run build` and publish the `dist/` folder via GitHub Actions (`actions/deploy-pages`) or push `dist/` to a `gh-pages` branch.
3. Because Vite is configured with `base: './'` and hash routing (`#/...`), all assets and routes work under repository subpaths (`https://<username>.github.io/smart-tools-hub/`).

### Netlify
1. Import your GitHub repository in Netlify.
2. Set **Build command** to `npm run build`.
3. Set **Publish directory** to `dist`.
4. Deploy.

### Vercel
1. Import your GitHub repository in Vercel.
2. Select framework preset **Vite** (Build command: `npm run build`, Output directory: `dist`).
3. Deploy.

## Honest Disclosure on Browser Limits & External APIs

- **Live Currency Converter**: Fetches live rates from the public `open.er-api.com` exchange-rate endpoint and displays the exact rate timestamp. If offline or unreachable, it shows a clear error state and never invents rates.
- **Camera QR Scanner**: Requires a secure HTTPS context and camera permission; image-upload scanning always works locally as a fallback.
- **PDF Processing**: Uses client-side `pdf-lib` and `pdfjs-dist`. True lossless server-grade PDF recompression may not shrink already-compressed image PDFs; browser rendering and structural optimization are disclosed honestly.
- **No Secret Keys**: This repository contains zero secret keys and is strictly a standalone website (not an Android app, APK, or WebView project).
