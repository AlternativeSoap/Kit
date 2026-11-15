# Kit — full implementation plan

Product: search for what you need. Kit opens an integrated tool or a clear external site.
Homepage stays one search field. English default, Danish available, auto-detect language.

## Rules for every delivery

A tool or catalog batch is **done** only when all of these are true:

1. Registered in `src/tools/registry.ts` or `src/catalog/web.ts` with name, description, aliases, intents, popularity, surface.
2. EN + DA copy in `src/i18n/dictionaries/` (and types if new UI strings).
3. Builtin tools live under `src/tools/builtin/<id>/` with pure calc helpers where possible.
4. Route works: `/t/<slug>` opens the tool; search finds it via aliases/intents.
5. UI matches Kit style (off-white, olive accent, no card clutter, clear labels).
6. Happy path tested in the browser (search → open → use → sensible result).
7. No half features: if a control is shown, it must work. If law/edge cases are out of scope, say so in a short disclaimer.
8. Lint/build must pass after each delivery.

Out of scope for this plan: login, sync, AI chat, Google scrape, admin CMS, PWA, payment.

---

## Phase 1 — Everyday coverage (build in this order)

### 1. VAT / Moms calculator — `/t/moms`

- Inputs: amount, mode (add VAT / remove VAT), rate default 25%, optional custom rate.
- Outputs: net, VAT amount, gross. Copy-friendly numbers.
- Aliases/intents: `moms`, `vat`, `mva`, `25%`.

### 2. Percentage calculator — `/t/procent`

- Modes: “X% of Y”, “change from A to B”, “what % is A of B”.
- Clear result labels. No finance jargon.
- Aliases: `procent`, `percent`, `rabat`, `markup`.

### 3. Password generator — `/t/password`

- Length, toggles: uppercase, lowercase, numbers, symbols.
- Generate + copy button. Client-side only.
- Aliases: `password`, `kodeord`, `password generator`.

### 4. Unit converter — `/t/enheder`

- Categories: length, weight, volume, temperature.
- From/to unit selects + value. Live conversion.
- Aliases: `omregn`, `convert`, `enheder`, `kg`, `cm`.

### 5. Date / business days — `/t/dato`

- Days between two dates.
- Add/subtract N calendar or business days (Mon–Fri).
- Aliases: `dato`, `date`, `arbejdsdage`, `business days`.

### 6. Parental leave planner — `/t/barsel`

- Start date + duration in weeks (or end date).
- Shows end date, week count, visual month calendar with **ISO week numbers**.
- Marked range, clear start/end.
- Disclaimer: planning aid only, not legal leave advice.
- Aliases: `barsel`, `barselsorlov`, `orlov`, `parental leave`, `maternity`.

### 7. Web catalog batch

Add curated externals (intents + aliases + popularity) for:

- Work: Google Docs, Sheets, Drive, Notion, Outlook/Office
- DK: borger.dk, e-Boks, Rejseplanen, DSB
- Create: Canva, DeepL
- Dev-light: GitHub, Stack Overflow

No new UI chrome. Confirm page already exists for externals.

---

## Phase 2 — Search quality (after Phase 1)

1. Ranking pass: kit before web on ties; short-query noise stays controlled.
2. Empty state: recent + curated Kit tools only (not a wall of web links).
3. Copy-to-clipboard on results that benefit (password, moms, procent).
4. Fix any dead/wrong matches found while testing Phase 1 search terms.

Done when top everyday queries (`moms`, `procent`, `password`, `dato`, `barsel`, `docs`, `borger`, `ai`) land on a sensible first result.

---

## Phase 3 — One deep track (optional)

Pick **one** after Phase 1–2 feel solid:

- **DK calculate:** improve salary (holiday pay / hour↔month clarity), optional fuel/km cost  
  **or**
- **Production:** stopwatch + splits next to countdown/takt  
  **or**
- **Freight:** extend loading meter (weight/volume helpers)

Do not start three niches at once.

---

## Existing tools (keep, do not rewrite unless broken)

- `/t/lon` — Salary calculator  
- `/t/ladmeter` — Loading meter (unit **ldm**); advanced trailer planner  
  - Overflow alert must be **clearly yellow** (background, border, triangle)  
  - Show which lines/pieces do not fit; mark them on the load list  
  - Global **Fix it / Ret det** reduces quantities to what fits  

- `/t/lommeregner` — Calculator  
- `/t/countdown` — Countdown & takt  
- Web catalog: AI, social, Gmail, Maps, Translate, Wikipedia, SKAT, Nationalbanken  

---

## Execution order checklist

- [x] 1 Moms  
- [x] 2 Procent  
- [x] 3 Password  
- [x] 4 Enheder  
- [x] 5 Dato  
- [x] 6 Barsel  
- [x] 7 Web catalog batch  
- [x] Phase 2 polish (curated empty-state, copy on key results, search aliases/intents in place)  
- [ ] Phase 3 (optional, choose one)
