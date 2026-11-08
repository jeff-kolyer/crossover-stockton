# Site Design Specs

## Home and Overview

`/` is the living Overview for the active street-dogs work. It opens with the current focus, a dated narrative account, and a listen control that reads the same narrative text shown on the page. The supporting evidence and record workspace follow the account. `/street-dogs/overview/` remains a readable alias with `/` as its canonical URL.

The Crossover name and guiding idea remain in the site identity; About provides the broader context. The logo returns to the Overview.

## Gap navigation

The gap has a sticky, full-height beige left rail on desktop and a top-right full-page menu on mobile. Its sections are:

Overview · Activity · Actions · Measurements · Findings · Organizations · Improvements · Places · Events · Sources. Actions is the display name for canonical task records at `/street-dogs/tasks/`.

The logo always returns to the Overview. Use ordinary URLs without hash-route links.

Feed and About sit at the bottom of the desktop rail, with Feed above About. The mobile menu includes both links below the section list.

## Gap overview

The Overview opens with the dated narrative account, then shows the current focus, three questions, attributed figures, actual recent activity, open questions, and links into the record workspace. The listen control reads the visible narrative paragraphs. Its update date is editorial data in the feed; build or deploy dates are never presented as investigation updates.

Section lists draw their rows and counts from the public records JSON. Filters use the statuses or record kinds actually present in each section. Every row links to a permanent record page with source and limitation details.

## Contextual breadcrumbs

The Overview has no breadcrumb. Record pages show Overview → Data Record, and the feed shows Overview → Feed. Overview links to `/`. A record keeps one permanent URL.

## Feed

The feed has one curated reading order drawn from the Crossover introduction, current gap, and About. `/feed/` uses the regular site shell and reading column. Its text version at `/feed.txt` uses the same selected passages and records, with source attribution and limits. The site renders the same authored data.
