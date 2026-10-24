import assert from "node:assert/strict";
import gaps from "../src/data/gaps.json" with { type: "json" };

const port = process.env.CDP_PORT || "9334";
const targets = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const target = targets.find((entry) => entry.type === "page");
assert.ok(target, "No headless Chrome page is available");
const socket = new WebSocket(target.webSocketDebuggerUrl);
await new Promise((resolve, reject) => { socket.addEventListener("open", resolve, { once: true }); socket.addEventListener("error", reject, { once: true }); });
let nextId = 0;
const pending = new Map();
socket.addEventListener("message", ({ data }) => {
  const message = JSON.parse(data);
  const waiter = pending.get(message.id);
  if (!waiter) return;
  pending.delete(message.id);
  if (message.error) waiter.reject(new Error(message.error.message));
  else waiter.resolve(message.result);
});
function send(method, params = {}) {
  const id = ++nextId;
  return new Promise((resolve, reject) => { pending.set(id, { resolve, reject }); socket.send(JSON.stringify({ id, method, params })); });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}
async function until(expression) {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (await evaluate(expression)) return;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${expression}`);
}
await send("Page.enable");
await send("Runtime.enable");
await send("Emulation.setDeviceMetricsOverride", { width: 1440, height: 900, deviceScaleFactor: 1, mobile: false });

const pages = ["", "key-factors/", "ways-to-help/", "improvements/", "our-findings/", "research/", "updates/"];
const results = [];
for (const gap of gaps.filter((item) => item.active)) {
  for (const page of pages.filter((item) => item !== "our-findings/" || gap.investigation_status === "investigating")) {
    const url = `http://127.0.0.1:5173/reality/${gap.slug}/${page}`;
    await send("Page.navigate", { url });
    await until(`location.pathname === ${JSON.stringify(new URL(url).pathname)} && document.readyState === 'complete' && !!document.querySelector('.dog-gap-sidebar')`);
    const ids = await evaluate("Array.from(document.querySelectorAll('.dog-gap-sidebar a[href^=\"#\"]'), a => a.hash.slice(1))");
    for (const id of ids) {
      await evaluate("window.scrollTo(0, 0)");
      await evaluate(`document.querySelector('.dog-gap-sidebar a[href="#${id}"]').click()`);
      await new Promise((resolve) => setTimeout(resolve, 120));
      const state = await evaluate(`(() => { const target = document.getElementById(${JSON.stringify(id)}); const rect = target?.getBoundingClientRect(); return { hash: location.hash, top: rect?.top, visible: !!target?.getClientRects().length, scrollY: window.scrollY, maxScroll: document.documentElement.scrollHeight - innerHeight }; })()`);
      results.push({ gap: gap.slug, page: page || "overview", id, ...state });
    }
  }
}
const failures = [];
for (const result of results) {
  const reachesTarget = result.visible && result.hash === `#${result.id}` && (Math.abs(result.top - 90) < 125 || Math.abs(result.scrollY - result.maxScroll) < 4 || result.maxScroll < 1);
  if (!reachesTarget) failures.push(result);
}
for (const failure of failures) console.log("FAIL", JSON.stringify(failure));
assert.equal(failures.length, 0, `${failures.length} sidebar clicks did not reach their targets`);
console.log(`Checked ${results.length} sidebar clicks across all active gap pages.`);

await send("Page.navigate", { url: "http://127.0.0.1:5173/reality/too-many-dogs-still-lack-safe-placement/" });
await until("location.pathname === '/reality/too-many-dogs-still-lack-safe-placement/' && document.readyState === 'complete' && !!document.querySelector('.dog-gap-sidebar')");
await evaluate("window.__sidebarEvents = []; window.addEventListener('popstate', () => window.__sidebarEvents.push('popstate')); window.addEventListener('hashchange', () => window.__sidebarEvents.push('hashchange'));");
const point = await evaluate("(() => { const rect = document.querySelector('.dog-gap-sidebar a[href=\"#system-model\"]').getBoundingClientRect(); return { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }; })()");
await send("Input.dispatchMouseEvent", { type: "mousePressed", x: point.x, y: point.y, button: "left", clickCount: 1 });
await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: point.x, y: point.y, button: "left", clickCount: 1 });
await new Promise((resolve) => setTimeout(resolve, 180));
const clicked = await evaluate("({ hash: location.hash, scrollY: scrollY, maxScroll: document.documentElement.scrollHeight - innerHeight, targetTop: document.getElementById('system-model')?.getBoundingClientRect().top, sidebarTop: document.querySelector('.dog-gap-sidebar')?.getBoundingClientRect().top, pathname: location.pathname, readyState: document.readyState, events: window.__sidebarEvents })");
await evaluate("history.back()");
await new Promise((resolve) => setTimeout(resolve, 180));
const afterBack = await evaluate("({ hash: location.hash, scrollY: scrollY })");
await evaluate("history.forward()");
await new Promise((resolve) => setTimeout(resolve, 180));
const afterForward = await evaluate("({ hash: location.hash, scrollY: scrollY })");
console.log("Pointer/back/forward", JSON.stringify({ clicked, afterBack, afterForward }));
assert.equal(clicked.hash, "#system-model");
assert.ok(clicked.scrollY > 200 && Math.abs(clicked.targetTop - 90) < 125, "Physical sidebar click did not scroll to the model");
assert.equal(afterBack.hash, "");
assert.equal(afterForward.hash, "#system-model");
assert.ok(afterForward.scrollY > 200, "Browser Forward did not restore the sidebar anchor");
socket.close();
