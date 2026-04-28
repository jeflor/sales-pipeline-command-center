# Sales Pipeline Command Center

A polished internal sales operations dashboard demo — pipeline visibility,
follow-up prioritization, and rep accountability for revenue teams.

**Live demo:** https://jeflor.github.io/sales-pipeline-command-center/

Built as a portfolio piece to demonstrate the kind of internal business
software that can be designed and shipped in close collaboration with Claude
Code + Cursor.

## What's inside

- **Dashboard** — KPI header, pipeline funnel, priority action queue,
  stale-deal watchlist, live activity stream, and a manager-only forecast +
  rep leaderboard view.
- **Pipeline** — Kanban board with stage-level value, urgency tags, and quick
  context per deal.
- **Lead detail drawer** — full contact + deal info, AI summary, scoring,
  activity history, tasks, and likely objections.
- **AI Sales Copilot** — slide-out assistant with quick actions (draft
  follow-up, summarize risk, suggest next move, re-engagement, history,
  objections) and a conversational composer.
- **Reports** — booked vs. target revenue, win rate by rep, pipeline by
  source, conversion by stage, lost-deal reasons, rep activity.
- **Tasks, Leads, Activity, Team, Settings** — supporting views with realistic
  filters, saved views, badges, empty states, and audit timestamps.
- **Role toggle** — switch between Sales Rep and Sales Manager perspectives;
  emphasis and filters meaningfully change.

## Stack

- Vite + React + TypeScript
- Tailwind CSS (custom enterprise palette)
- Recharts for charting
- Lucide for icons
- React Router (HashRouter, so the site works on GitHub Pages without
  server-side rewrites)
- 100% mock data, no backend

## Develop

```bash
npm install
npm run dev    # http://localhost:5173/sales-pipeline-command-center/
npm run build  # outputs dist/
```

Deployment is handled by `.github/workflows/deploy.yml` — every push to
`main` builds and ships to GitHub Pages.
