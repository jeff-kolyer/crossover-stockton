import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// Validator for the JSON Schema 2020-12 vocabulary used by src/schemas.
// Unknown keywords fail closed so adding a schema constraint cannot silently bypass checks.
const supported = new Set(["$schema", "$id", "$defs", "$ref", "title", "description", "type", "enum", "const", "required", "properties", "additionalProperties", "items", "minItems", "maxItems", "minLength", "pattern", "uniqueItems", "anyOf"]);
const cache = new Map();
const schemaFile = (name) => resolve("src/schemas", `${name}.schema.json`);
function readSchema(file) {
  if (!cache.has(file)) cache.set(file, JSON.parse(readFileSync(file, "utf8")));
  return cache.get(file);
}
const typeOf = (value) => value === null ? "null" : Array.isArray(value) ? "array" : typeof value;
function validate(value, schema, path, file, errors) {
  for (const key of Object.keys(schema)) if (!supported.has(key)) errors.push(`${path}: unsupported schema keyword ${key}`);
  if (schema.$ref) {
    const [target, pointer = ""] = schema.$ref.split("#");
    const targetFile = target ? resolve("src/schemas", target) : file;
    let referenced = readSchema(targetFile);
    for (const part of pointer.split("/").filter(Boolean)) referenced = referenced?.[part.replaceAll("~1", "/").replaceAll("~0", "~")];
    if (!referenced) errors.push(`${path}: unresolved schema reference ${schema.$ref}`);
    else validate(value, referenced, path, targetFile, errors);
    return;
  }
  if (schema.anyOf) {
    const matches = schema.anyOf.some((candidate) => {
      const candidateErrors = [];
      validate(value, candidate, path, file, candidateErrors);
      return candidateErrors.length === 0;
    });
    if (!matches) errors.push(`${path}: does not match any allowed schema`);
    return;
  }
  if (schema.type && typeOf(value) !== schema.type) { errors.push(`${path}: expected ${schema.type}, found ${typeOf(value)}`); return; }
  if (schema.const !== undefined && value !== schema.const) errors.push(`${path}: expected ${JSON.stringify(schema.const)}`);
  if (schema.enum && !schema.enum.includes(value)) errors.push(`${path}: unexpected value ${JSON.stringify(value)}`);
  if (typeof value === "string") {
    if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${path}: string is too short`);
    if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${path}: invalid format ${JSON.stringify(value)}`);
  }
  if (Array.isArray(value)) {
    if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path}: too few items`);
    if (schema.maxItems !== undefined && value.length > schema.maxItems) errors.push(`${path}: too many items`);
    if (schema.uniqueItems && new Set(value.map((item) => JSON.stringify(item))).size !== value.length) errors.push(`${path}: duplicate items`);
    value.forEach((item, index) => schema.items && validate(item, schema.items, `${path}[${index}]`, file, errors));
  }
  if (value && typeOf(value) === "object") {
    for (const key of schema.required ?? []) if (!(key in value)) errors.push(`${path}: missing ${key}`);
    for (const [key, child] of Object.entries(value)) {
      if (schema.properties?.[key]) validate(child, schema.properties[key], `${path}.${key}`, file, errors);
      else if (schema.additionalProperties === false) errors.push(`${path}: unexpected property ${key}`);
      else if (schema.additionalProperties && typeof schema.additionalProperties === "object") validate(child, schema.additionalProperties, `${path}.${key}`, file, errors);
    }
  }
}
export function validateRecord(value, schemaName, path = schemaName) {
  const errors = [];
  const file = schemaFile(schemaName);
  validate(value, readSchema(file), path, file, errors);
  return errors;
}
