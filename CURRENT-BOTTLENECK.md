# Current bottleneck: waiting on the backend

_Opened 2026-10-21. Update this file after every attempt. When resolved, delete it, remove the Open issue line from `CLAUDE.md`, and log the fix in `CHANGELOG.md`._

## Status

The storefront is **deployed and online** at
https://babunest-frontend-production.up.railway.app. Home, shop and contact
return 200 with the BabuNest title, logo and favicon.

It **shows no products, categories or home sections**, because the backend
(https://babunest-backend-production.up.railway.app) is down. Every request
returns 500 and its latest build fails on Railway.

There is nothing to fix in this repo. The cause and the next steps are in the
backend repo's `CURRENT-BOTTLENECK.md` (`babunest-backend`).

## When the backend is live

1. **Redeploy this service on Railway.** Pages built while the backend was down are cached empty; they refill within 60 seconds of a request, and a redeploy refreshes them immediately.
2. **Check that it works:** products show on `/` and `/shop`, add to cart updates the header count, and a test order reaches the admin. If the cart fails, check the backend's `STOREFRONT_URL`. It must be exactly `https://babunest-frontend-production.up.railway.app` until the custom domain is connected.
3. **Then delete this file**, as the note at the top says.

## Railway variables (this service)

- `NEXT_PUBLIC_PAYLOAD_URL=https://babunest-backend-production.up.railway.app`
- `NEXT_PUBLIC_SITE_URL=https://babunest-frontend-production.up.railway.app`

Both are baked in at build time, so a change needs a redeploy. Switch them to
`https://api.babunest.com` and `https://babunest.com` when the domain is
connected.
