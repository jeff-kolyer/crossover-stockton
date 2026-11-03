import uiCopy from "../data/pages/investigations/dogs/overview.json";
import { dogActivityQuestions } from "../data/dog-activity-questions";
import { HeadingGroup, Stack } from "./layout";

const uiText = uiCopy.InvestigationOverview;

export function InvestigationOverview() {
  return <>
    <HeadingGroup as="section" id="overview" className="investigation-activity-about" aria-labelledby="investigation-about-title">
      <h2 id="investigation-about-title">{uiText.aboutThisInvestigation}</h2>
      <p>{uiText.weReInvestigatingWhySoManyDogs}</p>
    </HeadingGroup>
    <Stack as="section" className="investigation-activity-overview" aria-labelledby="investigation-questions-title">
      <h2 id="investigation-questions-title">{uiText.questionsWeReAsking}</h2>
      <ol>
        {dogActivityQuestions.map((question) => <li key={question.id}>{question.title}</li>)}
      </ol>
    </Stack>
  </>;
}
