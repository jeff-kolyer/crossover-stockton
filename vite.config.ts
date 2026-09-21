import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

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

export default defineConfig({
  plugins: [react(), devImageCacheHeaders()],
});
