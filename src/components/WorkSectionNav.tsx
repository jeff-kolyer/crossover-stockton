import { useEffect, useId, useRef, useState } from "react";

export interface WorkSectionNavItem {
  id: string;
  label: string;
  description?: string;
}

export function navigateToWorkSection(id: string) {
  window.history.pushState({}, "", `#${id}`);
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function WorkSectionNav({ items, className }: { items: WorkSectionNavItem[]; className?: string }) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const [mobileOpen, setMobileOpen] = useState(false);
  const mobileLinksId = useId();
  const clickedId = useRef<string | null>(null);
  const clickedSectionReached = useRef(false);

  useEffect(() => {
    const sections = items.map(({ id }) => document.getElementById(id)).filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;
    let frame = 0;
    const updateActiveSection = () => {
      frame = 0;
      const clickedSection = sections.find((section) => section.id === clickedId.current);
      if (clickedSection) {
        const { top, bottom } = clickedSection.getBoundingClientRect();
        if (top < window.innerHeight && bottom > 74) {
          clickedSectionReached.current = true;
          return;
        }
        if (!clickedSectionReached.current) return;
        clickedId.current = null;
      }
      const threshold = Math.min(window.innerHeight * 0.4, 360);
      const atBottom = window.scrollY >= document.documentElement.scrollHeight - window.innerHeight - 2;
      const current = atBottom ? sections[sections.length - 1] : sections.filter((section) => section.getBoundingClientRect().top <= threshold).at(-1) ?? sections[0];
      setActiveId(current.id);
    };
    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveSection);
    };
    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [items]);

  useEffect(() => {
    let frame = 0;
    const scrollToHash = () => {
      const id = window.location.hash.slice(1);
      if (!items.some((item) => item.id === id)) return;
      clickedId.current = null;
      clickedSectionReached.current = false;
      setActiveId(id);
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
      });
    };
    scrollToHash();
    window.addEventListener("hashchange", scrollToHash);
    window.addEventListener("popstate", scrollToHash);
    return () => {
      window.removeEventListener("hashchange", scrollToHash);
      window.removeEventListener("popstate", scrollToHash);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [items]);

  const links = items.map(({ id, label, description }) => <a key={id} className={activeId === id ? "is-active" : undefined} href={`#${id}`} aria-current={activeId === id ? "location" : undefined} onClick={(event) => { event.preventDefault(); clickedId.current = id; clickedSectionReached.current = false; setActiveId(id); setMobileOpen(false); navigateToWorkSection(id); }}><span><span className="work-section-nav-label">{label}</span>{description && <small>{description}</small>}</span></a>);

  return <aside className={`work-section-nav${className ? ` ${className}` : ""}`}>
    <nav className="work-section-nav-desktop" aria-label="On this page"><h2>On this page</h2>{links}</nav>
    <div className="work-section-nav-mobile"><button type="button" aria-expanded={mobileOpen} aria-controls={mobileLinksId} onClick={() => setMobileOpen((open) => !open)}>On this page <span aria-hidden="true">{mobileOpen ? "−" : "+"}</span></button><nav id={mobileLinksId} aria-label="On this page" hidden={!mobileOpen}>{links}</nav></div>
  </aside>;
}
