import { useEffect, useState } from "react";
import { explorerSnapshot, searchExplorerRecords } from "../model/explorer";
import { recordIdFromSearch } from "./explorer-url";

const selectedFromUrl = () => recordIdFromSearch(window.location.search);

export function useExplorerController() {
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  useEffect(() => {
    const sync = () => setSelectedId(selectedFromUrl());
    sync();
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const selectRecord = (id: string) => {
    const url = new URL(window.location.href);
    url.searchParams.set("record", id);
    window.history.pushState({}, "", `${url.pathname}${url.search}${url.hash}`);
    setSelectedId(id);
    requestAnimationFrame(() => document.getElementById("explorer-selected-record")?.scrollIntoView({ block: "start" }));
  };
  return {
    query,
    setQuery,
    results: searchExplorerRecords(query),
    selectedId,
    selectedRecord: selectedId ? explorerSnapshot.records[selectedId] : undefined,
    selectRecord,
  };
}
