import { defineConfig } from "vite";
import { existsSync, readFileSync } from "node:fs";
import { resolve, sep } from "node:path";

const imageCacheControl = "public, max-age=600";

function devImageCacheHeaders() {
  return {
    name: "dev-image-cache-headers",
    configureServer(server) {
      server.middlewares.use(cacheImageResponses);
    },
    configurePreviewServer(server) {
      server.middlewares.use(cacheImageResponses);
    },
  };
}

function cacheImageResponses(req, res, next) {
  const path = req.url?.split("?")[0] ?? "";

  if (path.startsWith("/images/")) {
    const setHeader = res.setHeader;
    res.setHeader = function setImageCacheHeader(name, value) {
      if (typeof name === "string" && name.toLowerCase() === "cache-control") {
        return setHeader.call(this, name, imageCacheControl);
      }
      return setHeader.call(this, name, value);
    };
  }

  next();
}

function devGeneratedPages() {
  return {
    name: "dev-generated-pages",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.method !== "GET") return next();
        const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
        if (pathname === "/site.css" || pathname === "/care-site.css" || pathname === "/site.js") {
          const asset = resolve("dist", pathname.slice(1));
          if (existsSync(asset)) {
            res.setHeader("Content-Type", pathname.endsWith(".css") ? "text/css; charset=utf-8" : "text/javascript; charset=utf-8");
            res.end(readFileSync(asset));
            return;
          }
        }
        if (pathname === "/" || pathname.startsWith("/@") || pathname.startsWith("/src/")) return next();
        const dist = resolve("dist");
        const directory = resolve(dist, `.${pathname.endsWith("/") ? pathname : `${pathname}/`}`);
        if (!directory.startsWith(`${dist}${sep}`)) return next();
        const file = resolve(directory, "index.html");
        if (!existsSync(file)) return next();
        res.setHeader("Content-Type", "text/html; charset=utf-8");
        res.end(readFileSync(file));
      });
    },
  };
}

function siteMdPreviewPages() {
  const serve = (req, res, next) => {
    if (req.method !== "GET") return next();
    const pathname = new URL(req.url ?? "/", "http://localhost").pathname;
    if (!pathname.startsWith("/preview/site-md/") || !pathname.endsWith("/")) return next();
    const root = resolve("public/preview/site-md");
    const directory = resolve(root, `.${pathname.slice("/preview/site-md".length)}`);
    if (directory !== root && !directory.startsWith(`${root}${sep}`)) return next();
    const file = resolve(directory, "index.html");
    if (!existsSync(file)) return next();
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.end(readFileSync(file));
  };
  return {
    name: "site-md-preview-pages",
    configureServer(server) { server.middlewares.use(serve); },
    configurePreviewServer(server) { server.middlewares.use(serve); },
  };
}

export default defineConfig({
  plugins: [devImageCacheHeaders(), siteMdPreviewPages(), devGeneratedPages()],
});
