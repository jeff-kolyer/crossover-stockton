import { useEffect, useState } from "react";
import { explorerCollections, explorerGroups, explorerPathForRecord, explorerSnapshot, searchExplorerRecords } from "../model/explorer";
import { recordIdFromSearch } from "./explorer-url";

export type ExplorerNavigation = "tree" | "breadcrumb";
export type ExplorerDisplay = "reference" | "json";
type ExplorerState = {
  query: string;
  selectedId: string | null;
  inline: boolean;
  groupId: string | null;
  collectionId: string | null;
  navigation: ExplorerNavigation;
  display: ExplorerDisplay;
};

function readUrlState(): ExplorerState {
  if (typeof window === "undefined") return { query: "", selectedId: null, inline: false, groupId: null, collectionId: null, navigation: "tree", display: "reference" };
  const params = new URLSearchParams(window.location.search);
  const selectedId = recordIdFromSearch(window.location.search);
  const requestedCollection = params.get("collection");
  const path = selectedId ? explorerPathForRecord(selectedId, requestedCollection ?? undefined) : undefined;
  const collection = requestedCollection ? explorerCollections.get(requestedCollection) : undefined;
  const requestedGroup = params.get("group");
  const groupId = path?.groupId ?? collection?.group ?? (requestedGroup && explorerGroups.has(requestedGroup) ? requestedGroup : null);
  const collectionId = path?.collectionId ?? (collection?.group === groupId ? collection.id : null);
  return {
    query: params.get("q") ?? "",
    selectedId,
    inline: Boolean(selectedId && params.get("inline") === "1" && params.get("nav") !== "breadcrumb"),
    groupId,
    collectionId,
    navigation: params.get("nav") === "breadcrumb" ? "breadcrumb" : "tree",
    display: params.get("view") === "json" ? "json" : "reference",
  };
}

export function useExplorerController() {
  const [state, setState] = useState<ExplorerState>(readUrlState);
  useEffect(() => {
    const sync = () => setState(readUrlState());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const commit = (next: ExplorerState, replace = false, scroll = false) => {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries({ record: next.selectedId, inline: next.inline && next.navigation === "tree" ? "1" : null, group: next.groupId, collection: next.collectionId, nav: next.navigation === "tree" ? null : next.navigation, view: next.display === "reference" ? null : next.display, q: next.query || null })) {
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    window.history[replace ? "replaceState" : "pushState"]({}, "", `${url.pathname}${url.search}${url.hash}`);
    setState(next);
    if (scroll) requestAnimationFrame(() => {
      if (next.navigation === "breadcrumb") window.scrollTo(0, 0);
      else document.getElementById("explorer-breadcrumb")?.scrollIntoView({ block: "start" });
    });
  };
  const selectRecord = (id: string, preferredCollectionId?: string, scroll = true) => {
    const path = explorerPathForRecord(id, preferredCollectionId ?? state.collectionId ?? undefined);
    commit({ ...state, query: "", selectedId: id, inline: false, groupId: path?.groupId ?? null, collectionId: path?.collectionId ?? null }, false, scroll);
  };
  const selectTreeRecord = (id: string, collectionId: string) => {
    const collection = explorerCollections.get(collectionId);
    if (collection) commit({ ...state, query: "", selectedId: id, inline: true, groupId: collection.group, collectionId });
  };
  const clearTreeRecord = () => commit({ ...state, selectedId: null, inline: false });
  const selectRoot = () => commit({ ...state, query: "", selectedId: null, inline: false, groupId: null, collectionId: null });
  const selectGroup = (groupId: string) => commit({ ...state, query: "", selectedId: null, inline: false, groupId, collectionId: null });
  const selectCollection = (collectionId: string) => {
    const collection = explorerCollections.get(collectionId);
    if (collection) commit({ ...state, query: "", selectedId: null, inline: false, groupId: collection.group, collectionId });
  };
  const back = () => {
    if (state.selectedId) {
      commit({ ...state, selectedId: null, inline: false });
      if (state.navigation === "tree" && state.collectionId) {
        requestAnimationFrame(() => document.getElementById(`explorer-collection-${state.collectionId}`)?.scrollIntoView({ block: "start" }));
      }
    }
    else if (state.collectionId) commit({ ...state, collectionId: null });
    else if (state.groupId) commit({ ...state, groupId: null });
  };
  return {
    ...state,
    setQuery: (query: string) => commit({ ...state, query }, true),
    results: searchExplorerRecords(state.query),
    selectedRecord: state.selectedId ? explorerSnapshot.records[state.selectedId] : undefined,
    selectRecord,
    selectTreeRecord,
    clearTreeRecord,
    selectRoot,
    selectGroup,
    selectCollection,
    back,
    setNavigation: (navigation: ExplorerNavigation) => {
      const next = { ...state, navigation, inline: navigation === "tree" && Boolean(state.selectedId) };
      commit(next, false, Boolean(state.selectedId && navigation === "breadcrumb"));
      if (state.selectedId && navigation === "tree") {
        requestAnimationFrame(() => document.getElementById(`explorer-record-${state.selectedId}`)?.scrollIntoView({ block: "start" }));
      }
    },
    setDisplay: (display: ExplorerDisplay) => commit({ ...state, display }),
  };
}
