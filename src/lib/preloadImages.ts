import gapsData from "../data/gaps.json";
import storiesData from "../data/stories.json";
import type { GapRecord, StoryRecord } from "../types";

const staticImagePaths = [
  "/images/action/action_banner.jpg",
  "/images/about/background_stockton.png",
  "/images/connection/connection_banner.jpg",
  "/images/home/background_home.jpg",
  "/images/logo_dark.png",
  "/images/logo_light.png",
  "/images/reality/reality_banner.jpg",
];

const decodedImages = new Map<string, HTMLImageElement>();
const pendingImages = new Map<string, Promise<void>>();

export function warmSiteImages() {
  if (typeof window === "undefined") return;

  const paths = collectSiteImagePaths();

  runWhenIdle(() => {
    void warmImagesSequentially(paths);
  });
}

export function warmImage(src?: string) {
  if (!src || typeof window === "undefined") return Promise.resolve();
  if (decodedImages.has(src)) return Promise.resolve();

  const pending = pendingImages.get(src);
  if (pending) return pending;

  const image = new Image();
  image.decoding = "sync";
  image.loading = "eager";
  image.src = src;

  const promise = (typeof image.decode === "function"
    ? image.decode()
    : new Promise<void>((resolve, reject) => {
        image.onload = () => resolve();
        image.onerror = () => reject(new Error(`Unable to preload ${src}`));
      }))
    .then(() => {
      decodedImages.set(src, image);
      pendingImages.delete(src);
    })
    .catch(() => {
      pendingImages.delete(src);
    });

  pendingImages.set(src, promise);
  return promise;
}

function collectSiteImagePaths() {
  const gaps = gapsData as GapRecord[];
  const stories = storiesData as StoryRecord[];

  return Array.from(new Set([
    ...staticImagePaths,
    ...gaps.map((gap) => gap.artwork),
    ...stories.map((story) => story.image),
  ].filter((path): path is string => Boolean(path))));
}

async function warmImagesSequentially(paths: string[]) {
  for (const src of paths) {
    await warmImage(src);
  }
}

function runWhenIdle(callback: () => void) {
  const scheduler = window as Window & {
    requestIdleCallback?: (callback: () => void, options?: { timeout: number }) => number;
  };

  if (scheduler.requestIdleCallback) {
    scheduler.requestIdleCallback(callback, { timeout: 1500 });
    return;
  }

  globalThis.setTimeout(callback, 250);
}
