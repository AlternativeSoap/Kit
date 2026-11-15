# Kit

Search-first toolkit for everyday calculations and utilities. Open a tool, get an answer, move on. Built for Danish and English, runs locally in the browser when it can, and keeps personal data on the device.

**Live idea:** type what you need, pick a Kit tool or Instant Answer, and continue from there.

## Features

- **Search-first home** with Instant Answers and ranked tools
- **Built-in calculators** for freight, pay, dates, math, network, text, and more
- **Loading meter (advanced)** with top-down trailer planning, load order, auto-rotate, and waste
- **Library** page to browse Kit tools and linked sites
- **English and Danish**, with locale remembered locally
- **Local-first** preferences, recent tools, and shortcuts (no account required)

## Stack

- [Next.js](https://nextjs.org/) 16 (App Router)
- React 19
- TypeScript
- Tailwind CSS 4
- Vitest for selected unit checks

## Requirements

- Node.js 20+ recommended
- npm

## Setup

```bash
git clone https://github.com/AlternativeSoap/Kit.git
cd Kit
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run dev` | Start the development server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |
| `npm test` | Run Vitest |
| `npm run check:answers` | Smoke Instant Answers |
| `npm run check:search` | Smoke search ranking |
| `npm run check:formulas` | Smoke calculator formulas |

## Project layout

```
src/
  app/           # Routes, layout, energy API
  components/    # Search, library, tool chrome
  i18n/          # EN/DA dictionaries and locale helpers
  lib/           # Search, Instant Answers, formatting, energy
  tools/         # Tool registry and builtin tools
```

Notable tools live under `src/tools/builtin/`, including `ladmeter` (simple + advanced load planner) and `braendstof` (fuel/EV cost with live spot power).

## Language

Kit defaults from the browser language and a stored preference (`kit:locale`). UI copy ships in English and Danish.

## Privacy

Calculations and personal settings are intended to stay in the browser. Spot electricity prices are fetched through Kit’s own API route from Energi Data Service. Fuel pump prices are linked to external boards because there is no free hourly feed.

## Deploy

Any host that supports Next.js works. Example with Vercel:

```bash
npm run build
```

Set the project root to this repository and use the default Next.js build settings.

## License

Private project unless otherwise stated by the repository owner.
