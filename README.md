# 🚀 Local Drive (Official)

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React_18-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Electron](https://img.shields.io/badge/Electron-47848F?style=for-the-badge&logo=electron&logoColor=white)](https://www.electronjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-43853D?style=for-the-badge&logo=node.js&logoColor=white)](https://nodejs.org/)
[![Telegram MTProto](https://img.shields.io/badge/Telegram-MTProto_API-2CA5E0?style=for-the-badge&logo=telegram&logoColor=white)](https://core.telegram.org/mtproto)
[![Support Me](https://img.shields.io/badge/Support_Me-SupportKori-FF5E5B?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white)](https://www.supportkori.com/arafathrahman)

<p align="center">
  <strong>A high-performance, cross-platform personal cloud drive that leverages Telegram's distributed data centers for unlimited, free cloud storage.</strong>
</p>

<p align="center">
  <a href="#-key-features">Key Features</a> •
  <a href="#-system-architecture">System Architecture</a> •
  <a href="#-data-flow-pipelines">Data Flow</a> •
  <a href="#-getting-started">Getting Started</a> •
  <a href="#-desktop--mobile-builds">Platform Builds</a> •
  <a href="#-support--buy-me-a-coffee">Support</a>
</p>

</div>

---

## 📖 Overview

**Local Drive** is a modern cloud storage ecosystem engineered as an alternative to proprietary, subscription-gated cloud services like Google Drive and Dropbox. By utilizing Telegram's MTProto API as an underlying decentralized storage backend, Local Drive offers **unlimited cloud storage with zero monthly recurring costs**.

Unlike simple bot-based scripts, Local Drive implements a complete full-stack architecture featuring an embedded high-speed streaming server, client-side session management, real-time transfer tracking, and native desktop (Windows Electron) and mobile (Android) apps.

---

## ✨ Key Features

- **⚡ Unlimited Cloud Storage:** Store unlimited files up to **2 GB per file** (Telegram standard media limit) directly in your private Telegram cloud.
- **🛡️ Zero-Knowledge & Privacy First:** No third-party databases holding your files. All files reside directly in your private Telegram *Saved Messages* using encrypted MTProto client sessions.
- **🎬 Instant Media Streaming (HTTP 206 Range Requests):** Stream 4K/1080p videos and audio files on-the-fly without waiting for the full file to download locally.
- **📂 Hierarchical File System:** Create nested folders, customize folder colors, rename, move, star, and soft-delete files with a dedicated Recycle Bin / Trash quarantine.
- **🚀 Real-Time Speed & Transfer Engine:** Live upload and download speed meters with rolling-window smoothing (Mbps), stage trackers, and multi-threaded chunk pipelines.
- **🖥️ True Cross-Platform Experience:**
  - **Web Application:** Responsive, fluid UI built with React 18, Vite, and Tailwind CSS.
  - **Desktop Application (Windows):** Built with Electron, offering background daemon execution, native window chrome, and system tray integration.
  - **Android Mobile App:** Hybrid native integration powered by Capacitor for on-the-go file management.
- **🔐 Secure Authentication:** Seamless login via phone number, verification code, and full support for Telegram Two-Step Verification (2FA Cloud Password).

---

## 🏗️ System Architecture

Local Drive is architected into four decoupled, highly specialized tiers:

```mermaid
flowchart TD
    subgraph ClientLayer["🖥️ Presentation & Client Layer"]
        A1["Web Browser (React 18 + Vite SPA)"]
        A2["Desktop Shell (Electron + Sandbox)"]
        A3["Android App (Capacitor WebView)"]
    end

    subgraph GatewayLayer["⚙️ Local Gateway & Backend Engine (Express / Node.js)"]
        B1["Dynamic Reverse Proxy & Port Negotiator (38917-38920)"]
        B2["Session & Auth Controller (StringSession / 2FA Engine)"]
        B3["Chunk Streamer & HTTP 206 Range Request Handler"]
        B4["Metadata Parser & Tag Envelope Indexer (#LocalDrive)"]
    end

    subgraph ProtocolLayer["📡 Protocol & Transport Layer (GramJS MTProto)"]
        C1["MTProto Client Instance Pool"]
        C2["Binary Chunk Multiplexer & Retries"]
        C3["AES-IGE Encryption & RPC Channels"]
    end

    subgraph StorageLayer["☁️ Telegram Distributed DC Cloud"]
        D1["Telegram DC Network (DC1 - DC5)"]
        D2["Saved Messages Vault ('me')"]
        D3["Encrypted Document / Media Blobs"]
    end

    A1 <-->|"HTTP / REST / Streaming"| B1
    A2 <-->|"Local IPC / Loopback HTTP"| B1
    A3 <-->|"REST API / WebView Bridge"| B1

    B1 --> B2
    B1 --> B3
    B1 --> B4

    B2 <--> C1
    B3 <--> C2
    B4 <--> C1

    C1 <-->|"MTProto TCP / TLS"| D1
    C2 <-->|"Parallel Upload / Download"| D2
    D2 --- D3
```

---

### Layer-by-Layer Architecture Breakdown

#### 1. Presentation & Client Layer
- **React 18 + TypeScript:** Delivers a component-driven, type-safe interface for managing files, cards, context menus, and inspection modals.
- **Drive Context (`DriveContext.tsx`):** Maintains global client state including active directories, starred items, search filters, and live transfer queues.
- **Transfer Monitor:** Features a rolling speed meter that samples byte throughput every millisecond to render smooth, jitter-free transfer graphs in Mbps.
- **Desktop Electron Container (`electron/main.cjs`):** Launches an isolated, sandboxed window that auto-negotiates an open loopback port (38917–38920) to host the embedded server locally.

#### 2. Local Gateway & API Server (`server.ts`)
- **Express Backend:** Acts as an abstraction layer between standard HTTP REST queries and MTProto remote procedure calls (RPC).
- **HTTP 206 Partial Content Streaming Engine:** Intercepts browser `Range: bytes=start-end` request headers. It translates byte ranges into MTProto chunk requests, downloading only the exact slices needed for video playback or audio seeking.
- **Metadata Envelope Protocol:** Because Telegram messages don't have native folder hierarchies, Local Drive stores metadata (filename, folder ID, parent folder, timestamps, and tags) directly within the message payload and caption tagged with `#CloudGram` / `#LocalDrive`.

#### 3. MTProto Transport Core (GramJS)
- **High-Speed Binary Transfer:** Operates on raw Telegram MTProto protocol via GramJS, avoiding bot API rate limits and file size restrictions (up to 2GB vs bot 50MB limit).
- **Session String Architecture:** Generates an encrypted `StringSession` during the Telegram login handshake. This session token is kept locally on the client/cookie and is never uploaded to any remote database.

#### 4. Telegram Distributed Storage Vault
- All files are securely committed to Telegram's global data centers in your private `Saved Messages` conversation.
- Files benefit from Telegram's enterprise-grade replication, uptime, and unlimited archival capacity.

---

## 🔄 Data Flow Pipelines

### ⬆️ File Upload Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant UI as React Frontend
    participant SVR as Local Gateway (Express)
    participant MT as MTProto Engine (GramJS)
    participant TG as Telegram Cloud (Saved Messages)

    User->>UI: Selects file (Drag & Drop or File Picker)
    UI->>SVR: POST /api/tg/upload (Multipart Stream)
    SVR->>MT: Split file into 512KB chunks
    loop Parallel Upload
        MT->>TG: Send file parts via MTProto RPC
    end
    TG-->>MT: Upload completed (File ID returned)
    MT->>TG: SendMedia message with caption [#LocalDrive Metadata Envelope]
    TG-->>MT: Message confirmed in Saved Messages
    MT-->>SVR: File record created
    SVR-->>UI: 200 OK (Item appended to Drive view)
    UI-->>User: Upload notification & real-time progress completed
```

---

### ⬇️ Streaming & Download Pipeline

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Player as HTML5 Video/Audio Player
    participant SVR as Local Gateway (Express)
    participant MT as MTProto Engine (GramJS)
    participant TG as Telegram Cloud

    User->>Player: Plays Video or Seeks to timestamp
    Player->>SVR: GET /api/tg/download/:id (Header: Range: bytes=1048576-)
    SVR->>SVR: Calculate chunk boundaries & byte offsets
    SVR->>MT: Request byte slice from Telegram Document
    MT->>TG: upload.getFile (offset, limit)
    TG-->>MT: Binary chunk buffer
    MT-->>SVR: Stream chunk
    SVR-->>Player: HTTP 206 Partial Content (Content-Range: bytes ...)
    Player-->>User: Seamless instant video/audio playback
```

---

## 💻 Tech Stack Matrix

| Area | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend Framework** | React 18 + TypeScript | Component architecture, state synchronization, and reactive UI |
| **Build Tooling** | Vite | Lightning-fast HMR and optimized production bundling |
| **Styling & Icons** | Tailwind CSS + Lucide Icons | Responsive modern design, dark/light themes, and custom icons |
| **Desktop Runtime** | Electron | Cross-platform desktop shell with system isolation and auto-porting |
| **Mobile Runtime** | Capacitor | Native Android wrapper bridging Web UI to mobile hardware |
| **Backend Framework** | Node.js + Express | REST API, multipart file parsing, and streaming proxy |
| **Protocol Engine** | GramJS (`telegram`) | Direct MTProto client implementation for high-speed Telegram RPC |
| **File Parsing** | Multer | Memory-efficient multipart stream piping |
| **Packaging** | electron-builder | Production Windows `.exe` installers (NSIS) and portable executables |

---

## 🚀 Getting Started

### Prerequisites

- **[Node.js](https://nodejs.org/)** (v18.x or v20.x recommended)
- **npm** or **yarn**
- **Telegram API Credentials:** Obtain your free `API_ID` and `API_HASH` from [my.telegram.org](https://my.telegram.org) under *API Development Tools*.

---

### 1. Clone the Repository

```bash
git clone https://github.com/smartworldarafath/Local-Drive-Official.git
cd Local-Drive-Official
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` with your API credentials (or use default development values):

```ini
# Telegram API Credentials (from https://my.telegram.org)
TELEGRAM_API_ID=your_api_id_here
TELEGRAM_API_HASH=your_api_hash_here

# Random secret string for signing session cookies
SESSION_SECRET=your_custom_secret_key_here

# Environment
NODE_ENV=development
```

### 4. Run in Development Mode

To run the full stack (Vite Dev Server + Express MTProto Backend):

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🖥️ Desktop & Mobile Builds

### Run Electron Desktop Locally

```bash
npm run electron
```

### Build Windows Installer (.exe)

Compile a production-ready NSIS Windows installer:

```bash
npm run dist:win-installer
```
*Output will be generated in the `release/` directory.*

### Build Android APK

The project is pre-configured with Capacitor for Android:

```bash
cd android
./gradlew assembleRelease
```

---

## ⚙️ Available Scripts

| Script | Description |
| :--- | :--- |
| `npm run dev` | Starts backend server and Vite frontend in development mode |
| `npm run build` | Builds the Vite production bundle to `dist/` |
| `npm run build:server` | Bundles `server.ts` into `dist-electron/server.mjs` |
| `npm run electron` | Builds frontend/backend and launches the Electron desktop app |
| `npm run dist:win` | Packages Windows standalone portable binaries |
| `npm run dist:win-installer` | Generates the official Windows setup installer (`.exe`) |
| `npm run lint` | Runs TypeScript type checking without emitting files |

---

## ☕ Support / Buy Me a Coffee & Become a Sponsor

If you find **Local Drive** helpful and want to support ongoing development, maintenance, and new features, consider contributing through any of the options below! Your support means the world and helps keep this project open-source.

<div align="center">

<table>
  <tr>
    <td align="center" width="25%" valign="top">
      <h4>☕ SupportKori</h4>
      <a href="https://www.supportkori.com/arafathrahman" target="_blank">
        <img src="assets/supportkori-qr.jpg" alt="SupportKori QR" width="180" style="border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.15);" />
      </a><br/><br/>
      <a href="https://www.supportkori.com/arafathrahman" target="_blank">
        <img src="https://img.shields.io/badge/Support-SupportKori-FF5E5B?style=for-the-badge&logo=buy-me-a-coffee&logoColor=white" alt="SupportKori Badge" />
      </a><br/>
      <sub>Cards / bKash / Nagad / Global</sub>
    </td>
    <td align="center" width="25%" valign="top">
      <h4>⚡ nsave</h4>
      <img src="assets/nsave-qr.jpg" alt="nsave QR" width="180" style="border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.15);" /><br/><br/>
      <img src="https://img.shields.io/badge/nsave-@arafath__rahman9-000000?style=for-the-badge&logoColor=white" alt="nsave Badge" /><br/>
      <sub>Ntag: <code>@arafath_rahman9</code></sub>
    </td>
    <td align="center" width="25%" valign="top">
      <h4>🔴 RedotPay</h4>
      <img src="assets/redotpay-qr.jpg" alt="RedotPay QR" width="180" style="border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.15);" /><br/><br/>
      <img src="https://img.shields.io/badge/RedotPay-1965421414-E51E2B?style=for-the-badge&logoColor=white" alt="RedotPay Badge" /><br/>
      <sub>ID: <code>1965421414</code></sub>
    </td>
    <td align="center" width="25%" valign="top">
      <h4>🅿️ Payoneer</h4>
      <img src="assets/payoneer-info.jpg" alt="Payoneer Info" width="180" style="border-radius: 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.15);" /><br/><br/>
      <a href="mailto:arafathrahman710@gmail.com?subject=Support%20via%20Payoneer">
        <img src="https://img.shields.io/badge/Payoneer-70366820-FF4800?style=for-the-badge&logo=payoneer&logoColor=white" alt="Payoneer Badge" />
      </a><br/>
      <sub>Email: <code>arafathrahman710@gmail.com</code></sub>
    </td>
  </tr>
</table>

<br/>

| Method | Details / Direct Link |
| :--- | :--- |
| **☕ SupportKori** | [https://www.supportkori.com/arafathrahman](https://www.supportkori.com/arafathrahman) |
| **⚡ nsave** | Ntag: `@arafath_rahman9` • `Md Arafath Rahman` |
| **🔴 RedotPay** | Account ID: `1965421414` |
| **🅿️ Payoneer** | Email: `arafathrahman710@gmail.com` • Customer ID: `70366820` |

</div>


---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
1. Fork the Project (`https://github.com/smartworldarafath/Local-Drive-Official/fork`)
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is distributed under the **MIT License**. See the [LICENSE](LICENSE) file for more information.

---

<div align="center">
  <p>Crafted with ❤️ by <strong><a href="https://github.com/smartworldarafath">Md Arafath Rahman</a></strong></p>
</div>
