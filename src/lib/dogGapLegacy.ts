export const dogGapSlug = "too-many-dogs-still-lack-safe-placement";
export const dogGapBase = `/reality/${dogGapSlug}/`;
export const dogMapPath = `${dogGapBase}dogs-locations-map/`;

export type DogGapDestination = {
  section: "ways-to-help" | "improvements" | "our-findings" | "research";
  anchor?: string;
};

export function legacyDogWorkDestination(workId: string, anchor?: string): DogGapDestination | null {
  if (workId === "dogs-public-source-review") return { section: "research", anchor };
  if (workId === "dogs-solutions") return { section: "improvements", anchor };
  if (workId === "dogs-map-placement-barriers") {
    if (anchor?.startsWith("pathways-")) return { section: "ways-to-help", anchor };
    return { section: "our-findings", anchor: anchor?.startsWith("investigation-") || anchor === "field-observation-procedure" ? anchor : undefined };
  }
  if (workId === "dogs-direct-field-work") {
    return { section: "our-findings", anchor: anchor?.includes("records-request") ? "investigation-records-request" : "activity-log" };
  }
  return null;
}

export function dogGapDestinationHref(destination: DogGapDestination) {
  return `${dogGapBase}${destination.section}/${destination.anchor ? `#${encodeURIComponent(destination.anchor)}` : ""}`;
}
