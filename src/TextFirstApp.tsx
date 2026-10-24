import { useState } from "react";
import gapsData from "./data/gaps.json";
import actionsData from "./data/actions.json";
import orgsData from "./data/orgs.json";
import type { GapRecord, PublicActionRecord, OrgRecord } from "./types";
import "./text-first.css";

const gaps = (gapsData as GapRecord[]).filter(g => g.active).sort((a, b) => a.rank - b.rank);
const actions = (actionsData as PublicActionRecord[]).filter(a => a.active);
const orgs = orgsData as OrgRecord[];
const sections = [
  ["overview", "Overview"], ["key-factors", "Key factors"], ["ways-to-help", "Ways to help"],
  ["improvements", "Improvements"], ["our-findings", "Our findings"],
  ["research", "Research"], ["updates", "Updates"]
] as const;
const textLink = (path: string) => path + (path.includes("?") ? "&" : "?") + "text=1";
const gapLink = (slug: string, section = "overview") =>
  textLink("/reality/" + slug + "/" + (section === "overview" ? "" : section + "/"));
const isExternal = (url: string) => /^https?:\/\//i.test(url);

export default function TextFirstApp() {
  const [menu, setMenu] = useState(false);
  const pathname = window.location.pathname.replace(/\/+$/, "") || "/";
  const match = pathname.match(/^\/reality\/([^/]+)(?:\/(overview|key-factors|ways-to-help|improvements|our-findings|research|sources|updates))?$/);
  const gap = match ? gaps.find(g => g.slug === decodeURIComponent(match[1])) : undefined;
  const section = match?.[2] === "sources" ? "research" : match?.[2] || "overview";
  const [contentsOpen, setContentsOpen] = useState(false);
  const [observation, setObservation] = useState("sighting");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const gapIndex = gap ? gaps.findIndex(g => g.id === gap.id) : -1;
  const relatedActions = gap ? actions.filter(a => a.gap_ids?.includes(gap.id)) : [];
  const generalLinks = [
    ["/", "Home"], ["/reality/", "Needs"], ["/action/", "Activities"],
    ["/connection/", "Stories"], ["/updates/", "Updates"],
    ["/organizations/", "Organizations"], ["/about/", "About"]
  ];
  const actionUrl = (a: PublicActionRecord) => {
    const url = a.next_url || a.source_url || "/action/";
    return isExternal(url) ? url : textLink(url);
  };
  function saveNote() {
    const content = [
      "Crossover field observation — DRAFT (not submitted)",
      "Date: " + date, "General area: " + (area || "Not specified"),
      "Result: " + observation,
      "Notes: " + (notes || "None"),
      "Status: Unverified; no official report sent."
    ].join("\n");
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "crossover-observation-" + date + ".txt";
    link.click();
    URL.revokeObjectURL(url);
  }

  return <div className="text-first">
    <header>
      <a className="text-brand" href={textLink("/")}>CROSSOVER / STOCKTON</a>
      <button type="button" aria-expanded={menu} aria-controls="text-main-nav" onClick={() => setMenu(!menu)}>
        {menu ? "Close menu" : "Menu"}
      </button>
      <nav id="text-main-nav" hidden={!menu} aria-label="Site">
        {generalLinks.map(([url, label]) => <a key={url} href={textLink(url)}>{label}</a>)}
      </nav>
    </header>
    <main>
      {gap ? <>
        <p><a href={textLink("/reality/")}>← All needs</a></p>
        <nav aria-label="Choose a need" className="text-gap-nav">
          <a aria-label="Previous need" href={gapIndex > 0 ? gapLink(gaps[gapIndex - 1].slug) : undefined}
            className={gapIndex <= 0 ? "disabled" : ""}>← Previous</a>
          <label>Current need
            <select value={gap.slug} onChange={e => window.location.assign(gapLink(e.target.value))}>
              {gaps.map(g => <option value={g.slug} key={g.slug}>{g.title}</option>)}
            </select>
          </label>
          <a aria-label="Next need" href={gapIndex < gaps.length - 1 ? gapLink(gaps[gapIndex + 1].slug) : undefined}
            className={gapIndex >= gaps.length - 1 ? "disabled" : ""}>Next →</a>
        </nav>
        <p className="text-meta">NEED {gapIndex + 1} OF {gaps.length} · {gap.investigation_status}</p>
        <nav aria-label="Explore this need" className="text-section-nav">
          <label>Explore this need
            <select value={section} onChange={e => window.location.assign(gapLink(gap.slug, e.target.value))}>
              {sections.filter(([id]) => id !== "our-findings" || gap.investigation_status === "investigating").map(([id, label]) =>
                <option key={id} value={id}>{label}</option>)}
            </select>
          </label>
        </nav>
        <nav aria-label="On this page" className="text-toc">
          <button aria-expanded={contentsOpen} type="button" onClick={() => setContentsOpen(!contentsOpen)}>On this page {contentsOpen ? "−" : "+"}</button>
          {contentsOpen && <div><a href="#summary">Summary</a><a href="#details">Details</a><a href="#next-steps">Next steps</a></div>}
        </nav>
        <h1 id="summary">{section === "overview" ? gap.title : sections.find(([id]) => id === section)?.[1]}</h1>
        {section === "overview" && <p>{gap.summary}</p>}
        {section === "key-factors" && <p>What may contribute to this need. These are factors to investigate, not confirmed causal weights.</p>}
        {section === "ways-to-help" && <p>Specific activities and existing routes to participation. Check availability before relying on any route.</p>}
        {section === "improvements" && <p>Potential improvements require testing before their effects can be claimed.</p>}
        {section === "our-findings" && <p>Observations, attempts, and unanswered questions must remain distinct from confirmed outcomes.</p>}
        {section === "research" && <p>Public sources provide evidence, not necessarily confirmation of present-day conditions.</p>}
        {section === "updates" && <p>Visit the existing updates record for dated reporting.</p>}
        <section id="details">
          <h2>Details</h2>
          {(section === "overview" || section === "key-factors") && <>
            <h3>What we are seeing</h3>
            <ul>{(gap.what_we_are_seeing || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
            <h3>Contributing factors</h3>
            <ul>{(gap.contributing_factors || []).map((x, i) => <li key={i}>{x}</li>)}</ul>
          </>}
          {(section === "overview" || section === "ways-to-help") && <>
            <h3>Available activity listings</h3>
            {relatedActions.length ? <ul>{relatedActions.map(a => <li key={a.id}>
              <strong>{a.title}</strong> — {a.summary}
              {a.availability_status && <span> ({a.availability_status})</span>}
              {" "}<a href={actionUrl(a)}>More information</a>
            </li>)}</ul> : <p>No activities listed yet.</p>}
          </>}
          {section === "research" && <ul>{gap.sources.map((s, i) =>
            <li key={i}><a href={s.url} target="_blank" rel="noreferrer">{s.title}</a>{s.publisher ? " — " + s.publisher : ""}</li>)}</ul>}
          {(section === "overview" || section === "our-findings" || section === "improvements") &&
            <p><a href={textLink("/updates/")}>Read dated updates</a> · <a href={textLink("/action/")}>Find activities</a></p>}
          {section === "updates" && <p><a href={textLink("/updates/")}>All project updates</a></p>}
          <p><a href={window.location.pathname}>Open the full original research interface</a> (including maps and interactive models)</p>
        </section>
        <section id="next-steps">
          <h2>Next steps</h2>
          <p><a href={textLink("/action/")}>Find a way to help</a></p>
          {gapIndex >= 0 && <p><a href={gapLink(gaps[(gapIndex + 1) % gaps.length].slug)}>Explore another need →</a></p>}
        </section>
      </> : pathname === "/reality" ? <>
        <h1>Needs in Stockton</h1>
        <p>AI surfaced potential gaps. Most have not yet been independently investigated.</p>
        <ul>{gaps.map(g => <li key={g.id}>
          <a href={gapLink(g.slug)}><strong>{g.title}</strong></a> — {g.investigation_status}
          <p>{g.summary}</p>
        </li>)}</ul>
      </> : pathname === "/action" ? <>
        <h1>Find something good to do</h1>
        <p>Activities include investigation and participation routes; current availability is not always verified.</p>
        <p><a href="#spot-dogs">Start dog spotting ↓</a></p>
        <section id="spot-dogs">
          <h2>Dog spotting — field note</h2>
          <p>Observe only from a safe distance. Do not chase or handle unfamiliar dogs. Use official reporting channels for urgent concerns. This note is not sent to Animal Services or Crossover.</p>
          <label>Observation result<select value={observation} onChange={e => setObservation(e.target.value)}>
            <option value="sighting">Saw a dog</option><option value="none">No dogs observed</option><option value="unsafe">Unable to assess safely</option>
          </select></label>
          <label>Date<input type="date" value={date} onChange={e => setDate(e.target.value)}/></label>
          <label>General area (do not include sensitive precise locations)<input value={area} onChange={e => setArea(e.target.value)}/></label>
          <label>What happened?<textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4}/></label>
          <button type="button" onClick={saveNote}>Download field note</button>
        </section>
        <h2>Other activities</h2>
        <ul>{actions.map(a => <li key={a.id}><strong>{a.title}</strong> — {a.summary}{" "}
          <a href={actionUrl(a)}>More information</a></li>)}</ul>
      </> : pathname === "/organizations" ? <>
        <h1>Organizations</h1>
        <ul>{orgs.filter(o => o.active).map(o => <li key={o.id}>
          <strong>{o.name}</strong> — {o.summary}
          {o.website && <> <a href={o.website}>Website</a></>}</li>)}</ul>
      </> : pathname === "/about" ? <>
        <h1>About Crossover</h1>
        <p>Crossover connects people who want to do good with the good that needs doing.</p>
        <p>We are starting in Stockton, investigating unmet needs and testing what actually helps.</p>
        <p><a href={textLink("/reality/")}>Explore needs</a> · <a href={textLink("/action/")}>Find an activity</a></p>
        <p><a href="/about/">Full original About page</a></p>
      </> : pathname === "/updates" || pathname === "/connection" ? <>
        <h1>{pathname === "/updates" ? "Updates" : "Stories"}</h1>
        <p>These archives are available in the original presentation while we move their records into the text-first interface.</p>
        <p><a href={pathname + "/"}>Open complete archive</a></p>
      </> : <>
        <h1>Connect people who want to do good with the good that needs doing.</h1>
        <p>Crossover investigates unmet needs, identifies practical ways to help, and records what actually happens. We are starting in Stockton.</p>
        <h2>Start here</h2>
        <ul><li><a href={textLink("/action/") + "#spot-dogs"}>Go dog spotting and record what happened</a></li>
          <li><a href={textLink("/reality/")}>Explore needs</a></li>
          <li><a href={gapLink(gaps[0].slug)}>Current investigation: {gaps[0].title}</a></li></ul>
      </>}
    </main>
    <footer><p>Crossover Stockton · <a href={window.location.pathname}>Original presentation</a></p></footer>
  </div>;
}
