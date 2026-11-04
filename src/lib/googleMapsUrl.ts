export type MapReference = {
  query: string;
  precision: "address" | "named_place" | "intersection" | "corridor" | "general_area";
  verified: boolean;
  source_url?: string;
};

/** A Google Maps search for the public geographic reference, not an observed event. */
export function googleMapsSearchUrl(reference: MapReference | null | undefined): string | null {
  const query = reference?.query?.trim();
  if (!query) return null;
  const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  return url.length <= 2048 ? url : null;
}
