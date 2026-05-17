# MabiPing

A lightweight local latency monitor and auction house tool for **Mabinogi (Erinn server)**. Pings all channels simultaneously and lets you search the NA auction house — all from your browser.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat)

---

![MabiPing Dashboard](screenshots/preview.png)

## Features

### ⚡ Ping Tab
- **TCP ping** all 16 channels + Login + Housing simultaneously
- **Live dashboard** — latency bar, color-coded status (green / amber / orange / offline)
- **Auto-ping** every 30 seconds with live countdown
- **Ping history sparklines** — last 20 pings per channel visualized inline
- **Sort by latency** — click the Latency column header to rank channels
- **5 stat cards** — Online, Offline, Best, Avg, and Worst ping
- **Editable channel list** — update IPs and ports directly in the browser, saved to `channels.json`

### 🏪 Auction House Tab
- **Search by item name** on the Mabius 6 server via [mabibase.com](https://na.mabibase.com)
- **Autocomplete dropdown** — suggestions appear as you type (debounced, cached)
- **Paginated results** — 20 listings per page with Prev / Next controls
- Shows item name, type (Fixed / Auction), price, owner, and end date

## How Auction House Search Works

The AH feature uses **Puppeteer** to drive a headless Chrome instance rather than calling mabibase.com's API directly. When you search:

1. The server launches headless Chrome and navigates to the mabibase.com search URL
2. A network response listener watches for the GraphQL POST that mabibase's own frontend fires automatically
3. Once captured, the response is parsed and returned as JSON — the browser is then closed

This approach piggybacks on mabibase's existing page behavior instead of reverse-engineering the API, making it more resilient to auth or CORS changes. The tradeoff is that each search spawns a full browser instance (~2–5s per query).

## Setup

### Step 1 — Install Node.js (one time only)

Node.js is a free runtime that lets you run this tool. If you've never installed it:

1. Go to **https://nodejs.org**
2. Download the **LTS** version (the left button)
3. Run the installer, click Next through everything, leave all options as default

To check it installed correctly, open Command Prompt and type:
```
node --version
```
You should see something like `v22.0.0`. If you do, you're ready.

### Step 2 — Download MabiPing

Click the green **Code** button on this page and choose **Download ZIP**, then extract it anywhere you like (e.g. your Desktop).

Or if you have Git:
```
git clone https://github.com/RamenFighter03/Mabi-Ping-Tool.git
```

### Step 3 — Install dependencies

Open a Command Prompt inside the folder and run:
```
npm install
```

This installs `puppeteer-core`, which is required for the Auction House feature.

> **Note:** The auction house search uses a hardcoded Chrome headless shell path. If it doesn't work out of the box, run `npx puppeteer browsers install chrome-headless-shell` once to download it.

### Step 4 — Run it

```
node server.js
```

You should see:
```
MabiPing running → http://localhost:7799
```

### Step 5 — Open the dashboard

Open your browser and go to **http://localhost:7799**

That's it. The tool will start pinging all channels automatically and refresh every 30 seconds.

> To stop it, press `Ctrl+C` in the terminal window.

## File Structure

```
mabi-ping/
├── server.js          # Node.js server (routes, TCP ping logic, AH scraper)
├── public/
│   └── index.html     # Dashboard UI (HTML/CSS/JS) — Ping + Auction House tabs
├── channels.json      # Created on first save — stores custom IPs/ports
└── package.json
```

## Channel IPs

Default IPs are sourced from the [Mabinogi World Wiki lag page](https://wiki.mabinogiworld.com/view/Lag). If IPs change, use the **Edit Channels** panel in the dashboard to update them — changes are saved locally to `channels.json`.

## Ping Status Legend

| Color | Range |
|-------|-------|
| Green | < 80 ms |
| Amber | 80–179 ms |
| Orange | ≥ 180 ms |
| Red | Offline / timeout |

## License

[MIT](LICENSE)
