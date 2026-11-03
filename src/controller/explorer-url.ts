export const recordIdFromSearch = (search: string) => new URLSearchParams(search).get("record");

export function explorerRecordUrl(id: string) {
  const url = new URL("/data/", "https://crossover.local");
  url.searchParams.set("record", id);
  return `${url.pathname}${url.search}`;
}
