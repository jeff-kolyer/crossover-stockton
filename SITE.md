# Site Design Specs

## Home

`/` introduces Crossover with the exact question and paragraph authored in the feed. It has one main route into the active gap: `/street-dogs/overview/`. Keep the introduction distinct from the gap's evidence and ongoing work.

The home page spans the browser width and has no dark navigation rail. Its logo occupies the same top-left screen position as the gap rail logo; About stays at the top right. The photographic composition is quiet, with readable text on the left and the first-gap gateway visible on mobile.

## Gap navigation

The gap has a sticky, full-height dark left rail on desktop and a top-right full-page menu on mobile. Its sections are:

Overview · Activity · Tasks · Measurements · Findings · Organizations · Improvements · Places · Events · Sources.

The logo always returns to Crossover home. Use ordinary URLs without hash-route links.

## Gap overview

`/street-dogs/overview/` is the evidence-linked account. It begins with the gap name, the investigation status, the date of the last substantive recorded update, and a plain statement of current work. Figures, developments, findings, records, and caveats follow. Build or deploy dates are never presented as investigation updates.

## Contextual breadcrumbs

The reading hierarchy is Crossover → gap → section. Record breadcrumbs include the section from which the reader arrived when available. A record keeps one permanent URL.

## Feed

The feed orders Crossover introduction, gap, then About. The daily spoken reading uses continuous prose and keeps source attribution and limits. The site renders the same authored data.
