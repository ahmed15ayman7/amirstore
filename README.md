# Amir Store — Next.js + Prisma

The original single-file design (`index.html`) ported 1:1 to **Next.js 16 (App Router)** + **Prisma 7 (PostgreSQL)**:
same CSS, the same animations (loader, three.js 3D coins, marquee, reveal-on-scroll, 3D tilt cards, coin burst, snow, bracket, chatbot…).

## Running it

```bash
npm install
cp .env.example .env    # put your Postgres DATABASE_URL here (e.g. Neon)
npx prisma db push      # creates the tables
npm run db:seed         # seeds prices, services and FAQ
npm run dev             # http://localhost:3000
```

## Deploying to Vercel
1. In the Vercel project: **Storage → Create Database → Neon (Postgres)** and connect it. This adds `DATABASE_URL` automatically.
2. In **Settings → Environment Variables**, add `AUTH_SECRET` (a long random string), and optionally:
   - `PROMO_CODE` + `PROMO_PERCENT` (e.g. `AMIR10` / `10`): a discount code customers type in the cart. It applies to **base prices and player bundles only**, never to offers. The code itself never reaches the browser.
   - `OFFER_ENDS_AT` (e.g. `2026-12-01T23:59:00+02:00`): shows a countdown above the offers. Remove it when there is no end date.
3. Redeploy. The `vercel-build` script runs `prisma db push` and then `seed.ts --sync`.

## Changing prices
Edit the lists in `prisma/seed.ts`, **bump `CATALOG_VERSION`**, then push. The next deploy rewrites the price list. Accounts and orders are never touched. Product kinds: `offer` (current discounts), `base` (regular prices), `bundle` (player + coins).

## Structure

| Path | Contents |
|---|---|
| `app/globals.css` | All the design's CSS, unchanged |
| `app/page.tsx` | Server component: reads data from the DB and passes it to the UI |
| `components/sections.tsx` | Nav, Hero, Services, Prices, Tournament, Partners, About, FAQ, Contact, Footer |
| `components/Hero3D.tsx` | The three.js scene (three@0.128, the version the design used) |
| `components/CartDrawer.tsx` | Cart + sending the order on WhatsApp + saving it in the DB |
| `components/AuthModal.tsx` | Register / login / "my account" + orders |
| `components/ChatBot.tsx` | The assistant (edit the answers in `BOT_KB`) |
| `prisma/schema.prisma` | User, Platform, Product, Service, Faq, Order, OrderItem |
| `prisma/seed.ts` | All prices and data from the design |
| `app/api/*` | `auth/register`, `auth/login`, `auth/logout`, `auth/me`, `orders` |

## Data notes
- **Prices** live in the DB (`Product` table). Edit them with `npx prisma studio` or in `seed.ts`, then run `npm run db:seed` again.
- **Accounts**: passwords are hashed with bcrypt, and the session is an HMAC-signed httpOnly cookie.
- **Orders**: when the customer clicks "Send order on WhatsApp", the order is saved in the DB. The server recalculates every price from the DB and never trusts prices sent by the browser.
- **Hero video**: put a `hero.mp4` file in `public/` and it plays automatically. If the file isn't there, the video is hidden, same as in the design.
