import uiCopy from "../data/pages/investigations/dogs/overview.json";
import type { EvidenceRecord } from "../types";
import type { InvestigationTask } from "../types/investigation";
import type { Article } from "../types/article";

// Link text is editorial metadata. The complete titles remain on the records.
const recordLabels: Record<string, string> = uiCopy.shortLinkLabels.recordLabels;

const taskLabels: Record<string, string> = uiCopy.shortLinkLabels.taskLabels;

const articleLabels: Record<string, string> = uiCopy.shortLinkLabels.articleLabels;

const locationSourceLabels: Record<string, string> = uiCopy.shortLinkLabels.locationSourceLabels;

export const recordLinkLabel = (record: EvidenceRecord) => recordLabels[record.id] ?? record.title;
export const taskLinkLabel = (task: InvestigationTask) => taskLabels[task.id] ?? task.title;
export const articleLinkLabel = (article: Article) => articleLabels[article.id] ?? article.title;
export const locationSourceLinkLabel = (locationId: string) => locationSourceLabels[locationId] ?? uiCopy.linkLabels.locationSource;
