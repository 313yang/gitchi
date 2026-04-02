# Gitchi 🐱

A GitHub profile pet that grows as you commit.

## Usage

Add this to your GitHub profile README:

```md
![Gitchi](https://gitchi.vercel.app/api/pet?username=YOUR_USERNAME)
```

Replace `YOUR_USERNAME` with your GitHub username. Your Gitchi appears automatically on first visit.

## How it works

| Activity | Effect |
|---|---|
| Commit today | +5% hunger (max 100%) |
| No commits | -1% hunger/hour |
| Commit regularly | Pet grows through stages |
| 14 days no commit | Pet dies 💀 |
| New commit after death | Revive from Egg |

## Stages

Growth is based on how many days in the last 30 days (since you added Gitchi) had at least one commit.

| Days active (last 30d) | Stage |
|---|---|
| 0–2 | 🥚 Egg |
| 3–6 | 🐱 Baby |
| 7–13 | 😸 Teen |
| 14+ | 😺 Adult |

## Deploy your own

1. Clone this repo
2. Deploy to [Vercel](https://vercel.com)
3. Add a `GITHUB_TOKEN` env var (needs `read:user` scope)
4. Add Vercel KV to your project in the Vercel dashboard
5. Share your URL: `https://your-app.vercel.app/api/pet?username=YOU`
