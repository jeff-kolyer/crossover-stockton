const dateField = (name) => name === "date" || name === "as_of" || name === "period_start" || name === "period_end" || name.endsWith("_at") || name.endsWith("_date");
const urlField = (name) => name === "url" || name === "website" || name === "path" || name.endsWith("_url") || name.endsWith("Url");
const titleFor = (record) => record.publicName || record.name || record.title || record.statement
  || (record.value !== undefined && record.unit ? `${record.value.toLocaleString("en-US")} ${record.unit}` : undefined)
  || record.measure || record.id;

const idsFrom = (record, fields) => fields.flatMap((field) => Array.isArray(record?.[field]) ? record[field] : []);

function investigationBranches(policy, collections, publishedCollections, records) {
  const sourceById = new Map(publishedCollections.map((collection) => [collection.id, collection]));
  const publishedIds = (id) => new Set(sourceById.get(id)?.recordIds ?? []);
  const evidence = new Map((collections.evidence ?? []).map((record) => [record.id, record]));
  const branches = [];
  const children = [];
  for (const investigation of collections.investigations ?? []) {
    if (!records.has(investigation.id)) continue;
    const scoped = (id) => (collections[id] ?? []).filter((item) => item.investigation_id === investigation.id && publishedIds(id).has(item.id));
    const questions = scoped("questions");
    const tasks = scoped("tasks");
    const activities = scoped("activities");
    const findings = scoped("findings");
    const articles = (collections.articles ?? []).filter((item) => item.related_gap_ids?.includes(investigation.gap_id) && publishedIds("articles").has(item.id));
    const locations = scoped("locations");
    const projects = (collections.projects ?? []).filter((item) => item.gap_ids?.includes(investigation.gap_id) && publishedIds("projects").has(item.id));
    const need = (collections.needs ?? []).find((item) => item.id === investigation.gap_id);
    const evidenceIds = new Set(idsFrom(investigation, ["evidence_record_ids"]));
    for (const item of [...questions, ...tasks, ...activities, ...findings, ...locations, ...projects, need]) {
      for (const id of idsFrom(item, ["evidence_record_ids", "activity_record_ids", "basis_record_ids", "report_record_ids", "supporting_record_ids", "contradicting_record_ids", "record_ids", "source_record_ids"])) evidenceIds.add(id);
      if (item?.evidence_record_id) evidenceIds.add(item.evidence_record_id);
    }
    for (const item of activities) evidenceIds.add(item.id);
    for (const project of projects) {
      for (const item of [project.expected_capacity_or_benefit, project.actual_additional_capacity, ...(project.milestones ?? [])]) {
        for (const id of idsFrom(item, ["evidence_record_ids"])) evidenceIds.add(id);
      }
    }
    for (const item of evidence.values()) if (item.investigation_id === investigation.id) evidenceIds.add(item.id);
    // Source links can identify a second record behind a directly related activity.
    for (const id of [...evidenceIds]) {
      const item = evidence.get(id);
      for (const related of idsFrom(item, ["basis_record_ids", "report_record_ids"])) evidenceIds.add(related);
    }
    const relatedEvidence = (collections.evidence ?? []).filter((item) => evidenceIds.has(item.id) && publishedIds("evidence").has(item.id));
    const organizationIds = new Set();
    for (const item of [need, ...tasks, ...activities, ...projects, ...relatedEvidence]) {
      for (const id of idsFrom(item, ["organization_ids"])) organizationIds.add(id);
    }
    const organizations = (collections.organizations ?? []).filter((item) => organizationIds.has(item.id) && publishedIds("organizations").has(item.id));
    const relatedUpdates = (id) => {
      const query = policy.collections.find((item) => item.id === id)?.query;
      return (collections[query] ?? []).filter((item) =>
        (item.investigation_id === investigation.id || item.gap_ids?.includes(investigation.gap_id)) && publishedIds(id).has(item.id));
    };
    const members = { questions, tasks, activities, findings, articles, locations, evidence: relatedEvidence, projects, organizations,
      developments: relatedUpdates("developments"), "investigation-updates": relatedUpdates("investigation-updates") };
    const collectionIds = [];
    for (const sourceId of policy.investigationChildren ?? []) {
      const nested = policy.investigationCollectionGroups?.find((item) => item.id === sourceId);
      if (nested) {
        const parentId = `${investigation.id}:${nested.id}`;
        const childCollectionIds = [];
        for (const nestedId of nested.collectionIds) {
          const source = sourceById.get(nestedId);
          if (!source) continue;
          const id = `${investigation.id}:${nestedId}`;
          children.push({ id, title: source.title, group: "investigation", investigationId: investigation.id, parentCollectionId: parentId, schema: source.schema, recordIds: (members[nestedId] ?? []).map((item) => item.id) });
          childCollectionIds.push(id);
        }
        if (!childCollectionIds.length) continue;
        children.push({ id: parentId, title: nested.title, group: "investigation", investigationId: investigation.id, childCollectionIds, schema: null, recordIds: [] });
        collectionIds.push(parentId);
        continue;
      }
      const source = sourceById.get(sourceId);
      if (!source) continue;
      const id = `${investigation.id}:${sourceId}`;
      children.push({ id, title: sourceId === "activities" ? "Activity" : source.title, group: "investigation", investigationId: investigation.id, schema: source.schema, recordIds: (members[sourceId] ?? []).map((item) => item.id) });
      collectionIds.push(id);
    }
    branches.push({ id: investigation.id, title: titleFor(investigation), collectionIds });
  }
  return { branches, children };
}

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
  const recordMap = Object.fromEntries(records);
  for (const record of records.values()) {
    for (const [field, value] of Object.entries(record.fields)) {
      if (!relationshipFields.has(field)) continue;
      for (const id of Array.isArray(value) ? value : [value]) {
        if (typeof id === "string" && id && !records.has(id)) diagnostics.push(`${record.id}.${field}: reference ${id} is unavailable in the public Explorer`);
      }
    }
  }
  const { branches, children } = investigationBranches(policy, collections, publishedCollections, records);
  const hiddenCollectionIds = new Set(["investigations", "question-groups", "workstreams",
    ...(policy.investigationChildren ?? []).filter((id) => policy.collections.find((item) => item.id === id)?.group === "investigation")]);
  const visibleCollections = publishedCollections.map((item) => ({ ...item, hidden: hiddenCollectionIds.has(item.id) || !policy.groups.some((group) => group.id === item.group) }));
  const groups = policy.groups.map((group) => ({ ...group, collectionIds: visibleCollections.filter((item) => item.group === group.id && !item.hidden).map((item) => item.id), ...(group.id === "investigation" ? { investigationIds: branches.map((item) => item.id) } : {}) })).filter((group) => group.collectionIds.length || group.investigationIds?.length);
  const namedSchemas = new Set(policy.collections.map((item) => item.schema));
  const abstractSchemas = new Set(["common", "page", "view", "source", "organization-service", "development", "legacy-work"]);
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
    return [name, { label: policy.fieldLabels?.[name] ?? reverseRelation?.label ?? name, kind, ...(property?.description ? { description: property.description } : {}) }];
  }));
  return {
    snapshot: { groups, investigations: branches, recordChildren: Object.fromEntries(branches.map((branch) => [branch.id, branch.collectionIds])), collections: [...visibleCollections, ...children], records: recordMap, unsupportedTypes, fieldLabels: policy.fieldLabels, fieldInfo },
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
