import { createElement, type ElementType, type ReactNode } from "react";

export type SpaceRole = "tight" | "related" | "content" | "section";
type WidthRole = "document" | "wide" | "home" | "work" | "index" | "investigation" | "map";
type LayoutProps = {
  as?: ElementType;
  children?: ReactNode;
  className?: string;
  id?: string;
  role?: string;
  "aria-label"?: string;
  "aria-labelledby"?: string;
};
type SpacedProps = LayoutProps & { space?: SpaceRole };

const classes = (...names: Array<string | undefined>) => names.filter(Boolean).join(" ");
const spaced = (name: string, { as = "div", className, children, space = "content", ...rest }: SpacedProps) =>
  createElement(as, { ...rest, className: classes(name, `layout-space--${space}`, className) }, children);

export function Page({ width = "wide", as = "div", className, children, ...rest }: LayoutProps & { width?: WidthRole }) {
  return createElement(as, { ...rest, className: classes("layout-page", `layout-page--${width}`, className) }, children);
}
export function Section(props: SpacedProps) { return spaced("layout-section-list", { as: "section", space: "section", ...props }); }
export function Stack(props: SpacedProps) { return spaced("layout-stack", props); }
export function Row(props: SpacedProps) { return spaced("layout-row", { space: "related", ...props }); }
export function Grid(props: SpacedProps) { return spaced("layout-grid", { space: "content", ...props }); }
export function Cluster(props: LayoutProps) { return createElement(props.as ?? "div", { ...props, as: undefined, className: classes("layout-cluster", props.className) }, props.children); }
export function Inset({ as = "div", className, children, ...rest }: LayoutProps) { return createElement(as, { ...rest, className: classes("layout-inset", className) }, children); }
export function Divider({ className }: { className?: string }) { return <hr className={classes("layout-divider", className)} />; }
export function SectionBoundary({ before, after, className }: { before: ReactNode; after: ReactNode; className?: string }) {
  return <div className={classes("layout-section-boundary", className)}>{before}<Divider />{after}</div>;
}
export function HeadingGroup(props: LayoutProps) { return spaced("layout-heading-group", { ...props, space: "tight" }); }
export function ProseStack(props: LayoutProps) { return spaced("layout-prose-stack", { ...props, space: "content" }); }
export function SectionHeader(props: LayoutProps) { return spaced("layout-heading-group", { as: "header", ...props, space: "tight" }); }
export function RecordList({ separated = false, ...props }: LayoutProps & { separated?: boolean }) {
  return spaced(classes("layout-record-list", separated ? "layout-record-list--separated" : undefined), { ...props, space: "content" });
}
export function RecordRow(props: LayoutProps) { return spaced("layout-record-row", { as: "article", ...props, space: "related" }); }
export function QuestionGroup(props: LayoutProps) { return spaced("layout-question-group", { as: "section", ...props, space: "content" }); }
export function ActivityRecord(props: LayoutProps) { return spaced("layout-activity-record", { as: "article", ...props, space: "related" }); }
export function Finding(props: LayoutProps) { return spaced("layout-finding", { as: "article", ...props, space: "related" }); }
export function Figure({ image, caption, className }: { image: ReactNode; caption?: ReactNode; className?: string }) {
  return <figure className={classes("layout-figure", className)}>{image}{caption && <figcaption>{caption}</figcaption>}</figure>;
}
export function MediaRow(props: LayoutProps) { return spaced("layout-media-row", { ...props, space: "content" }); }
export function ActionMetrics(props: LayoutProps) { return createElement(props.as ?? "dl", { ...props, as: undefined, className: classes("layout-action-metrics", props.className) }, props.children); }
