import { dogActivityQuestions } from "../data/dog-activity-questions";

export function InvestigationOverview() {
  return <>
    <section id="overview" className="investigation-activity-about" aria-labelledby="investigation-about-title">
      <h2 id="investigation-about-title">About this investigation</h2>
      <p>We're investigating why so many dogs are on the streets in Stockton, what care is already in place, where the system breaks down, and how emerging technology can help.</p>
    </section>
    <section className="investigation-activity-overview" aria-labelledby="investigation-questions-title">
      <h2 id="investigation-questions-title">Questions we're asking</h2>
      <ol>
        {dogActivityQuestions.map((question) => <li key={question.id}>{question.title}</li>)}
      </ol>
    </section>
  </>;
}
