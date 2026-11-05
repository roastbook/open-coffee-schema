#!/usr/bin/env bash
# Renders docs/assets/social-preview.svg to docs/assets/social-preview.png (1280x640) with headless Chrome
# in Docker, using the self-hosted brand fonts. Upload the PNG by hand (docs/runbook.md). Usage: scripts/social-preview.sh
source "$(dirname "$0")/lib.sh"
command -v docker >/dev/null || { echo "error: needs Docker" >&2; exit 1; }
install_deps

work="$ROOT/.cache/social-preview"
rm -rf "$work" && mkdir -p "$work"
font() { find -L node_modules -path "*$1*/files/*latin-wght-normal.woff2" | head -n1; }
cp "$(font bricolage-grotesque)" "$work/display.woff2"
cp "$(font hanken-grotesk)" "$work/body.woff2"
{
  echo '<!doctype html><meta charset="utf-8"><style>'
  echo '@font-face{font-family:"Bricolage Grotesque Variable";src:url(display.woff2);font-weight:200 800}'
  echo '@font-face{font-family:"Hanken Grotesk Variable";src:url(body.woff2);font-weight:100 900}'
  echo 'html,body{margin:0;width:1280px;height:640px;overflow:hidden}</style>'
  cat docs/assets/social-preview.svg
} > "$work/index.html"

port=9333
docker run -d --rm --name oc-social-preview -p "127.0.0.1:$port:9222" -v "$work:/work:ro" chromedp/headless-shell:stable >/dev/null
trap 'docker rm -f oc-social-preview >/dev/null 2>&1 || true' EXIT
# Drive Chrome over the DevTools protocol: fixed 1280x640 viewport, wait for fonts, screenshot.
bun run - "$port" "$work/out.png" <<'JS'
const [port, out] = process.argv.slice(2);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let target;
for (let i = 0; i < 50 && !target; i++) {
  try { target = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json(); } catch { await sleep(200); }
}
if (!target) throw new Error("Chrome did not start");
const ws = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((r) => ws.addEventListener("open", r, { once: true }));
let id = 0;
const pending = new Map();
ws.addEventListener("message", (m) => { const d = JSON.parse(m.data); pending.get(d.id)?.(d); });
const send = (method, params = {}) => new Promise((resolve, reject) => {
  const n = ++id;
  pending.set(n, (d) => (d.error ? reject(new Error(d.error.message)) : resolve(d.result)));
  ws.send(JSON.stringify({ id: n, method, params }));
});
await send("Emulation.setDeviceMetricsOverride", { width: 1280, height: 640, deviceScaleFactor: 1, mobile: false });
await send("Page.enable");
await send("Page.navigate", { url: "file:///work/index.html" });
await sleep(1500);
await send("Runtime.evaluate", { expression: "document.fonts.ready.then(() => document.fonts.size)", awaitPromise: true });
const { data } = await send("Page.captureScreenshot", { format: "png", clip: { x: 0, y: 0, width: 1280, height: 640, scale: 1 } });
(await import("node:fs")).writeFileSync(out, Buffer.from(data, "base64"));
ws.close();
JS
cp "$work/out.png" docs/assets/social-preview.png
rm -rf "$work"
echo "wrote docs/assets/social-preview.png"
