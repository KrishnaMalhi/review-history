# ReviewHistory

> Pakistan's community-driven trust and review platform.
> Review landlords, doctors, mechanics, shops and any local entity.
> Warn your community. Make informed decisions.

**Tagline:** *"ReviewHistory — جاننا آپ کا حق ہے"* (Knowing is Your Right)

---

## 📚 Documentation

All project documentation is in the [`docs/`](./docs/) folder.

## 🛠️ Tech Stack
- **Web:** Next.js 14 (App Router) + Tailwind CSS
- **Mobile:** React Native + Expo
- **Backend:** NestJS + Express
- **Database:** PostgreSQL + Prisma ORM
- **Auth:** Phone OTP (SMS) + JWT
- **Storage:** Cloudinary
- **Monorepo:** Turborepo + pnpm workspaces

## 🚀 Quick Start

```bash
# Prerequisites: Node 20+, pnpm 9+, PostgreSQL
git clone https://github.com/KrishnaMalhi/review-history
cd review-history
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm db:seed
pnpm dev
```

## 📄 License
MIT