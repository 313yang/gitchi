# Gitchi — GitHub Tamagotchi Design Spec

**Date:** 2026-04-02  
**Status:** Approved

---

## Overview

Gitchi is a GitHub profile pet that lives in your README. It grows based on your commit activity, gets hungry when you stop coding, and dies if you abandon it too long. Other developers can add their own Gitchi with a single image URL.

```md
![My Gitchi](https://gitchi.vercel.app/api/pet?username=YOUR_USERNAME)
```

---

## Architecture

```
GitHub README
  └─ ![pet](https://gitchi.vercel.app/api/pet?username=rina)
          │
          ▼
   Vercel Serverless Function (/api/pet)
          │
          ├─ Vercel KV  ─── store registration date (first request)
          ├─ GitHub Public API ─── fetch contribution data
          └─ SVG renderer ─── return ASCII-art pixel SVG
```

- **No OAuth required** — uses GitHub Public API only
- **Stateless calculation** — all game state derived from GitHub data at request time
- **Minimal state** — only one timestamp per user stored in Vercel KV (registration date)

---

## Game Logic

### Hunger

- `hunger = max(0, min(100, commits_24h * 5) - hours_since_last_commit * 1)` (%)
- Each commit in the last 24h adds 5% (capped at 100%)
- Decays -1% per hour from the time of the most recent commit
- Example: 10 commits then 3 hours idle → `min(100, 50) - 3 = 47%`

### Growth Stage

Based on the number of days with at least one commit in the last 30 days, **counted from registration date**.

| Days with commits (last 30d) | Stage |
|---|---|
| 0–2 | Egg |
| 3–6 | Baby |
| 7–13 | Teen |
| 14+ | Adult |

- Not streak-based — missing a day does not reset progress
- Registration date stored in Vercel KV on first request, preventing instant adult status for existing GitHub users

### Status & Death

| Condition | State |
|---|---|
| hunger > 0% | Normal |
| hunger = 0%, last commit 4–14 days ago | Danger |
| last commit > 14 days ago | Dead |

- On death: pet shows dead state
- Revival: any new commit restarts from Egg stage

---

## Visual Design

### Style
- **ASCII art** rendered inside an SVG with a monospace pixel font
- **Black and white only** — no color
- **Retro terminal / LCD game aesthetic**
- All text in English

### SVG Structure
```
┌─────────────────────────┐
│  GITCHI                 │
│                         │
│      _,--._             │
│     ( ·  · )            │
│    /[______]\           │
│     ``    ``            │
│                         │
│  HUNGER  [████░░░░] 50% │
│  STAGE   TEEN           │
│  STREAK  12 days        │
└─────────────────────────┘
```

- Pet character changes appearance per stage (Egg / Baby / Teen / Adult / Dead)
- Hunger bar rendered as block characters (`█░`)
- Font: `Press Start 2P` or system monospace fallback

### Stage ASCII Sprites

**Egg**
```
  ,---.
 ( o o )
  `---'
```

**Baby**
```
   _,--._
  ( ·  · )
   `----'
```

**Teen**
```
   _,--._
  ( ·  · )
 /[______]\
  ``    ``
```

**Adult**
```
  __|__
 ( o o )
/|_____|\ 
  |   |
```

**Dead**
```
   _,--._
  ( x  x )
 /[______]\
  RIP   ;;
```

---

## API

### `GET /api/pet?username={username}`

Returns an SVG image.

| Param | Required | Description |
|---|---|---|
| `username` | yes | GitHub username |

**Response headers:**
```
Content-Type: image/svg+xml
Cache-Control: no-cache, max-age=3600
```

**First request behavior:**
- Checks Vercel KV for registration date
- If not found, stores today as `registered_at`
- All growth calculations use `registered_at` as the start date

---

## Data Sources (GitHub Public API)

| Data needed | Endpoint |
|---|---|
| Commits today | `GET /repos/{owner}/{repo}/commits` or GraphQL contributions |
| Days with commits (last 30d) | GitHub GraphQL `contributionCalendar` |
| Last commit date | GraphQL `contributionCalendar` |

Uses GitHub GraphQL API v4. The **service** uses a server-side GitHub token (stored as a Vercel env var) to call the API — users do not need to authenticate or provide any token.

---

## Tech Stack

| Layer | Choice |
|---|---|
| Runtime | Vercel Serverless Functions (Node.js) |
| State | Vercel KV (registration date only) |
| GitHub data | GitHub GraphQL API (public, no auth) |
| SVG rendering | String template (no external lib) |
| Font | Press Start 2P (Google Fonts embed in SVG) |

---

## Non-Goals

- No interactive buttons or clicks
- No OAuth / user login
- No per-repo tracking (uses total contribution data)
- No mobile app or standalone web UI
