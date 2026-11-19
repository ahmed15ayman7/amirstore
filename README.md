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
2. In **Settings → Environment Variables**, add `AUTH_SECRET` (a long random string).
3. Redeploy. The `vercel-build` script runs `prisma db push` and seeds the data the first time only (`--if-empty`).

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
