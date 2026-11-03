const dateField = (name) => name === "date" || name === "as_of" || name === "period_start" || name === "period_end" || name.endsWith("_at") || name.endsWith("_date");
const urlField = (name) => name === "url" || name === "website" || name === "path" || name.endsWith("_url") || name.endsWith("Url");
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
  const relationshipFields = new Set(policy.relationshipFields ?? []);
  const collectionFields = (definition) => definition.fields ?? policy.collections.find((item) => item.id === definition.fieldsFrom)?.fields;
  const records = new Map();
  const publishedCollections = [];
  const diagnostics = [];
  for (const definition of policy.collections) {
    const schema = schemas[definition.schema];
    const source = collections[definition.query];
    const allowedFields = collectionFields(definition);
    if (!schema || !source || !allowedFields) { diagnostics.push(`Unsupported collection ${definition.id}: ${!schema ? "schema" : !source ? "Model query" : "publication fields"} unavailable`); continue; }
    const ids = new Set();
    for (const original of source) {
      if (!original || typeof original.id !== "string") { diagnostics.push(`${definition.id}: record has no stable ID`); continue; }
      if (original.active === false || original.published === false || original.public === false || original.visibility === "internal") continue;
      const fields = Object.fromEntries(allowedFields
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
      if (!relationshipFields.has(field)) continue;
      for (const id of Array.isArray(value) ? value : [value]) {
        if (typeof id === "string" && id && !records.has(id)) diagnostics.push(`${record.id}.${field}: reference ${id} is unavailable in the public Explorer`);
      }
    }
  }
  const groups = policy.groups.map((group) => ({ ...group, collectionIds: publishedCollections.filter((item) => item.group === group.id).map((item) => item.id) })).filter((group) => group.collectionIds.length);
  const namedSchemas = new Set(policy.collections.map((item) => item.schema));
  const abstractSchemas = new Set(["common", "page", "view", "source", "organization-service", "development", "legacy-work"]);
  const unsupportedTypes = Object.keys(schemas).filter((name) => !namedSchemas.has(name) && !abstractSchemas.has(name));
  const fieldNames = new Set([
    ...Object.keys(policy.fieldLabels ?? {}),
    ...policy.collections.flatMap((collection) => collectionFields(collection) ?? []),
    ...Object.values(policy.nestedFields ?? {}).flat(),
  ]);
  const fieldInfo = Object.fromEntries([...fieldNames].map((name) => {
    const property = Object.values(schemas).map((schema) => schema.properties?.[name]).find(Boolean);
    const kind = relationshipFields.has(name) ? "reference" : dateField(name) || property?.$ref?.endsWith("/$defs/date") ? "date"
      : urlField(name) ? "url" : "value";
    return [name, { label: policy.fieldLabels?.[name] ?? name, kind, ...(property?.description ? { description: property.description } : {}) }];
  }));
  return {
    snapshot: { groups, collections: publishedCollections, records: recordMap, unsupportedTypes, fieldLabels: policy.fieldLabels, fieldInfo },
    diagnostics,
  };
}

export function searchExplorer(snapshot, query) {
  const needle = query.trim().toLocaleLowerCase();
  if (!needle) return [];
  return Object.values(snapshot.records).filter((record) => {
    const linkedNames = Object.entries(record.fields).filter(([field]) => snapshot.fieldInfo?.[field]?.kind === "reference")
      .flatMap(([, value]) => Array.isArray(value) ? value : [value])
      .map((id) => typeof id === "string" ? snapshot.records[id]?.title : undefined).filter(Boolean);
    const text = [record.id, record.typeName, record.title, record.description, JSON.stringify(record.fields), ...linkedNames].join(" ").toLocaleLowerCase();
    return text.includes(needle);
  });
}
