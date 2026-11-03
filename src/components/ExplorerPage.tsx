import { Fragment, type ReactNode } from "react";
import copy from "../data/pages/data.json";
import { useExplorerController } from "../controller/explorer";
import { explorerRecordUrl } from "../controller/explorer-url";
import { explorerCollections, explorerSnapshot, type ExplorerRecord } from "../model/explorer";
import { HeadingGroup, Page } from "./layout";

const isReference = (name: string) => name !== "id" && /(?:_ids?|Ids?|Id)$/.test(name);
const labelFor = (name: string) => explorerSnapshot.fieldLabels[name] ?? name;
const safeHref = (value: string) => (value.startsWith("/") && !value.startsWith("//")) || /^https?:\/\//i.test(value);

function RecordValue({ name, value, selectRecord }: { name: string; value: unknown; selectRecord: (id: string) => void }): ReactNode {
  if (value === null || value === undefined) return "Unknown";
  if (Array.isArray(value)) {
    if (!value.length) return "None recorded";
    return <ul>{value.map((item, index) => <li key={`${name}-${index}`}><RecordValue name={name} value={item} selectRecord={selectRecord} /></li>)}</ul>;
  }
  if (typeof value === "object") return <dl className="explorer-nested-properties">{Object.entries(value).map(([key, child]) =>
    <div key={key}><dt>{labelFor(key)}</dt><dd><RecordValue name={key} value={child} selectRecord={selectRecord} /></dd></div>)}</dl>;
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") return value.toLocaleString("en-US");
  if (typeof value !== "string") return String(value);
  if (isReference(name)) {
    const related = explorerSnapshot.records[value];
    return related
      ? <a href={explorerRecordUrl(value)} onClick={(event) => { event.preventDefault(); selectRecord(value); }}>{related.title}</a>
      : <span>{copy.unavailableReference}</span>;
  }
  if ((name === "url" || name === "website" || name.endsWith("Url") || name.endsWith("_url") || name === "path") && safeHref(value)) {
    const external = /^https?:\/\//i.test(value);
    return <a href={value} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined}>{value}</a>;
  }
  return value;
}

function RecordDetails({ record, selectRecord }: { record: ExplorerRecord; selectRecord: (id: string) => void }) {
  return <div className="explorer-record-details">
    <p>{record.typeName}</p>
    {record.description && <p>{record.description}</p>}
    <dl className="explorer-properties">{Object.entries(record.fields).map(([name, value]) =>
      <div key={name}><dt>{labelFor(name)}</dt><dd><RecordValue name={name} value={value} selectRecord={selectRecord} /></dd></div>)}</dl>
    <p><a href={explorerRecordUrl(record.id)} onClick={(event) => { event.preventDefault(); selectRecord(record.id); }}>{copy.directLink}</a></p>
  </div>;
}

export function ExplorerPage() {
  const { query, setQuery, results, selectedId, selectedRecord, selectRecord } = useExplorerController();
  const collectionMap = explorerCollections;
  return <main className="explorer-page public-document">
    <Page width="wide" className="explorer-content">
      <HeadingGroup as="header"><h1>{copy.title}</h1><p>{copy.intro}</p></HeadingGroup>
      <div className="explorer-search">
        <label htmlFor="explorer-query">{copy.searchLabel}</label>
        <div className="explorer-search-controls"><input id="explorer-query" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={copy.searchPlaceholder} />{query && <button type="button" onClick={() => setQuery("")}>{copy.clearSearch}</button>}</div>
      </div>
      {selectedId && <section className="explorer-selected" id="explorer-selected-record" aria-label={copy.selectedRecord}>
        {selectedRecord ? <Fragment><h2>{selectedRecord.title}</h2><RecordDetails record={selectedRecord} selectRecord={selectRecord} /></Fragment> : <p>{copy.recordUnavailable}</p>}
      </section>}
      {query.trim() ? <section className="explorer-results" aria-label={copy.searchResults}>
        <h2>{copy.searchResults} ({results.length})</h2>
        {results.length ? <ul>{results.map((record) => <li key={record.id}><a href={explorerRecordUrl(record.id)} onClick={(event) => { event.preventDefault(); selectRecord(record.id); }}>{record.title}</a> <small>{record.typeName}</small></li>)}</ul> : <p>{copy.noResults}</p>}
      </section> : <div className="explorer-tree">{explorerSnapshot.groups.map((group) => {
        const ids = new Set(group.collectionIds.flatMap((id) => collectionMap.get(id)?.recordIds ?? []));
        return <details key={group.id} className="explorer-group"><summary><strong>{group.title}</strong> <span>({ids.size})</span></summary>
          <div className="explorer-group-children">{group.collectionIds.map((id) => {
            const collection = collectionMap.get(id);
            if (!collection) return null;
            return <details key={id} className="explorer-collection"><summary>{collection.title} <span>({collection.recordIds.length})</span></summary>
              <div className="explorer-collection-children">{collection.recordIds.map((recordId) => {
                const record = explorerSnapshot.records[recordId];
                if (!record) return null;
                return <details key={recordId} className="explorer-record"><summary><span>{record.title}</span> <small>{record.typeName}</small></summary><RecordDetails record={record} selectRecord={selectRecord} /></details>;
              })}</div>
            </details>;
          })}</div>
        </details>;
      })}</div>}
      {explorerSnapshot.unsupportedTypes.length > 0 && <section className="explorer-unsupported"><h2>{copy.unsupportedTypes}</h2><ul>{explorerSnapshot.unsupportedTypes.map((name) => <li key={name}>{name}</li>)}</ul></section>}
    </Page>
  </main>;
}
