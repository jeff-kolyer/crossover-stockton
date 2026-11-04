import { Fragment, useState, type ReactNode } from "react";
import copy from "../ui/data.json";
import { useExplorerController } from "../controller/explorer";
import { explorerRecordUrl } from "../controller/explorer-url";
import { explorerChildCollections, explorerCollections, explorerDirectCollection, explorerFieldInfo, explorerGroups, explorerInvestigations, explorerRecordsByDate, explorerSnapshot, type ExplorerCollection, type ExplorerRecord } from "../model/explorer";
import { HeadingGroup, Page } from "./layout";
import { PlainActionButton } from "./PlainActionButton";

const safeHref = (value: string) => (value.startsWith("/") && !value.startsWith("//")) || /^https?:\/\//i.test(value);
const dateGroupKey = (record: ExplorerRecord) => record.dateForSort?.value.slice(0, 10) ?? "undated";
const dateGroupLabel = (key: string) => key === "undated" ? copy.undated : new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "America/Los_Angeles" }).format(new Date(`${key}T12:00:00Z`));
const datedRecordLabel = (record: ExplorerRecord) => {
  const date = record.dateForSort;
  const formatted = date ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeZone: "America/Los_Angeles" }).format(new Date(date.value.length === 10 ? `${date.value}T12:00:00Z` : date.value)) : "";
  return `${record.typeName} · ${date ? `${explorerFieldInfo(date.field).label} ${formatted}` : copy.undated} · ${record.title}`;
};
const collectionCount = (collection: ExplorerCollection): number => collection.childCollectionIds?.reduce((count, id) => {
  const child = explorerCollections.get(id);
  return count + (child ? collectionCount(child) : 0);
}, 0) ?? collection.recordIds.length;

function RecordValue({ name, value, selectRecord }: { name: string; value: unknown; selectRecord: (id: string) => void }): ReactNode {
  if (value === null || value === undefined) return copy.unknown;
  if (Array.isArray(value)) return value.length
    ? <ul>{value.map((item, index) => <li key={`${name}-${index}`}><RecordValue name={name} value={item} selectRecord={selectRecord} /></li>)}</ul>
    : copy.noneRecorded;
  if (typeof value === "object") return <dl className="explorer-nested-properties">{Object.entries(value).map(([key, child]) =>
    <div key={key}><dt>{explorerFieldInfo(key).label}</dt><dd><RecordValue name={key} value={child} selectRecord={selectRecord} /></dd></div>)}</dl>;
  if (typeof value === "boolean") return value ? copy.yes : copy.no;
  if (typeof value === "number") return value.toLocaleString("en-US");
  if (typeof value !== "string") return String(value);
  const info = explorerFieldInfo(name);
  const kind = info.kind;
  if (info.valueLabels?.[value]) return info.valueLabels[value];
  if (kind === "reference") {
    const related = explorerSnapshot.records[value];
    return related
      ? <a href={explorerRecordUrl(value)} onClick={(event) => { event.preventDefault(); selectRecord(value); }}>{related.title}</a>
      : <span>{copy.unavailableReference}</span>;
  }
  if (kind === "date" && /^\d{4}-\d{2}-\d{2}/.test(value)) {
    const date = new Date(value.length === 10 ? `${value}T12:00:00Z` : value);
    if (!Number.isNaN(date.getTime())) return <time dateTime={value}>{new Intl.DateTimeFormat("en-US", { dateStyle: "medium", ...(value.includes("T") ? { timeStyle: "short" } as const : {}), timeZone: "America/Los_Angeles" }).format(date)}</time>;
  }
  if (kind === "url" && safeHref(value)) {
    const external = /^https?:\/\//i.test(value);
    return <a href={value} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{value}</a>;
  }
  return value;
}

function ReferenceRecord({ record, selectRecord }: { record: ExplorerRecord; selectRecord: (id: string) => void }) {
  return <div className="explorer-record-details">
    <p>{record.typeName}</p>
    {record.description && <p>{record.description}</p>}
    <dl className="explorer-properties">{Object.entries(record.fields).map(([name, value]) => {
      const info = explorerFieldInfo(name);
      return <div key={name}><dt>{info.label}</dt><dd><RecordValue name={name} value={value} selectRecord={selectRecord} /></dd>{info.description && <small>{info.description}</small>}</div>;
    })}</dl>
    <p><a href={explorerRecordUrl(record.id)}>{copy.directLink}</a></p>
  </div>;
}

function PublicJsonRecord({ record }: { record: ExplorerRecord }) {
  const [copied, setCopied] = useState(false);
  const json = JSON.stringify(record.fields, null, 2);
  return <div className="explorer-record-details explorer-json">
    <p>{copy.publicJsonNote}</p>
    <div><PlainActionButton onClick={() => { void navigator.clipboard.writeText(json).then(() => setCopied(true)); }}>{copied ? copy.copiedJson : copy.copyJson}</PlainActionButton></div>
    <pre><code>{json}</code></pre>
  </div>;
}

function RecordInspection({ record, display, selectRecord }: { record: ExplorerRecord; display: "reference" | "json"; selectRecord: (id: string) => void }) {
  return display === "json" ? <PublicJsonRecord key={record.id} record={record} /> : <ReferenceRecord record={record} selectRecord={selectRecord} />;
}

function TreeCollection({ collection, direct = false, display, collectionId, selectedId, inline, selectCollection, selectTreeRecord, clearTreeRecord, selectRecord }: { collection: ExplorerCollection; direct?: boolean; display: "reference" | "json"; collectionId: string | null; selectedId: string | null; inline: boolean; selectCollection: (id: string) => void; selectTreeRecord: (id: string, collectionId: string) => void; clearTreeRecord: () => void; selectRecord: (id: string, collectionId?: string, scroll?: boolean) => void }) {
  const children = <div className={direct ? undefined : "explorer-collection-children"}>{collection.childCollectionIds?.map((id) => {
      const child = explorerCollections.get(id);
      return child && <TreeCollection key={id} collection={child} display={display} collectionId={collectionId} selectedId={selectedId} inline={inline} selectCollection={selectCollection} selectTreeRecord={selectTreeRecord} clearTreeRecord={clearTreeRecord} selectRecord={selectRecord} />;
    })}{collection.recordIds.map((recordId) => {
      const record = explorerSnapshot.records[recordId];
      if (!record) return null;
      return <details key={recordId} id={`explorer-record-${collection.id}-${recordId}`} className="explorer-record" onToggle={(event) => {
        if (event.currentTarget.open && (selectedId !== recordId || !inline || collection.id !== collectionId)) selectTreeRecord(recordId, collection.id);
        else if (!event.currentTarget.open && inline && selectedId === recordId && collection.id === collectionId) clearTreeRecord();
      }}><summary><span>{record.title}</span></summary><RecordInspection record={record} display={display} selectRecord={selectRecord} /></details>;
    })}</div>;
  return direct ? children : <details id={`explorer-collection-${collection.id}`} className="explorer-collection" onToggle={(event) => { if (event.target === event.currentTarget && event.currentTarget.open && collection.id !== collectionId && !collection.childCollectionIds?.includes(collectionId ?? "")) selectCollection(collection.id); }}><summary>{collection.title} <span>({collectionCount(collection)})</span></summary>{children}</details>;
}

function TreeNavigation({ display, groupId, investigationId, collectionId, selectedId, inline, selectGroup, selectInvestigation, selectCollection, selectTreeRecord, clearTreeRecord, selectRecord }: { display: "reference" | "json"; groupId: string | null; investigationId: string | null; collectionId: string | null; selectedId: string | null; inline: boolean; selectGroup: (id: string) => void; selectInvestigation: (id: string) => void; selectCollection: (id: string) => void; selectTreeRecord: (id: string, collectionId: string) => void; clearTreeRecord: () => void; selectRecord: (id: string, collectionId?: string, scroll?: boolean) => void }) {
  const childProps = { display, collectionId, selectedId, inline, selectCollection, selectTreeRecord, clearTreeRecord, selectRecord };
  return <div className="explorer-tree">{explorerSnapshot.groups.map((group) => {
    const count = group.id === "investigation" ? group.investigationIds?.length ?? 0 : group.collectionIds.reduce((total, id) => total + (explorerCollections.get(id) ? collectionCount(explorerCollections.get(id)!) : 0), 0);
    return <details key={group.id} className="explorer-group" onToggle={(event) => { if (event.target === event.currentTarget && event.currentTarget.open && group.id !== groupId) selectGroup(group.id); }}><summary><strong>{group.title}</strong> <span>({count})</span></summary>
      <div className="explorer-group-children">{group.id === "investigation"
        ? group.investigationIds?.map((id) => {
          const investigation = explorerInvestigations.get(id);
          return investigation && <details key={id} className="explorer-collection" onToggle={(event) => { if (event.target === event.currentTarget && event.currentTarget.open && (id !== investigationId || selectedId !== id && !collectionId)) selectInvestigation(id); }}><summary>{investigation.title}</summary>
            {explorerSnapshot.records[id] && <RecordInspection record={explorerSnapshot.records[id]} display={display} selectRecord={selectRecord} />}
            <div className="explorer-group-children">{investigation.collectionIds.map((collectionId) => {
              const collection = explorerCollections.get(collectionId);
              return collection && <TreeCollection key={collection.id} collection={collection} {...childProps} />;
            })}</div>
          </details>;
        })
        : group.collectionIds.map((id) => {
          const collection = explorerCollections.get(id);
          return collection && <TreeCollection key={id} collection={collection} direct={explorerDirectCollection(group)?.id === id} {...childProps} />;
        })}</div>
    </details>;
  })}</div>;
}

function BreadcrumbNavigation({ groupId, investigationId, collectionId, selectedId, recordTrail, display, followRecord, selectRoot, selectGroup, selectInvestigation, selectCollection, selectRecord, selectTrailRecord, back }: {
  groupId: string | null; investigationId: string | null; collectionId: string | null; selectedId: string | null; recordTrail: string[]; display: "reference" | "json"; followRecord: (id: string) => void;
  selectRoot: () => void; selectGroup: (id: string) => void; selectInvestigation: (id: string) => void; selectCollection: (id: string) => void;
  selectRecord: (id: string, collectionId?: string) => void; selectTrailRecord: (index: number) => void; back: () => void;
}) {
  const group = groupId ? explorerGroups.get(groupId) : undefined;
  const investigation = investigationId ? explorerInvestigations.get(investigationId) : undefined;
  const collection = collectionId ? explorerCollections.get(collectionId) : undefined;
  const directCollection = explorerDirectCollection(group);
  const parentCollection = collection?.parentCollectionId ? explorerCollections.get(collection.parentCollectionId) : undefined;
  const items: { id: string; label: string; count: number; action: () => void }[] = !group
    ? explorerSnapshot.groups.map((item) => ({ id: item.id, label: item.title, count: item.id === "investigation" ? item.investigationIds?.length ?? 0 : item.collectionIds.reduce((total, id) => total + (explorerCollections.get(id) ? collectionCount(explorerCollections.get(id)!) : 0), 0), action: () => selectGroup(item.id) }))
    : group.id === "investigation" && !investigation
      ? (group.investigationIds ?? []).flatMap((id) => { const item = explorerInvestigations.get(id); return item ? [{ id, label: item.title, count: 0, action: () => selectInvestigation(id) }] : []; })
    : selectedId && explorerChildCollections(selectedId).length
      ? explorerChildCollections(selectedId).map((item) => ({ id: item.id, label: item.title, count: collectionCount(item), action: () => selectCollection(item.id) }))
    : selectedId ? []
    : !collection && directCollection
      ? directCollection.recordIds.flatMap((id) => { const record = explorerSnapshot.records[id]; return record ? [{ id, label: record.title, count: 0, action: () => selectRecord(id, directCollection.id) }] : []; })
    : !collection
      ? (investigation?.collectionIds ?? group.collectionIds).map((id) => explorerCollections.get(id)).filter((item): item is ExplorerCollection => Boolean(item)).map((item) => ({ id: item.id, label: item.title, count: collectionCount(item), action: () => selectCollection(item.id) }))
      : collection.childCollectionIds?.length ? collection.childCollectionIds.flatMap((id) => { const item = explorerCollections.get(id); return item ? [{ id, label: item.title, count: collectionCount(item), action: () => selectCollection(item.id) }] : []; })
      : selectedId ? [] : collection.recordIds.flatMap((id) => {
        const record = explorerSnapshot.records[id];
        return record ? [{ id, label: record.title, count: 0, action: () => selectRecord(id, collection.id) }] : [];
      });
  const heading = !group ? copy.browseGroups : group.id === "investigation" && !investigation ? group.title : !collection ? copy.browseCollections : copy.browseRecords;
  return <div className="explorer-breadcrumb" id="explorer-breadcrumb">
    <nav aria-label={copy.breadcrumbNavigation}><button type="button" onClick={selectRoot}>{copy.allGroups}</button>{group && <Fragment><span aria-hidden="true"> / </span><button type="button" onClick={() => selectGroup(group.id)}>{group.title}</button></Fragment>}{investigation && <Fragment><span aria-hidden="true"> / </span><button type="button" onClick={() => selectInvestigation(investigation.id)}>{investigation.title}</button></Fragment>}{parentCollection && <Fragment><span aria-hidden="true"> / </span><button type="button" onClick={() => selectCollection(parentCollection.id)}>{parentCollection.title}</button></Fragment>}{collection && collection.id !== directCollection?.id && <Fragment><span aria-hidden="true"> / </span><button type="button" onClick={() => selectCollection(collection.id)}>{collection.title}</button></Fragment>}{recordTrail.map((id, index) => id !== investigationId && <Fragment key={`${id}-${index}`}><span aria-hidden="true"> / </span><button type="button" onClick={() => selectTrailRecord(index)}>{explorerSnapshot.records[id]?.title ?? id}</button></Fragment>)}{selectedId && selectedId !== investigationId && <Fragment><span aria-hidden="true"> / </span><span>{explorerSnapshot.records[selectedId]?.title ?? selectedId}</span></Fragment>}</nav>
    {(group || collection || selectedId) && <div><PlainActionButton onClick={back}>{copy.back}</PlainActionButton></div>}
    {selectedId && <section className="explorer-selected" id="explorer-selected-record" aria-label={copy.selectedRecord}>{explorerSnapshot.records[selectedId] ? <Fragment><h2>{explorerSnapshot.records[selectedId].title}</h2><RecordInspection record={explorerSnapshot.records[selectedId]} display={display} selectRecord={followRecord} /></Fragment> : <p>{copy.recordUnavailable}</p>}</section>}
    {items.length > 0 && <section aria-label={heading}>{group?.id === "investigation" && !investigation && <h2>{group.title}</h2>}<ul>{items.map((item) => <li key={item.id}><button type="button" onClick={item.action}>{item.label}{item.count > 0 && <span> ({item.count})</span>}</button></li>)}</ul></section>}
  </div>;
}

function DateNavigation({ query, results, selectedId, selectedDate, navigation, display, inline, selectDateRecord, clearDateRecord, selectDateGroup, back }: { query: string; results: ExplorerRecord[]; selectedId: string | null; selectedDate: string | null; navigation: "tree" | "breadcrumb"; display: "reference" | "json"; inline: boolean; selectDateRecord: (id: string, scroll?: boolean, inline?: boolean) => void; clearDateRecord: () => void; selectDateGroup: (date: string | null) => void; back: () => void }) {
  const matchingIds = query.trim() ? new Set(results.map((record) => record.id)) : null;
  const records = matchingIds ? explorerRecordsByDate.filter((record) => matchingIds.has(record.id)) : explorerRecordsByDate;
  const groups = new Map<string, ExplorerRecord[]>();
  for (const record of records) {
    const key = dateGroupKey(record);
    groups.set(key, [...(groups.get(key) ?? []), record]);
  }
  const selected = selectedId ? explorerSnapshot.records[selectedId] : undefined;
  return <div className={navigation === "tree" ? "explorer-tree" : "explorer-breadcrumb"}>
    {navigation === "breadcrumb" && <nav aria-label={copy.breadcrumbNavigation}><button type="button" onClick={() => selectDateGroup(null)}>{copy.allDates}</button>{selectedDate && <Fragment><span aria-hidden="true"> / </span><button type="button" onClick={() => selectDateGroup(selectedDate)}>{dateGroupLabel(selectedDate)}</button></Fragment>}{selected && <Fragment><span aria-hidden="true"> / </span><span>{selected.title}</span></Fragment>}</nav>}
    {(selectedDate || selectedId) && <div><PlainActionButton onClick={back}>{copy.back}</PlainActionButton></div>}
    {(navigation === "breadcrumb" || !inline) && selected && <section className="explorer-selected" aria-label={copy.selectedRecord}><h2>{selected.title}</h2><RecordInspection record={selected} display={display} selectRecord={selectDateRecord} /></section>}
    {(navigation === "tree" || !selected) && <section aria-label={copy.byDate}>{records.length ? navigation === "tree"
      ? <div>{Array.from(groups, ([key, items]) => <details className="explorer-group" key={key}><summary><strong>{dateGroupLabel(key)}</strong> <span>({items.length})</span></summary><div className="explorer-group-children">{items.map((record) => <details className="explorer-record" key={record.id} onToggle={(event) => {
        if (event.currentTarget.open && (selectedId !== record.id || !inline)) selectDateRecord(record.id, false, true);
        else if (!event.currentTarget.open && selectedId === record.id) clearDateRecord();
      }}><summary>{datedRecordLabel(record)}</summary><RecordInspection record={record} display={display} selectRecord={selectDateRecord} /></details>)}</div></details>)}</div>
      : !selected && <ul>{selectedDate ? (groups.get(selectedDate) ?? []).map((record) => <li key={record.id}><button type="button" onClick={() => selectDateRecord(record.id)}>{datedRecordLabel(record)}</button></li>) : Array.from(groups, ([key, items]) => <li key={key}><button type="button" onClick={() => selectDateGroup(key)}>{dateGroupLabel(key)} ({items.length})</button></li>)}</ul>
      : <p>{copy.noResults}</p>}</section>}
  </div>;
}

export function ExplorerPage() {
  const controller = useExplorerController();
  const { byDate, query, setQuery, results, selectedId, selectRecord, navigation, display } = controller;
  return <main className="explorer-page public-document"><Page width="wide" className="explorer-content">
    <HeadingGroup as="header"><h1>{copy.title}</h1><p>{copy.intro}</p></HeadingGroup>
    <div className="explorer-view-controls">
      <div role="group" aria-label={copy.browseMode}><span>{copy.browseMode}</span><PlainActionButton variant="selection" pressed={!byDate} onClick={() => controller.setByDate(false)}>{copy.browse}</PlainActionButton><PlainActionButton variant="selection" pressed={byDate} onClick={() => controller.setByDate(true)}>{copy.byDate}</PlainActionButton></div>
      <div role="group" aria-label={copy.navigationMode}><span>{copy.navigationMode}</span><PlainActionButton variant="selection" pressed={navigation === "tree"} onClick={() => controller.setNavigation("tree")}>{copy.tree}</PlainActionButton><PlainActionButton variant="selection" pressed={navigation === "breadcrumb"} onClick={() => controller.setNavigation("breadcrumb")}>{copy.breadcrumb}</PlainActionButton></div>
      <div role="group" aria-label={copy.recordDisplayMode}><span>{copy.recordDisplayMode}</span><PlainActionButton variant="selection" pressed={display === "reference"} onClick={() => controller.setDisplay("reference")}>{copy.reference}</PlainActionButton><PlainActionButton variant="selection" pressed={display === "json"} onClick={() => controller.setDisplay("json")}>{copy.publicJson}</PlainActionButton></div>
    </div>
    <div className="explorer-search"><label htmlFor="explorer-query">{copy.searchLabel}</label><div className="explorer-search-controls"><input id="explorer-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} />{query && <button type="button" onClick={() => setQuery("")}>{copy.clearSearch}</button>}</div></div>
    {!byDate && ((navigation === "breadcrumb" && (!query.trim() || selectedId)) || (navigation === "tree" && selectedId && !controller.inline)) && <BreadcrumbNavigation groupId={controller.groupId} investigationId={controller.investigationId} collectionId={controller.collectionId} selectedId={selectedId} recordTrail={controller.recordTrail} display={display} followRecord={controller.followRecord} selectRoot={controller.selectRoot} selectGroup={controller.selectGroup} selectInvestigation={controller.selectInvestigation} selectCollection={controller.selectCollection} selectRecord={selectRecord} selectTrailRecord={controller.selectTrailRecord} back={controller.back} />}
    {byDate ? <DateNavigation query={query} results={results} selectedId={selectedId} selectedDate={controller.dateGroup} navigation={navigation} display={display} inline={controller.inline} selectDateRecord={controller.selectDateRecord} clearDateRecord={controller.clearDateRecord} selectDateGroup={controller.selectDateGroup} back={controller.back} /> : query.trim() ? <section className="explorer-results" aria-label={copy.searchResults}><h2>{copy.searchResults} ({results.length})</h2>{results.length ? <ul>{results.map((record) => <li key={record.id}><a href={explorerRecordUrl(record.id)} onClick={(event) => { event.preventDefault(); selectRecord(record.id); }}>{record.title}</a></li>)}</ul> : <p>{copy.noResults}</p>}</section>
      : navigation === "tree" && <TreeNavigation display={display} groupId={controller.groupId} investigationId={controller.investigationId} collectionId={controller.collectionId} selectedId={selectedId} inline={controller.inline} selectGroup={controller.selectGroup} selectInvestigation={controller.selectInvestigation} selectCollection={controller.selectCollection} selectTreeRecord={controller.selectTreeRecord} clearTreeRecord={controller.clearTreeRecord} selectRecord={controller.followRecord} />}
  </Page></main>;
}
