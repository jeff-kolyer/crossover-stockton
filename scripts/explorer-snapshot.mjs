const dateField = (name) => name === "date" || name === "as_of" || name === "period_start" || name === "period_end" || name.endsWith("_at") || name.endsWith("_date");
const urlField = (name) => name === "url" || name === "website" || name === "path" || ["preferred_image", "preferred_logo", "thumbnail_image"].includes(name) || name.endsWith("_url") || name.endsWith("Url");
const titleFor = (record) => record.publicName || record.name || record.title || record.statement
  || (record.value !== undefined && record.unit ? `${record.value.toLocaleString("en-US")} ${record.unit}` : undefined)
  || record.measure || record.id;

const dateFields = ["occurred_at", "published_at", "date", "completed_at", "recorded_at", "updated_at", "last_updated_at", "last_reviewed_at", "last_verified_at", "evidence_date", "period_end", "period_start", "checked_at"];
const validDate = (value) => {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}(?:T.*)?$/.test(value) || !Number.isFinite(Date.parse(value))) return false;
  const [year, month, day] = value.slice(0, 10).split("-").map(Number);
  const actual = new Date(Date.UTC(year, month - 1, day));
  return actual.getUTCFullYear() === year && actual.getUTCMonth() + 1 === month && actual.getUTCDate() === day;
};
const dateForSort = (fields) => {
  for (const field of dateFields) {
    const value = fields[field];
    if (validDate(value)) return { field, value };
  }
  return undefined;
};
function projectValue(key, value, nestedFields) {
  if (value === undefined) return undefined;
  const allowed = nestedFields[key];
  if (allowed && Array.isArray(value)) return value.map((item) => projectValue(key, item, nestedFields));
  if (allowed && value && typeof value === "object") {
    if (Array.isArray(allowed)) return Object.fromEntries(allowed
      .filter((field) => value[field] !== undefined)
      .map((field) => [field, value[field]]));
    const projectNested = (source, fields) => {
      if (Array.isArray(source)) return source.map((item) => projectNested(item, fields));
      if (!source || typeof source !== "object") return undefined;
      return Object.fromEntries(Object.entries(fields).flatMap(([field, rule]) => {
        const child = source[field];
        if (child === undefined) return [];
        const projected = rule === true
          ? (child === null || ["string", "number", "boolean"].includes(typeof child) || (Array.isArray(child) && child.every((item) => item === null || ["string", "number", "boolean"].includes(typeof item))) ? child : undefined)
          : projectNested(child, rule);
        return projected === undefined ? [] : [[field, projected]];
      }));
    };
    return projectNested(value, allowed);
  }
  if (value && typeof value === "object") {
    // No arbitrary nested source objects enter the public payload.
    if (Array.isArray(value) && value.every((item) => item === null || ["string", "number", "boolean"].includes(typeof item))) return value;
    return undefined;
  }
  return value;
}

export function buildExplorerSnapshot(policy, schemas, collections, roots) {
  if (!Array.isArray(roots)) throw new Error("Explorer roots must come from category data files");
  const groupByCollection = new Map(roots.flatMap((root) => root.collectionIds.map((id) => [id, root.id])));
  const relationshipFields = new Set(policy.relationshipFields ?? []);
  const collectionFields = (definition) => {
    const fields = definition.fields ?? policy.collections.find((item) => item.id === definition.fieldsFrom)?.fields;
    return fields ? [...new Set([...fields, ...(policy.sharedFields ?? [])])] : undefined;
  };
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
    if (ids.size) publishedCollections.push({ id: definition.id, title: definition.title, group: groupByCollection.get(definition.id) ?? "unclassified", schema: definition.schema, recordIds: [...ids] });
  }
  for (const relation of policy.reverseRelationships ?? []) {
    for (const source of [...records.values()]) {
      if (source.schema !== relation.sourceSchema) continue;
      const targetId = source.fields[relation.sourceField];
      const target = records.get(targetId);
      if (!target || target.schema !== relation.targetSchema) continue;
      const relatedIds = target.fields[relation.field] ?? [];
      records.set(targetId, { ...target, fields: { ...target.fields, [relation.field]: [...new Set([...relatedIds, source.id])] } });
    }
  }
  // Only firsthand, occurred Crossover actions establish contact. Research references
  // and planned actions do not create a contact relationship.
  for (const activity of records.values()) {
    if (activity.schema !== "activity" || activity.fields.trust !== "crossover_source"
      || activity.fields.source?.type !== "firsthand_account" || !validDate(activity.fields.occurred_at)) continue;
    for (const id of activity.fields.organization_ids ?? []) {
      const organization = records.get(id);
      if (organization?.schema !== "organization") continue;
      const linked = organization.fields.contact_activity_ids ?? [];
      organization.fields.contact_activity_ids = [...new Set([...linked, activity.id])];
    }
  }
  for (const organization of records.values()) {
    if (organization.schema !== "organization" || !organization.fields.contact_activity_ids) continue;
    organization.fields.contact_activity_ids.sort((a, b) =>
      records.get(b).fields.occurred_at.localeCompare(records.get(a).fields.occurred_at) || a.localeCompare(b));
  }
  for (const record of records.values()) record.dateForSort = dateForSort(record.fields);
  const recordMap = Object.fromEntries(records);
  for (const record of records.values()) {
    for (const [field, value] of Object.entries(record.fields)) {
      if (!relationshipFields.has(field)) continue;
      for (const id of Array.isArray(value) ? value : [value]) {
        if (typeof id === "string" && id && !records.has(id)) diagnostics.push(`${record.id}.${field}: reference ${id} is unavailable in the public Explorer`);
      }
    }
  }
  const visibleCollections = publishedCollections.map((item) => ({ ...item, hidden: !roots.some((root) => root.id === item.group) }));
  const groups = roots.map((root) => ({ id: root.id, title: root.title, collectionIds: visibleCollections.filter((item) => item.group === root.id && !item.hidden).map((item) => item.id) })).filter((group) => group.collectionIds.length);
  const namedSchemas = new Set(policy.collections.map((item) => item.schema));
  const abstractSchemas = new Set(["common", "source", "organization-service", "development"]);
  const unsupportedTypes = Object.keys(schemas).filter((name) => !namedSchemas.has(name) && !abstractSchemas.has(name));
  const nestedFieldNames = (rule) => Array.isArray(rule) ? rule : Object.entries(rule).flatMap(([name, child]) => [name, ...(child === true ? [] : nestedFieldNames(child))]);
  const fieldNames = new Set([
    ...Object.keys(policy.fieldLabels ?? {}),
    ...(policy.reverseRelationships ?? []).map((relation) => relation.field),
    ...policy.collections.flatMap((collection) => collectionFields(collection) ?? []),
    ...Object.values(policy.nestedFields ?? {}).flatMap(nestedFieldNames),
  ]);
  const fieldInfo = Object.fromEntries([...fieldNames].map((name) => {
    const property = Object.values(schemas).map((schema) => schema.properties?.[name]).find(Boolean);
    const reverseRelation = policy.reverseRelationships?.find((relation) => relation.field === name);
    const kind = relationshipFields.has(name) || reverseRelation ? "reference" : dateField(name) || property?.$ref?.endsWith("/$defs/date") ? "date"
      : urlField(name) ? "url" : "value";
    const description = policy.fieldDescriptions?.[name] ?? property?.description;
    return [name, { label: policy.fieldLabels?.[name] ?? reverseRelation?.label ?? name, kind,
      ...(description ? { description } : {}),
      ...(policy.fieldValueLabels?.[name] ? { valueLabels: policy.fieldValueLabels[name] } : {}) }];
  }));
  return {
    snapshot: { groups, collections: visibleCollections, records: recordMap, unsupportedTypes, fieldLabels: policy.fieldLabels, fieldInfo, visualGuidance: policy.visualGuidance, browseGuidance: policy.browseGuidance, locationGuidance: policy.locationGuidance },
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
  }).sort((a, b) => (b.dateForSort ? Date.parse(b.dateForSort.value) : -Infinity)
    - (a.dateForSort ? Date.parse(a.dateForSort.value) : -Infinity) || a.id.localeCompare(b.id));
}
