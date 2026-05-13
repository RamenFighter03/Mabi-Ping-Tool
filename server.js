#!/usr/bin/env node
const http = require("http"), net = require("net"), fs = require("fs"), path = require("path");
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

  if (method === "GET"  && url === "/")         return send(200, "text/html", HTML);
  if (method === "GET"  && url === "/channels") return send(200, "application/json", JSON.stringify(load()));
  if (method === "POST" && url === "/ping") {
    try { return send(200, "application/json", JSON.stringify(await pingAll(load()))); }
    catch(e) { console.error(e); return send(500, "text/plain", "ping error"); }
  }
  if (method === "POST" && url === "/channels") {
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
