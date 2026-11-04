import { useEffect, useState } from "react";
import { explorerCollections, explorerDirectCollection, explorerGroups, explorerInvestigations, explorerPathForRecord, explorerSnapshot, searchExplorerRecords } from "../model/explorer";
import { recordIdFromSearch } from "./explorer-url";

export type ExplorerNavigation = "tree" | "breadcrumb";
export type ExplorerDisplay = "reference" | "json";
type ExplorerState = {
  byDate: boolean;
  dateGroup: string | null;
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
  const requestedGroupParam = params.get("group");
  const collectionParam = params.get("collection");
  const requestedCollectionParam = collectionParam === "questions" ? "objectives" : collectionParam?.endsWith(":questions") ? `${collectionParam.slice(0, -":questions".length)}:objectives` : collectionParam;
  const byDate = params.get("sort") === "date" || requestedGroupParam === "latest" || requestedGroupParam === "updates"
    || Boolean(requestedCollectionParam && (requestedCollectionParam === "latest" || requestedCollectionParam.startsWith("latest:") || /:(?:latest|updates|developments|investigation-updates)$/.test(requestedCollectionParam)))
    || ["public-updates", "developments", "investigation-updates"].includes(requestedCollectionParam ?? "");
  const requestedGroup = requestedGroupParam === "organization" ? "crossover" : byDate ? null : requestedGroupParam;
  const requestedInvestigation = params.get("investigation");
  const selectedId = recordIdFromSearch(search) ?? (requestedGroup === "investigation" && requestedInvestigation && !requestedCollectionParam && explorerInvestigations.has(requestedInvestigation) ? requestedInvestigation : null);
  const requestedCollection = byDate ? null : requestedCollectionParam;
  const recordTrail = selectedId ? params.getAll("via").filter((id) => Boolean(explorerSnapshot.records[id])).slice(0, 12) : [];
  const path = !byDate && selectedId && recordTrail.length === 0 ? explorerPathForRecord(selectedId, requestedCollection ?? undefined, requestedInvestigation ?? undefined) : undefined;
  const collection = requestedCollection ? explorerCollections.get(requestedCollection) : undefined;
  const groupId = path?.groupId ?? (!collection?.hidden ? collection?.group : undefined) ?? (requestedGroup && explorerGroups.has(requestedGroup) ? requestedGroup : null);
  const investigationId = path?.investigationId ?? collection?.investigationId ?? (groupId === "investigation" && requestedInvestigation && explorerInvestigations.has(requestedInvestigation) ? requestedInvestigation : null);
  const collectionId = path?.collectionId ?? (collection && !collection.hidden && collection.group === groupId && (!collection.investigationId || collection.investigationId === investigationId) ? collection.id : null);
  return {
    byDate,
    dateGroup: byDate ? params.get("date") ?? (selectedId && explorerSnapshot.records[selectedId] ? explorerSnapshot.records[selectedId].dateForSort?.value.slice(0, 10) ?? "undated" : null) : null,
    query: params.get("q") ?? "",
    selectedId,
    inline: false,
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
    for (const [key, value] of Object.entries({ record: next.selectedId, sort: next.byDate ? "date" : null, date: next.byDate ? next.dateGroup : null, group: next.groupId, investigation: next.investigationId, collection: next.collectionId, nav: next.navigation === "tree" ? null : next.navigation, view: next.display === "reference" ? null : next.display, q: next.query || null })) {
      if (value) url.searchParams.set(key, value); else url.searchParams.delete(key);
    }
    url.searchParams.delete("inline");
    url.searchParams.delete("via");
    for (const id of next.recordTrail) url.searchParams.append("via", id);
    window.history[replace ? "replaceState" : "pushState"]({}, "", `${url.pathname}${url.search}${url.hash}`);
    setState(next);
    if (scroll) requestAnimationFrame(() => {
      if (next.byDate || next.navigation === "breadcrumb") window.scrollTo(0, 0);
      else document.getElementById("explorer-breadcrumb")?.scrollIntoView({ block: "start" });
    });
  };
  const selectRecord = (id: string, preferredCollectionId?: string, scroll = true) => {
    const path = explorerPathForRecord(id, preferredCollectionId ?? state.collectionId ?? undefined, state.investigationId ?? undefined);
    commit({ ...state, byDate: false, query: "", selectedId: id, inline: false, recordTrail: [], groupId: path?.groupId ?? null, investigationId: path?.investigationId ?? null, collectionId: path?.collectionId ?? null }, false, scroll);
  };
  const selectDateRecord = (id: string, scroll = true, inline = false) => {
    if (explorerSnapshot.records[id]) commit({ ...state, byDate: true, dateGroup: explorerSnapshot.records[id].dateForSort?.value.slice(0, 10) ?? "undated", selectedId: id, inline, groupId: null, investigationId: null, collectionId: null, recordTrail: [] }, false, scroll);
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
  const selectRoot = () => commit({ ...state, byDate: false, query: "", selectedId: null, inline: false, recordTrail: [], groupId: null, investigationId: null, collectionId: null });
  const selectGroup = (groupId: string) => commit({ ...state, byDate: false, query: "", selectedId: null, inline: false, recordTrail: [], groupId, investigationId: null, collectionId: null });
  const selectInvestigation = (investigationId: string) => {
    if (explorerInvestigations.has(investigationId)) commit({ ...state, query: "", selectedId: investigationId, inline: state.navigation === "tree", recordTrail: [], groupId: "investigation", investigationId, collectionId: null });
  };
  const selectCollection = (collectionId: string) => {
    const collection = explorerCollections.get(collectionId);
    if (collection && !collection.hidden) commit({ ...state, query: "", selectedId: null, inline: false, recordTrail: [], groupId: collection.group, investigationId: collection.investigationId ?? null, collectionId });
  };
  const back = () => {
    if (state.byDate) {
      if (state.selectedId) commit({ ...state, selectedId: null });
      else if (state.dateGroup) commit({ ...state, dateGroup: null });
      else commit({ ...state, byDate: false, query: "" });
      return;
    }
    if (state.recordTrail.length) {
      selectTrailRecord(state.recordTrail.length - 1);
      return;
    }
    if (state.selectedId) {
      if (state.selectedId === state.investigationId && !state.collectionId) commit({ ...state, selectedId: null, inline: false, investigationId: null });
      else commit({ ...state, selectedId: null, inline: false, collectionId: explorerDirectCollection(explorerGroups.get(state.groupId ?? ""))?.id === state.collectionId ? null : state.collectionId });
      if (state.navigation === "tree" && state.collectionId) {
        requestAnimationFrame(() => document.getElementById(`explorer-collection-${state.collectionId}`)?.scrollIntoView({ block: "start" }));
      }
    }
    else if (state.collectionId && explorerCollections.get(state.collectionId)?.parentCollectionId) selectCollection(explorerCollections.get(state.collectionId)!.parentCollectionId!);
    else if (state.collectionId && state.investigationId) selectInvestigation(state.investigationId);
    else if (state.collectionId && explorerDirectCollection(explorerGroups.get(state.groupId ?? ""))?.id === state.collectionId) selectRoot();
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
    selectDateRecord,
    clearDateRecord: () => commit({ ...state, selectedId: null, inline: false }),
    selectDateGroup: (dateGroup: string | null) => commit({ ...state, dateGroup, selectedId: null, inline: false }),
    setByDate: (byDate: boolean) => commit({ ...state, byDate, dateGroup: null, query: "", selectedId: null, inline: false, groupId: null, investigationId: null, collectionId: null, recordTrail: [] }),
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
      const next = { ...state, navigation, inline: false };
      commit(next, false, Boolean(state.selectedId && navigation === "breadcrumb"));
    },
    setDisplay: (display: ExplorerDisplay) => commit({ ...state, display }),
  };
}
