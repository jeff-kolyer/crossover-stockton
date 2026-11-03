import activityPage from "./pages/investigations/dogs/activity.json";

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

export const dogActivityQuestions: ActivityQuestion[] = activityPage.questions;
