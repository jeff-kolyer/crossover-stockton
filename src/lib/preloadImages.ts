const decodedImages = new Map<string, HTMLImageElement>();
const pendingImages = new Map<string, Promise<void>>();

export function warmImage(src?: string) {
  if (!src || typeof window === "undefined") return Promise.resolve();
  if (decodedImages.has(src)) return Promise.resolve();

  const pending = pendingImages.get(src);
  if (pending) return pending;

  const image = new Image();
  image.decoding = "async";
  image.loading = "eager";

  const promise = new Promise<void>((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error(`Unable to preload ${src}`));
    image.src = src;

    if (image.complete && image.naturalWidth > 0) resolve();
  })
    .then(() => (typeof image.decode === "function" ? image.decode() : undefined))
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
