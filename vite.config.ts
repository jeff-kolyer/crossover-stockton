import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
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

export default defineConfig({
  plugins: [react(), devImageCacheHeaders(), devGeneratedPages()],
});
