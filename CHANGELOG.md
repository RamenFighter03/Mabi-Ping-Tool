# Changelog

## [2026-05-17]

### Added
- **Auction House tab** — search Mabinogi NA auction house (Mabius 6 server) by item name
- `/auction` endpoint in `server.js` — uses Puppeteer to intercept the mabibase.com GraphQL response
- Autocomplete dropdown on auction search input with client-side cache (debounced, 400 ms)
- Pagination controls on auction results (20 listings per page)
- Tab system — Ping and Auction House tabs; ping header controls hide when AH tab is active
- `puppeteer-core` npm dependency (hardcoded Chrome headless shell path for local use)

### Changed
- Project now has an npm dependency (`puppeteer-core`) — "No npm dependencies" no longer applies

## [2026-05-13 19:35]

### Refactor
- Split single-file server into `server.js` (79 lines) and `public/index.html` (205 lines)

### Added
- Auto-ping every 30 seconds with live countdown display in header
- Worst ping stat card (stats bar is now 5 columns)
- TCP ping retries once on failure before marking a channel offline
- Channel save endpoint now validates payload before writing to disk
- Ping endpoint returns 500 on server error
- Port-in-use error (`EADDRINUSE`) handled gracefully on startup

### Fixed
- Ping history keyed by stable index instead of channel name — renaming a channel no longer orphans its sparkline data
- `msClass(undefined)` now returns `"unknown"` instead of falling through to `"ok-high"`
- `barWidth(null)` now returns `0` instead of `100`
- Save button no longer renders stale results on failure
- All fetch calls wrapped in try/catch with error logging
