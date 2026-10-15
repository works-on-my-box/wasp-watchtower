# Watchtower

A small website change monitor built with [Wasp](https://wasp.sh) 0.25. A logged-in user adds URLs, a recurring PgBoss job fetches each page, hashes its visible text and records a check, and the dashboard lists the sites and the latest checks.

This is the sample app for a "How to" tutorial about Wasp jobs, auth and email alerts. Work in progress.

## What works now

- Username and password auth with the generated Login and Signup forms; the dashboard requires auth.
- `Site` and `Check` entities (`schema.prisma`).
- `getSites` query and `addSite` action (`src/operations.ts`).
- `checkSites` job on PgBoss, every 10 minutes (`src/jobs.ts`): sha256 of the stripped page text, status `ok`, `changed` or `error`.
- Email sender set to `Dummy`, which prints emails to the server console.

## Not done yet

- An email when a page changes (Resend in production).
- Check history per site.
- Deploy.

## Run locally

You need Node.js 24, the Wasp CLI 0.25 and PostgreSQL.

```sh
npm install -g @wasp.sh/wasp-cli@latest
# if your npm blocks install scripts, the binary never downloads; then use:
# npm install -g --allow-scripts=@wasp.sh/wasp-cli @wasp.sh/wasp-cli@latest

# an existing Postgres (or run `wasp start db`, which needs Docker)
echo 'DATABASE_URL=postgresql://user:password@localhost:5432/watchtower' > .env.server

wasp db migrate-dev
wasp start
```

Open http://localhost:3000, sign up and add a URL. The job writes the first check within 10 minutes.
