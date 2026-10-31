export type ArticleType = "finding" | "investigation" | "opinion" | "report" | "update";

export interface ArticleLink {
  label: string;
  url: string;
}

export interface ArticleSection {
  heading: string;
  paragraphs: string[];
  links?: ArticleLink[];
}

export interface Article {
  id: string;
  // Stable public URL; changing it after publication would break incoming links.
  path: string;
  title: string;
  date: string;
  type: ArticleType;
  description: string;
  summary: string;
  content: {
    introduction: string;
    sections: ArticleSection[];
  };
  published: boolean;
  show_in_findings: boolean;
  related_gap_ids: string[];
  related_location_ids: string[];
}
