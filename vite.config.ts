import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

const imageCacheControl = "public, max-age=31536000, immutable";

function cachePublicImages() {
  return {
    name: "cache-public-images",
    configureServer(server) {
      server.middlewares.use(cacheImagesMiddleware);
    },
    configurePreviewServer(server) {
      server.middlewares.use(cacheImagesMiddleware);
    },
  };
}

function cacheImagesMiddleware(req, res, next) {
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
  plugins: [react(), cachePublicImages()],
});
