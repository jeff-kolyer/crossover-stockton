const referenceField = (name) => name !== "id" && /(?:_ids?|Ids?|Id)$/.test(name);
const titleFor = (record) => record.publicName || record.name || record.title || record.statement
  || (record.value !== undefined && record.unit ? `${record.value.toLocaleString("en-US")} ${record.unit}` : undefined)
  || record.measure || record.id;

function projectValue(key, value, nestedFields) {
  if (value === undefined) return undefined;
  const allowed = nestedFields[key];
  if (allowed && Array.isArray(value)) return value.map((item) => projectValue(key, item, nestedFields));
  if (allowed && value && typeof value === "object") return Object.fromEntries(allowed
    .filter((field) => value[field] !== undefined)
    .map((field) => [field, value[field]]));
  if (value && typeof value === "object") {
    // No arbitrary nested source objects enter the public payload.
    if (Array.isArray(value) && value.every((item) => item === null || ["string", "number", "boolean"].includes(typeof item))) return value;
    return undefined;
  }
  return value;
}

export function buildExplorerSnapshot(policy, schemas, collections) {
  const records = new Map();
  const publishedCollections = [];
  const diagnostics = [];
  for (const definition of policy.collections) {
    const schema = schemas[definition.schema];
    const source = collections[definition.query];
    if (!schema || !source) { diagnostics.push(`Unsupported collection ${definition.id}: ${!schema ? "schema" : "Model query"} unavailable`); continue; }
    const ids = new Set();
    for (const original of source) {
      if (!original || typeof original.id !== "string") { diagnostics.push(`${definition.id}: record has no stable ID`); continue; }
      if (original.active === false || original.published === false || original.public === false) continue;
      const fields = Object.fromEntries(definition.fields
        .map((key) => [key, projectValue(key, original[key], policy.nestedFields)])
        .filter(([, value]) => value !== undefined));
      if (ids.has(original.id)) continue;
      ids.add(original.id);
      const existing = records.get(original.id);
      const type = existing?.schema === "activity" ? "activity" : definition.schema === "activity" ? "activity" : definition.schema;
      records.set(original.id, {
        id: original.id,
        schema: type,
        typeName: schemas[type]?.title ?? definition.title,
        title: titleFor({ ...fields, id: original.id }),
        description: fields.summary || fields.description || fields.statement || fields.introduction || "",
        fields: { ...(existing?.fields ?? {}), ...fields },
      });
    }
    if (ids.size) publishedCollections.push({ id: definition.id, title: definition.title, group: definition.group, schema: definition.schema, recordIds: [...ids] });
  }
  const recordMap = Object.fromEntries(records);
  for (const record of records.values()) {
    for (const [field, value] of Object.entries(record.fields)) {
      if (!referenceField(field)) continue;
      for (const id of Array.isArray(value) ? value : [value]) {
        if (typeof id === "string" && id && !records.has(id)) diagnostics.push(`${record.id}.${field}: reference ${id} is unavailable in the public Explorer`);
      }
    }
  }
  const groups = policy.groups.map((group) => ({ ...group, collectionIds: publishedCollections.filter((item) => item.group === group.id).map((item) => item.id) })).filter((group) => group.collectionIds.length);
  const namedSchemas = new Set(policy.collections.map((item) => item.schema));
  const abstractSchemas = new Set(["common", "page", "view", "source", "organization-service", "development", "legacy-work"]);
  const unsupportedTypes = Object.keys(schemas).filter((name) => !namedSchemas.has(name) && !abstractSchemas.has(name));
  return {
    snapshot: { groups, collections: publishedCollections, records: recordMap, unsupportedTypes, fieldLabels: policy.fieldLabels },
    diagnostics,
  };
}

export function searchExplorer(snapshot, query) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];
  return Object.values(snapshot.records).filter((record) => {
    const linkedNames = Object.entries(record.fields).filter(([field]) => referenceField(field))
      .flatMap(([, value]) => Array.isArray(value) ? value : [value])
      .map((id) => typeof id === "string" ? snapshot.records[id]?.title : undefined).filter(Boolean);
    const text = [record.id, record.typeName, record.title, record.description, JSON.stringify(record.fields), ...linkedNames].join(" ").toLocaleLowerCase();
    return text.includes(needle);
  });
}
