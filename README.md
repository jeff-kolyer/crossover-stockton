# Crossover Stockton

Crossover Stockton is a local civic-awareness project built around a simple idea:

**Pay attention to what is real.**

The site uses AI-assisted research to follow a limited set of Stockton organizations and public sources, helping maintain a current picture of:

* what needs attention,
* what is actually getting better,
* and what a person can do.

The goal is not to create more information. It is to make local reality easier to see and respond to.

Crossover organizes that picture into three main ideas:

* **Needs** show where reality is asking something of us.
* **Signs of Being** show what happens when people respond.
* **Actions** give people practical ways to participate.

The project is an experiment in using AI to reduce the distance between public information and meaningful human action. AI can watch sources, notice changes, and connect scattered information. The human part is still the important part: noticing, verifying, caring, and showing up.

## Site Architecture

Crossover Stockton is a Vite + React single-page app. The UI is organized around a small set of public-facing views, including:

* Home
* Needs / gap listings
* Signs of Being / stories
* Actions
* Organizations
* About
* Individual gap and story detail pages

The app currently uses local JSON files in `src/data/` as its content layer. These files define gaps, organizations, records, stories, and public actions.

React components import that data directly, transform it into view models, and render the site without a backend service.

### Main source structure

* `src/App.tsx` — top-level routing and application state
* `src/components/` — page-level and reusable React components
* `src/data/` — structured local content used by the site
* `src/lib/` — shared utilities for filtering, image preloading, scroll effects, and other helpers
* `src/types.ts` — shared TypeScript types for records, gaps, stories, organizations, tags, and actions
* `src/index.css` — site-wide styling
* `public/images/` — hero images, organization assets, logos, and page-specific imagery

Static assets are referenced with root-relative paths such as:

```text
/images/home/example.jpg
```

Files placed in `public/` are copied directly into the production build by Vite.

## Development

Install dependencies:

```bash
npm install
```

Start the local development server:

```bash
npm run dev
```

Create a production build:

```bash
npm run build
```

Preview the production build locally:

```bash
npm run preview
```

`npm run build` runs the TypeScript build checks and Vite production build. The generated static site is written to:

```text
dist/
```

## Publishing

The production site is hosted with GitHub Pages and deployed through GitHub Actions.

The main deployment flow is:

```text
edit
→ build
→ commit
→ push to main
→ GitHub Actions
→ GitHub Pages
```

The canonical public site is:

**https://crossoverstockton.org**

The project uses the custom domain directly, so Vite serves the application from the site root.

## Content Model

The site is intentionally simple at this stage.

Public content lives primarily in structured JSON rather than in a CMS or database. That keeps the content:

* easy to inspect,
* easy for humans or AI tools to update,
* versioned through Git,
* reviewable as normal code changes,
* and deployable as a fully static website.

Over time, parts of the research and update process may become more automated, but the public site is designed to remain understandable and inspectable.

## Philosophy

Crossover is built around the idea that information is useful only when it helps us reconnect with reality.

We spend much of our lives absorbed in thought, identity, distraction, and abstraction. Meanwhile, real needs, real people, and real opportunities to help remain directly in front of us.

Crossover is one small attempt to pay attention.

**Awareness. Connection. Care. Action.**

We are here to serve what is real.
