# QR Forge

Static QR code generator. No backend, no database, no account, unlimited client-side generation.

## Run locally
Open `index.html` in a browser, or serve the folder with any static server.

## Hosting
Upload the three files (`index.html`, `style.css`, `app.js`) to any static hosting provider.

The app uses the `qrcode` JavaScript library from jsDelivr. For a fully offline deployment, download the library and replace the CDN script in `index.html` with a local copy.

## Features
- URL, plain text, Wi-Fi, and vCard/contact QR
- PNG + SVG download
- Foreground/background color
- Transparent background
- 256–768px output
- Margin control
- Responsive desktop/mobile layout
- No signup, no server, no content upload
