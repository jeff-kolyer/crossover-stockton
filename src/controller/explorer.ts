import { useEffect, useState } from "react";
import { explorerCollections, explorerGroups, explorerInvestigations, explorerPathForRecord, explorerSnapshot, searchExplorerRecords } from "../model/explorer";
import { recordIdFromSearch } from "./explorer-url";

export type ExplorerNavigation = "tree" | "breadcrumb";
export type ExplorerDisplay = "reference" | "json";
type ExplorerState = {
  query: string;
  selectedId: string | null;
  inline: boolean;
  groupId: string | null;
  investigationId: string | null;
  collectionId: string | null;
  recordTrail: string[];
  navigation: ExplorerNavigation;
  display: ExplorerDisplay;
};

export function explorerStateFromSearch(search: string): ExplorerState {
  const params = new URLSearchParams(search);
  const requestedGroup = params.get("group");
  const requestedInvestigation = params.get("investigation");
  const requestedCollectionParam = params.get("collection");
  const selectedId = recordIdFromSearch(search) ?? (requestedGroup === "investigation" && requestedInvestigation && !requestedCollectionParam && explorerInvestigations.has(requestedInvestigation) ? requestedInvestigation : null);
  const requestedCollection = requestedCollectionParam === "public-updates" && selectedId
    ? (["developments", "investigation-updates"].find((id) => explorerCollections.get(id)?.recordIds.includes(selectedId)) ?? null)
    : requestedCollectionParam;
  const recordTrail = selectedId ? params.getAll("via").filter((id) => Boolean(explorerSnapshot.records[id])).slice(0, 12) : [];
  const path = selectedId && recordTrail.length === 0 ? explorerPathForRecord(selectedId, requestedCollection ?? undefined, requestedInvestigation ?? undefined) : undefined;
  const collection = requestedCollection ? explorerCollections.get(requestedCollection) : undefined;
  const groupId = path?.groupId ?? (!collection?.hidden ? collection?.group : undefined) ?? (requestedGroup && explorerGroups.has(requestedGroup) ? requestedGroup : null);
  const investigationId = path?.investigationId ?? collection?.investigationId ?? (groupId === "investigation" && requestedInvestigation && explorerInvestigations.has(requestedInvestigation) ? requestedInvestigation : null);
  const collectionId = path?.collectionId ?? (collection && !collection.hidden && collection.group === groupId && (!collection.investigationId || collection.investigationId === investigationId) ? collection.id : null);
  return {
    query: params.get("q") ?? "",
    selectedId,
    inline: Boolean(selectedId && params.get("nav") !== "breadcrumb" && (params.get("inline") === "1" || selectedId === investigationId && !collectionId)),
    groupId,
    investigationId,
    collectionId,
    recordTrail,
    navigation: params.get("nav") === "breadcrumb" ? "breadcrumb" : "tree",
    display: params.get("view") === "json" ? "json" : "reference",
  };
}

const readUrlState = () => explorerStateFromSearch(typeof window === "undefined" ? "" : window.location.search);

export function useExplorerController() {
  const [state, setState] = useState<ExplorerState>(readUrlState);
  useEffect(() => {
    const sync = () => setState(readUrlState());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);
  const commit = (next: ExplorerState, replace = false, scroll = false) => {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries({ record: next.selectedId, inline: next.inline && next.navigation === "tree" ? "1" : null, group: next.groupId, investigation: next.investigationId, collection: next.collectionId, nav: next.navigation === "tree" ? null : next.navigation, view: next.display === "reference" ? null : next.display, q: next.query || null })) {
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    url.searchParams.delete("via");
    for (const id of next.recordTrail) url.searchParams.append("via", id);
    window.history[replace ? "replaceState" : "pushState"]({}, "", `${url.pathname}${url.search}${url.hash}`);
    setState(next);
    if (scroll) requestAnimationFrame(() => {
      if (next.navigation === "breadcrumb") window.scrollTo(0, 0);
      else document.getElementById("explorer-breadcrumb")?.scrollIntoView({ block: "start" });
    });
  };
  const selectRecord = (id: string, preferredCollectionId?: string, scroll = true) => {
    const path = explorerPathForRecord(id, preferredCollectionId ?? state.collectionId ?? undefined, state.investigationId ?? undefined);
    commit({ ...state, query: "", selectedId: id, inline: false, recordTrail: [], groupId: path?.groupId ?? null, investigationId: path?.investigationId ?? null, collectionId: path?.collectionId ?? null }, false, scroll);
  };
  const followRecord = (id: string) => {
    if (!explorerSnapshot.records[id] || id === state.selectedId) return;
    if (!state.selectedId) { selectRecord(id); return; }
    commit({ ...state, query: "", selectedId: id, inline: false, recordTrail: [...state.recordTrail, state.selectedId].slice(-12) }, false, true);
  };
  const selectTrailRecord = (index: number) => {
    const id = state.recordTrail[index];
    if (id) commit({ ...state, selectedId: id, inline: false, recordTrail: state.recordTrail.slice(0, index) }, false, true);
  };
  const selectTreeRecord = (id: string, collectionId: string) => {
    const collection = explorerCollections.get(collectionId);
    if (collection) commit({ ...state, query: "", selectedId: id, inline: true, recordTrail: [], groupId: collection.group, investigationId: collection.investigationId ?? null, collectionId });
  };
  const clearTreeRecord = () => commit({ ...state, selectedId: null, inline: false, recordTrail: [] });
  const selectRoot = () => commit({ ...state, query: "", selectedId: null, inline: false, recordTrail: [], groupId: null, investigationId: null, collectionId: null });
  const selectGroup = (groupId: string) => commit({ ...state, query: "", selectedId: null, inline: false, recordTrail: [], groupId, investigationId: null, collectionId: null });
  const selectInvestigation = (investigationId: string) => {
    if (explorerInvestigations.has(investigationId)) commit({ ...state, query: "", selectedId: investigationId, inline: state.navigation === "tree", recordTrail: [], groupId: "investigation", investigationId, collectionId: null });
  };
  const selectCollection = (collectionId: string) => {
    const collection = explorerCollections.get(collectionId);
    if (collection && !collection.hidden) commit({ ...state, query: "", selectedId: null, inline: false, recordTrail: [], groupId: collection.group, investigationId: collection.investigationId ?? null, collectionId });
  };
  const back = () => {
    if (state.recordTrail.length) {
      selectTrailRecord(state.recordTrail.length - 1);
      return;
    }
    if (state.selectedId) {
      if (state.selectedId === state.investigationId && !state.collectionId) commit({ ...state, selectedId: null, inline: false, investigationId: null });
      else commit({ ...state, selectedId: null, inline: false });
      if (state.navigation === "tree" && state.collectionId) {
        requestAnimationFrame(() => document.getElementById(`explorer-collection-${state.collectionId}`)?.scrollIntoView({ block: "start" }));
      }
    }
    else if (state.collectionId && explorerCollections.get(state.collectionId)?.parentCollectionId) selectCollection(explorerCollections.get(state.collectionId)!.parentCollectionId!);
    else if (state.collectionId && state.investigationId) selectInvestigation(state.investigationId);
    else if (state.collectionId) commit({ ...state, collectionId: null });
    else if (state.investigationId) commit({ ...state, investigationId: null });
    else if (state.groupId) commit({ ...state, groupId: null });
  };
  return {
    ...state,
    setQuery: (query: string) => commit({ ...state, query }, true),
    results: searchExplorerRecords(state.query),
    selectedRecord: state.selectedId ? explorerSnapshot.records[state.selectedId] : undefined,
    selectRecord,
    followRecord,
    selectTrailRecord,
    selectTreeRecord,
    clearTreeRecord,
    selectRoot,
    selectGroup,
    selectInvestigation,
    selectCollection,
    back,
    setNavigation: (navigation: ExplorerNavigation) => {
      const canOpenInline = state.selectedId === state.investigationId && !state.collectionId
        || Boolean(state.collectionId && state.selectedId && explorerCollections.get(state.collectionId)?.recordIds.includes(state.selectedId));
      const next = { ...state, navigation, inline: navigation === "tree" && canOpenInline };
      commit(next, false, Boolean(state.selectedId && navigation === "breadcrumb"));
      if (state.selectedId && navigation === "tree" && canOpenInline) {
        requestAnimationFrame(() => document.getElementById(`explorer-record-${state.collectionId}-${state.selectedId}`)?.scrollIntoView({ block: "start" }));
      }
    },
    setDisplay: (display: ExplorerDisplay) => commit({ ...state, display }),
  };
}
