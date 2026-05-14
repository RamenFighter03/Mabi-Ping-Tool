#!/usr/bin/env node
const http = require("http"), net = require("net"), https = require("https"), fs = require("fs"), path = require("path");
const puppeteer = require("puppeteer-core");
const CHROME = "C:\\Users\\suici\\.cache\\puppeteer\\chrome-headless-shell\\win64-148.0.7778.97\\chrome-headless-shell-win64\\chrome-headless-shell.exe";

async function ahSearch(item, page) {
  const browser = await puppeteer.launch({ executablePath: CHROME, headless: true, args: ["--no-sandbox"] });
  try {
    const pg = await browser.newPage();
    const body = JSON.stringify([{ operationName:"auctionHouseSearch", variables:{ server:"mabius6", filters:[{type:"ItemName",value:item}], pagination:{pageSize:20,pageIndex:+page||0}, sort:{attribute:"Price",direction:"Ascending"} }, extensions:{ persistedQuery:{ version:1, sha256Hash:"e42f50b9ab00b0e7b820afbaae91c07722178ed6b0d3aa3b578c8cc4edfe3a84" } } }]);
    let captured = null;
    await pg.setRequestInterception(true);
    pg.on("request", req => req.continue());
    pg.on("response", async response => {
      if (response.url().includes("graphql") && response.request().method() === "POST") {
        try {
          const text = await response.text();
          if (text.includes("auctionHouse") && text.includes("results")) captured = text;
        } catch {}
      }
    });
    const searchUrl = `https://na.mabibase.com/tools/auction-house?server=mabius6&q=ItemName%2C%22${encodeURIComponent(item)}%22&sort=Price%3AAscending&page=${+page||0}`;
    await Promise.race([
      pg.goto(searchUrl, { waitUntil:"domcontentloaded", timeout:20000 }),
      new Promise(r => setTimeout(r, 20000))
    ]);
    // Wait up to 10s for the graphql response to be captured
    const res = await new Promise((resolve, reject) => {
      if (captured) return resolve(captured);
      const t = setTimeout(() => reject(new Error("graphql response timeout")), 10000);
      const iv = setInterval(() => { if (captured) { clearTimeout(t); clearInterval(iv); resolve(captured); } }, 100);
    });
    if (!res) throw new Error("no graphql response captured");
    const parsed = JSON.parse(res);
    const ah = (Array.isArray(parsed) ? parsed[0] : parsed)?.data?.auctionHouse;
    if (!ah) throw new Error("unexpected response: " + res.substring(0,200));
    return { total: ah.total, results: (ah.results||[]).map(r => ({ listingId:r.listingId, itemName:r.itemName, type:r.type, price:r.price1, endDate:r.endDate, owner:r.itemInfo?.metaData1?.OWNER||null })) };
  } finally { await browser.close(); }
}
const CONFIG = path.join(__dirname, "channels.json");
const HTML   = fs.readFileSync(path.join(__dirname, "public", "index.html"), "utf8");

const DEFAULTS = [
  { name:"Login",   ip:"35.162.171.43",  port:11000, note:"Login server" },
  { name:"Ch 1",    ip:"34.218.42.114",  port:11020 },
  { name:"Ch 2",    ip:"50.112.234.180", port:11021 },
  { name:"Ch 3",    ip:"52.32.149.152",  port:11022 },
  { name:"Ch 4",    ip:"52.34.200.191",  port:11020 },
  { name:"Ch 5",    ip:"35.160.179.201", port:11021 },
  { name:"Ch 6",    ip:"52.27.21.224",   port:11022 },
  { name:"Ch 7",    ip:"52.41.162.90",   port:11023 },
  { name:"Ch 8",    ip:"54.70.187.83",   port:11020 },
  { name:"Ch 9",    ip:"52.39.64.186",   port:11021 },
  { name:"Ch 10",   ip:"52.11.161.60",   port:11022 },
  { name:"Ch 11",   ip:"54.213.53.13",   port:11022 },
  { name:"Ch 12",   ip:"44.234.73.29",   port:11022 },
  { name:"Ch 13",   ip:"35.162.195.251", port:11022 },
  { name:"Ch 14",   ip:"44.250.19.242",  port:11022 },
  { name:"Ch 15",   ip:"44.253.9.16",    port:11022 },
  { name:"Ch 16",   ip:"44.230.175.95",  port:11022 },
  { name:"Housing", ip:"52.41.162.90",   port:11023, note:"Marketplace" },
];

const load  = () => { try { return JSON.parse(fs.readFileSync(CONFIG, "utf8")); } catch { return DEFAULTS; } };
const save  = ch => fs.writeFileSync(CONFIG, JSON.stringify(ch, null, 2));
const valid = arr => Array.isArray(arr) && arr.every(c =>
  c && typeof c.name === "string" && c.name.trim() &&
  typeof c.port === "number" && c.port >= 1 && c.port <= 65535 &&
  typeof c.ip === "string"
);

async function tcpPing(ip, port, timeout = 3000) {
  if (!ip?.trim()) return null;
  const attempt = () => new Promise(resolve => {
    const t0 = Date.now(), sock = new net.Socket();
    const done = ms => { try { sock.destroy(); } catch {} resolve(ms); };
    sock.setTimeout(timeout);
    sock.once("connect", () => done(Date.now() - t0));
    sock.once("timeout", () => done(null));
    sock.once("error",   () => done(null));
    sock.connect(port, ip);
  });
  const ms = await attempt();
  return ms !== null ? ms : attempt();
}

const pingAll = chs => Promise.all(chs.map(async ch => ({ ...ch, ms: await tcpPing(ch.ip, ch.port) })));

const server = http.createServer(async (req, res) => {
  const send = (code, ct, body) => { res.writeHead(code, { "Content-Type": ct }); res.end(body); };
  const { method, url } = req;
  const u = new URL(url, "http://localhost");

  if (method === "GET"  && u.pathname === "/")         return send(200, "text/html", HTML);
  if (method === "GET"  && u.pathname === "/channels") return send(200, "application/json", JSON.stringify(load()));
  if (method === "GET" && u.pathname === "/auction") {
    const item = (u.searchParams.get("item") || "").trim();
    if (!item) return send(400, "text/plain", "missing item param");
    try { return send(200, "application/json", JSON.stringify(await ahSearch(item, u.searchParams.get("page")))); }
    catch(e) { console.error(e); return send(500, "text/plain", e.message); }
  }
  if (method === "POST" && u.pathname === "/ping") {
    try { return send(200, "application/json", JSON.stringify(await pingAll(load()))); }
    catch(e) { console.error(e); return send(500, "text/plain", "ping error"); }
  }
  if (method === "POST" && u.pathname === "/channels") {
    let body = "";
    req.on("data", d => body += d);
    req.on("end", () => {
      try {
        const ch = JSON.parse(body);
        if (!valid(ch)) return send(400, "text/plain", "invalid data");
        save(ch); send(200, "application/json", "{}");
      } catch { send(400, "text/plain", "bad json"); }
    });
    return;
  }
  send(404, "text/plain", "not found");
});

const PORT = 7799;
server.listen(PORT, "127.0.0.1", () => console.log(`\x1b[36mMabiPing running → http://localhost:${PORT}\x1b[0m`));
server.on("error", e => { console.error(e.code === "EADDRINUSE" ? `\x1b[31mPort ${PORT} in use.\x1b[0m` : e); process.exit(1); });











