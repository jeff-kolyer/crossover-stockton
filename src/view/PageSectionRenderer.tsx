import { Fragment, type ReactNode } from "react";
import { RecordList, Stack } from "../components/layout";
import { resolvePageSection, type ViewMethod } from "./registry";

type RecordRef = { id: string };
type ViewWrapper = ({ children, className }: { children: ReactNode; className?: string }) => ReactNode;

const plain: ViewWrapper = ({ children }) => <Fragment>{children}</Fragment>;
const list: ViewWrapper = ({ children, className }) => <RecordList className={className}>{children}</RecordList>;
const separatedList: ViewWrapper = ({ children, className }) => <RecordList separated className={className}>{children}</RecordList>;
const stack: ViewWrapper = ({ children, className }) => <Stack className={className}>{children}</Stack>;

// View methods select reusable layout behavior. Page compositions select records;
// callers provide the record-specific content without embedding source data here.
export const viewRegistry: Record<ViewMethod, ViewWrapper> = {
  prose: stack,
  "media-list": separatedList,
  "media-grid": list,
  "collection-index": list,
  "disclosure-list": list,
  timeline: separatedList,
  "evidence-list": separatedList,
  "finding-explanation": stack,
  statistics: plain,
  "geographic-map": plain,
  "split-investigation-workspace": plain,
};

export function PageSectionRenderer({ pageId, sectionId, className, renderRecord }: {
  pageId: string;
  sectionId: string;
  className?: string;
  renderRecord: (record: RecordRef) => ReactNode;
}) {
  const { method, items } = resolvePageSection(pageId, sectionId);
  const Wrapper = viewRegistry[method];
  return <Wrapper className={className}>{items.map((item) => <Fragment key={item.id}>{renderRecord(item)}</Fragment>)}</Wrapper>;
}
