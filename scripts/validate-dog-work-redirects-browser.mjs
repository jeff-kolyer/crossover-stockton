import assert from "node:assert/strict";

const port = process.env.CDP_PORT || "9335";
const pages = await fetch(`http://127.0.0.1:${port}/json/list`).then((response) => response.json());
const page = pages.find((entry) => entry.type === "page" && entry.url === "about:blank") ?? pages.find((entry) => entry.type === "page" && entry.url.startsWith("http://localhost:5173/"));
assert.ok(page, "No test browser tab is available");
const socket = new WebSocket(page.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  socket.addEventListener("open", resolve, { once: true });
  socket.addEventListener("error", reject, { once: true });
});
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
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
}
async function evaluate(expression) {
  const result = await send("Runtime.evaluate", { expression, returnByValue: true, awaitPromise: true });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
}
async function waitFor(pathname) {
  for (let attempt = 0; attempt < 80; attempt++) {
    const state = await evaluate("({ path: location.pathname, ready: document.readyState, heading: document.querySelector('.dog-gap-tab-heading h2, .investigation-section h2, .research-section h2')?.textContent, legacyMenu: !!document.querySelector('.work-switcher') })");
    if (state.path === pathname && state.ready === "complete" && state.heading) return state;
    await new Promise((resolve) => setTimeout(resolve, 100));
  }
  throw new Error(`Timed out waiting for ${pathname}`);
}

await send("Page.enable");
await send("Runtime.enable");
const base = "/reality/too-many-dogs-still-lack-safe-placement/";
const cases = [
  ["dogs-public-source-review", "research/"],
  ["dogs-map-placement-barriers", "our-findings/"],
  ["dogs-solutions", "improvements/"],
  ["dogs-direct-field-work", "our-findings/"],
];
for (const [id, target] of cases) {
  await send("Page.navigate", { url: `http://localhost:5173/work/${id}/` });
  const state = await waitFor(base + target);
  assert.ok(!state.legacyMenu, `${id} still shows the old menu`);
  console.log(`${id} → ${state.path}`);
}
await send("Page.navigate", { url: "http://localhost:5173/work/dogs-map-placement-barriers/#pathways-shelter" });
await waitFor(base + "ways-to-help/");
assert.equal(await evaluate("location.hash"), "#pathways-shelter");
await send("Page.navigate", { url: "http://localhost:5173/work/dogs-locations-map/" });
for (let attempt = 0; attempt < 80; attempt++) {
  if (await evaluate("location.pathname === '/work/dogs-locations-map/' && !!document.querySelector('.map-work-grid')")) break;
  if (attempt === 79) throw new Error("The locations map no longer loads at its Work URL");
  await new Promise((resolve) => setTimeout(resolve, 100));
}
console.log("Legacy redirects, contextual pathway anchor, and retained map route passed.");
socket.close();
