import { siteModel } from "../model";

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

export const dogActivityQuestions: ActivityQuestion[] = siteModel.getActivityQuestionGroups();
