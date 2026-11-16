# Crossover Stockton agent rules

The user should not have to find routine layout and regression bugs. For each UI change:

1. Inspect the existing markup, behavior, and data before editing. Keep changes focused and preserve controls and state handlers unless the request changes them.
2. Prefer changing `src/data/` for record or presentation content. Change layout code when the requested behavior or design requires it.
3. Run `npm run build` and `npm run test:ui`. Fix failures and rerun both before reporting completion.
4. Inspect the Playwright screenshots in `test-results/screenshots/` at 1440, 375, and 280 pixels for layout changes. Fix visible clipping, awkward wrapping, or missing content, then rerun the checks.
5. Report what was checked and any remaining limitation. A passing test is evidence for its specific assertions, not proof that every visual detail is correct.

Keep these UI elements unless the user directs otherwise: the investigation identity; Checked and Waiting counts; six navigation sections; the mobile report action; four baseline indicator cards with their source labels; and the Evidence Room record index. The navigation strip is intentionally scrollable on mobile, so each tab must be reachable without making the whole page scroll sideways.
