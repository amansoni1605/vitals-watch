# VitalsWatch

> Automated Core Web Vitals monitoring — scheduled Lighthouse CI audits, trend charts, and Slack regression alerts.

Built by [Aman Soni](https://github.com/amansoni1605) · [Portfolio](https://github.com/amansoni1605/portfolio)

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router) |
| Audits | Lighthouse CI |
| CI/CD | GitHub Actions |
| Database | PostgreSQL |
| Charts | Recharts |
| Alerts | Slack Incoming Webhooks |
| Styling | Tailwind CSS v4 |

## Features

- **Scheduled audits** — GitHub Actions runs Lighthouse CI on a cron schedule
- **5 Web Vitals tracked** — LCP, CLS, INP, FID, TTFB per URL
- **Trend charts** — Recharts line charts showing score history
- **Regression alerts** — Slack message with delta + badge when score drops
- **Multi-URL** — Monitor unlimited URLs, per-page breakdown
- **CI/CD gate** — Fail pull requests when Core Web Vitals regress

## Getting Started

```bash
npm install
cp .env.example .env.local
# Fill in: DATABASE_URL, SLACK_WEBHOOK_URL, AUDIT_SECRET

npm run dev
```

## GitHub Actions Setup

Add these secrets to your repository:
- `DATABASE_URL` — PostgreSQL connection string
- `SLACK_WEBHOOK_URL` — Slack incoming webhook URL
- `AUDIT_SECRET` — Secret for the audit trigger endpoint

The workflow in `.github/workflows/vitals.yml` runs every 6 hours and on every PR.

## Architecture

```
src/
├── app/
│   ├── dashboard/              # Vitals overview page
│   ├── sites/[id]/             # Per-site trend charts
│   └── api/
│       ├── audit/route.ts      # POST /api/audit — trigger audit
│       └── results/route.ts    # GET /api/results — fetch history
├── components/
│   ├── VitalsChart.tsx         # Recharts trend chart per metric
│   ├── ScoreBadge.tsx          # Green/amber/red score badge
│   └── RegressionAlert.tsx     # Alert card for score drops
├── lib/
│   ├── lighthouse.ts           # Lighthouse CI runner
│   ├── slack.ts                # Slack webhook helper
│   └── db.ts                   # PostgreSQL client
└── .github/
    └── workflows/
        └── vitals.yml          # Scheduled + PR audit workflow
```

## License

MIT
