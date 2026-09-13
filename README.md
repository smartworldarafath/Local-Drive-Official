# Local Drive (Official)

Local Drive is a modern cloud storage solution similar to Google Drive, but designed to be smoother, faster, and more flexible. It works across web, desktop, and Android, allowing users to upload, preview, download, and manage files easily while storing data through Telegram-based storage.

## Features

- **Telegram-Powered Storage:** Unlimited cloud storage powered by Telegram API.
- **Cross-Platform:** Works on Web, Desktop (Electron for Windows), and Android.
- **Fast & Modern UI:** Built with React, TypeScript, and Tailwind CSS.
- **File Management:** Upload, preview, download, star, share, and organize files in folders.

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Telegram API Credentials (`TELEGRAM_API_ID` & `TELEGRAM_API_HASH` from [my.telegram.org](https://my.telegram.org))

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure environment variables (optional if using defaults):
   ```bash
   cp .env.example .env
   ```

3. Run development server:
   ```bash
   npm run dev
   ```

### Building for Desktop (Windows)

```bash
npm run dist:win-installer
```

