import uiCopy from "../ui/investigation.json";
import { siteModel } from "../model";
import { HeadingGroup, Stack } from "./layout";

const uiText = uiCopy.InvestigationOverview;
const investigation = siteModel.getInvestigation("street-dog-immediate-welfare");
const investigationObjectives = siteModel.getObjectives("street-dog-immediate-welfare");

export function InvestigationOverview() {
  return <>
    <HeadingGroup as="section" id="overview" className="investigation-activity-about" aria-labelledby="investigation-about-title">
      <h2 id="investigation-about-title">{uiText.aboutThisInvestigation}</h2>
      <p>{investigation?.primary_goal}</p>
    </HeadingGroup>
    <Stack as="section" className="investigation-activity-overview" aria-labelledby="investigation-objectives-title">
      <h2 id="investigation-objectives-title">{uiText.objectives}</h2>
      <ol>
        {investigationObjectives.map((objective) => <li key={objective.id}>{objective.title}</li>)}
      </ol>
    </Stack>
  </>;
}
