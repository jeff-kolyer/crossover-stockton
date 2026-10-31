import articlesData from "../data/articles.json";
import type { Article } from "../types/article";

export const articles = articlesData as Article[];
export const publishedArticles = articles.filter((article) => article.published);
export const findingsArticles = publishedArticles.filter((article) => article.show_in_findings);

export function articleForPath(path: string) {
  return publishedArticles.find((article) => article.path === path);
}

export function articlesForGap(gapId: string) {
  return publishedArticles.filter((article) => article.related_gap_ids.includes(gapId));
}
