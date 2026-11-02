export interface ActivityQuestion {
  id: string;
  title: string;
  description: string;
  activityIds: string[];
  reportIds: string[];
  relatedActivityIds?: string[];
  relatedReportIds?: string[];
  note?: string;
}

export const dogActivityQuestions: ActivityQuestion[] = [
  {
    id: "question-extent",
    title: "What is the extent of the problem?",
    description: "How many dogs are on the streets, where are they, and what condition are they in?",
    activityIds: [],
    reportIds: [],
    relatedActivityIds: ["crossover-2026-10-20-sas-field-call-records-request"],
    note: "No Crossover street-level field observation has been completed yet.",
  },
  {
    id: "question-care",
    title: "Who is already caring for them?",
    description: "What care is being provided, by whom, and where?",
    activityIds: [],
    reportIds: ["crossover-2026-10-14-sas-first-visit"],
  },
  {
    id: "question-reporting",
    title: "What happens when someone reports a dog?",
    description: "How are reports handled, and what happens to the dogs?",
    activityIds: ["crossover-2026-10-20-sas-field-call-records-request"],
    reportIds: [],
  },
  {
    id: "question-participation",
    title: "What happens when people try to help?",
    description: "What works, and what prevents people from participating?",
    activityIds: ["crossover-2026-10-14-sas-volunteer-application", "crossover-2026-10-12-doggie-day-out-inquiry", "crossover-2026-10-07-street-dogs-volunteer-application"],
    reportIds: [],
  },
  {
    id: "question-improvements",
    title: "What's being done to improve access to care?",
    description: "What improvements are underway, and what results are they producing?",
    activityIds: [],
    reportIds: [],
    relatedReportIds: ["crossover-2026-10-14-sas-first-visit"],
    relatedActivityIds: ["crossover-2026-10-12-doggie-day-out-inquiry"],
    note: "No completed assessment of improvement outcomes is recorded yet.",
  },
];
