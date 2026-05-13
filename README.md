# MabiPing

A lightweight local latency monitor for **Mabinogi (Erinn server)** channels. Runs a small Node.js server and serves a live dashboard in your browser — no dependencies, no install, just `node server.js`.

![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933?style=flat&logo=node.js&logoColor=white)
![License](https://img.shields.io/badge/license-MIT-blue?style=flat)

---

![MabiPing Dashboard](screenshots/preview.png)

## Features

- **TCP ping** all 18 channels + Login + Housing simultaneously
- **Live dashboard** — latency bar, color-coded status (green / amber / orange / offline)
- **Ping history sparklines** — last 20 pings per channel visualized inline
- **Sort by latency** — click the Latency column header to rank channels
- **Editable channel list** — update IPs and ports directly in the browser, saved to `channels.json`
- **No npm dependencies** — pure Node.js standard library

## Requirements

- [Node.js](https://nodejs.org/) v18 or newer

## Usage

```bash
git clone https://github.com/RamenFighter03/Mabi-Ping-Tool.git
cd Mabi-Ping-Tool
node server.js
```

Then open **http://localhost:7799** in your browser.

## Channel IPs

Default IPs are sourced from the [Mabinogi World Wiki lag page](https://wiki.mabinogiworld.com/view/Lag). If IPs change, use the **Edit Channels** panel in the dashboard to update them — changes are saved locally to `channels.json`.

## Ping Status Legend

| Color | Range |
|-------|-------|
| 🟢 Green | < 80 ms |
| 🟡 Amber | 80–179 ms |
| 🟠 Orange | ≥ 180 ms |
| 🔴 Red | Offline / timeout |

## License

[MIT](LICENSE)
