import type { EvidenceRecord } from "../types";
import type { InvestigationTask } from "../types/investigation";
import type { Article } from "../types/article";

// Link text is editorial metadata. The complete titles remain on the records.
const recordLabels: Record<string, string> = {
  "stockton-animal-services-2026-10-20-reporting-guidance": "Animal Services reporting guidance",
  "cbs-2026-04-06-stockton-abandoned-dogs": "CBS abandoned-dog report",
  "crossover-2026-10-20-sas-field-call-records-request": "Animal Services records request",
  "crossover-2026-10-14-sas-volunteer-application": "Animal Services volunteer visit",
  "crossover-2026-10-14-sas-first-visit": "First Animal Services visit",
  "sas-2024-kennel-statistics": "2024 kennel report",
  "sas-2026-01-13-spay-neuter-capacity": "Spay-neuter contract",
  "stockton-2026-05-11-stray-dog-report": "Stocktonia stray-dog report",
  "ssd-2026-06-08-street-response": "CBS Street Dogs report",
  "sas-standing-doggie-day-out": "Doggie Day Out volunteering",
  "stockton-2026-10-19-animal-services-ordinance-agenda": "Animal-control meeting agenda",
  "kcra-2026-09-24-stockton-stray-dog-report": "KCRA stray-dog report",
  "ssd-2026-09-29-dumped-dogs-surge": "Street Dogs video report",
  "ssd-2026-07-30-canine-campus-proposal": "Canine Campus proposal video",
  "ssd-2026-10-07-canine-campus-details": "Canine Campus proposal details",
  "crossover-2026-10-07-street-dogs-volunteer-application": "Street Dogs volunteer application",
  "crossover-2026-10-12-doggie-day-out-inquiry": "Doggie Day Out inquiry",
  "stocktonia-2026-10-20-sas-capacity-intake": "Shelter capacity coverage",
  "stocktonia-2026-10-20-roaming-dog-distinction": "Roaming-dog distinction",
  "stocktonia-2026-10-20-found-animal-foster-pathway": "Found-animal foster pathway",
  "stocktonia-2026-10-20-animal-control-proposals": "Animal-control proposal coverage",
  "smcs-standing-housing-outcomes": "St. Mary’s housing program",
  "smcs-2026-06-17-pathways-268-beds": "Pathways Neighborhood opening",
};

const taskLabels: Record<string, string> = {
  "task-ssd-volunteer-application-2026-10-07": "Street Dogs volunteer application",
  "task-sas-doggie-day-out-inquiry-2026-10-12": "Doggie Day Out inquiry",
  "task-sas-visit-application-2026-10-14": "Animal Services volunteer visit",
  "task-sas-field-call-request-2026-10-20": "Animal Services records request",
  "task-sas-field-call-follow-up": "Animal Services records follow-up",
  "task-verify-st-marys-church-street-dog-scale": "St. Mary’s conditions check",
  "task-verify-south-stockton-district-5-reports": "South Stockton conditions check",
  "task-sas-volunteer-onboarding-follow-up": "Animal Services volunteer follow-up",
};

const articleLabels: Record<string, string> = {
  "friction-of-volunteering": "Friction of volunteering",
  "public-access-to-stray-dog-information": "Public stray-dog information",
  "caring-for-stocktons-dogs": "Caring for Stockton’s dogs",
  "where-are-stray-dogs": "Where are stray dogs?",
};

const locationSourceLabels: Record<string, string> = {
  "south-lincoln-crosstown": "Stocktonia South Lincoln report",
  "trinity-bear-creek": "Stocktonia Trinity Parkway report",
  "country-club-i5": "County Country Club report",
  "pawboost-crown-rose-marie-2026-10-16": "PawBoost Crown Avenue report",
  "pawboost-california-magnolia-2026-10-15": "PawBoost California Street report",
  "pawboost-mcdougald-henry-long-2026-10-15": "PawBoost McDougald Boulevard report",
};

export const recordLinkLabel = (record: EvidenceRecord) => recordLabels[record.id] ?? record.title;
export const taskLinkLabel = (task: InvestigationTask) => taskLabels[task.id] ?? task.title;
export const articleLinkLabel = (article: Article) => articleLabels[article.id] ?? article.title;
export const locationSourceLinkLabel = (locationId: string) => locationSourceLabels[locationId] ?? "Location source";
