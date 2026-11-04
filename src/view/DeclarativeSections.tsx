import { Fragment, type ReactNode } from "react";
import { getPageComposition, resolvePageSection, type ViewMethod } from "./registry";

type Items = Array<{ id: string; [key: string]: unknown }>;
export type SectionRenderer<T> = (items: Items, context: T, value?: unknown) => ReactNode;
export type RegisteredSectionRenderer<T> = { method: ViewMethod; render: SectionRenderer<T> };

/** Shared page pipeline: declaration → model query → registered renderer. */
export function DeclarativeSections<T>({ pageId, region, renderers, context }: {
  pageId: string;
  region?: "hero" | "hero-action" | "body";
  renderers: Record<string, RegisteredSectionRenderer<T>>;
  context: T;
}) {
  return <>{getPageComposition(pageId)?.sections.filter((section) => !region || section.region === region).map((section) => {
    const selected = section.renderer && renderers[section.renderer];
    if (!selected) return null;
    if (selected.method !== section.method) throw new Error(`Renderer ${section.renderer} requires ${selected.method}, got ${section.method}`);
    const { items, value } = resolvePageSection(pageId, section.id);
    return <Fragment key={section.id}>{selected.render(items, context, value)}</Fragment>;
  })}</>;
}
