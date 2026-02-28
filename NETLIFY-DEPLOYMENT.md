# KacheHub Netlify Deployment Guide

This repository is a static website ready for Netlify deployment.

## Current Project Layout

- `index.html` - Main page
- `js/api.js` - Optional API integration module (disabled by default)
- `uploads/` - Image assets
- `netlify.toml` - Netlify config
- `_redirects` - SPA fallback and HTTPS redirect

## Notes

- Contact and newsletter forms are currently handled inline in `index.html` using WhatsApp flow.
- `js/api.js` will only run if `window.KACHEHUB_ENABLE_API = true` is set before the script executes.
- No backend PHP endpoints are included in this repository.

## Deploy Options

### Option 1: Netlify Drag and Drop

1. Open <https://app.netlify.com/drop>
2. Drag this project folder into the page
3. Netlify will publish the site immediately

### Option 2: GitHub + Netlify

1. Push this repository to GitHub
2. In Netlify, choose "Add new site" -> "Import an existing project"
3. Select the GitHub repository
4. Build settings:
   - Build command: (empty)
   - Publish directory: `.`
5. Deploy

### Option 3: Netlify CLI

```bash
netlify deploy --prod
```

Run from the project root.

## Local Preview

```bash
netlify dev
```

## Post-Deploy Checklist

- Confirm images load from `uploads/`
- Submit contact form and verify WhatsApp opens
- Test newsletter form behavior
- Verify mobile menu and section links
- Verify HTTPS redirect works