# Senest & Senest-Admin — Agent Instructions

## LOYIHA HAQIDA
Senest — O'zbekiston ko'chmas mulk platformasi.
- senest (asosiy): foydalanuvchi platformasi
- senest-admin: moderator panel
- Target: 10K e'lon, 50K user, 500K tashrif (6 oy)

## TECH STACK
- Next.js 14.2.18 (App Router)
- TypeScript 5 (strict, any taqiqlangan)
- Prisma 5.18 + Supabase PostgreSQL (pooler + `DIRECT_URL`)
- Tailwind 4 + shadcn/ui
- next-auth v4 (JWT)

## KOD STANDARTLARI
- camelCase (variables), PascalCase (components), kebab-case (files)
- Komponent ≤ 150 qator
- Funksiya ≤ 50 qator
- Izohlar ingliz, UI o'zbek
- any taqiqlangan

## ARXITEKTURA
- ISR: / = 60s, /listings = static, /listing/[id] = dynamic
- Cache: system font (next/font yo'q)
- Images: Uploadthing (next/image ga o'tish T4)

## MA'LUMOTLAR BAZASI
- `prisma/schema.prisma` — faqat lead tasdiqi bilan
- Har bir `WHERE` / `JOIN` / `ORDER BY` ustuni indekslangan bo'lishi kerak
- Barcha so'rovlar `@/lib/prisma` singleton orqali (yangi `PrismaClient` yaratilmaydi)
- Ro'yxat so'rovlari har doim paginated (`take` + `skip`/cursor), cheksiz `findMany` yo'q
- `select` bilan aniq ustunlar; API javobida xom Prisma entity qaytarilmaydi (DTO mapping)
- `updateMany` / `deleteMany` da `where` majburiy; bulk update'da `updatedAt: new Date()` qo'lda
- `$transaction` ichida tashqi HTTP/email chaqiruvi qilinmaydi (5s timeout)
- Migratsiya: lokalda `migrate dev`, staging/production'da faqat `migrate deploy`
- Supabase: pooler `:6543` + `pgbouncer=true`, to'g'ridan-to'g'ri ulanish `DIRECT_URL` (`:5432`)
- RLS faol bo'lsa, policy ustunlari indekslanadi; `(SELECT auth.uid())` pattern ishlatiladi

## AUTH
- Server tomonda `getServerSession(authOptions)`; client tomonda `useSession()`
- Protected API route'lar avval session'ni tekshiradi, keyin authorization (role/owner)
- `NEXT_PUBLIC_*` ga faqat ommaviy kalitlar; `SUPABASE_SERVICE_ROLE_KEY` server-only
- Session token `localStorage`da saqlanmaydi — httpOnly cookie (next-auth)
- next-auth config va `middleware.ts` auth logikasi — tegmaslik kerak

## API VA SERVER ACTION
- Har bir endpoint input'ni Zod bilan validatsiya qiladi (`src/lib/schemas.ts`)
- Yagona javob formati: `{ success: true, data }` yoki `{ success: false, error, code? }`
- Xato javobida stack trace, SQL xatosi yoki secret ko'rsatilmaydi
- `"use server"` funksiyalar API route kabi qabul qilinadi: auth + validation + authorization
- Har bir POST/PATCH/DELETE uchun rate limiting (middleware)

## RENDER VA PERFORMANCE
- Default — Server Component; `"use client"` faqat state/effect/browser API uchun
- Client boundary daraxtning pastki qismida; Prisma/secret client modulga import qilinmaydi
- Rasmlar `next/image` + `fill` + `sizes`; remote hostlar `next.config.js` da allowlist
- Mustaqil `await`lar `Promise.all` bilan parallel; ketma-ket waterfall yo'q
- `React.cache()` — bir so'rov ichida takroriy DB so'rovlarini dedup qilish uchun
- Og'ir komponentlar `next/dynamic`; barrel import o'rniga to'g'ridan-to'g'ri import
- Uzoq ro'yxatlar (50+) uchun virtualizatsiya yoki pagination
- Polling: NotificationBell 60s, MessagesClient 40s — cleanup majburiy

## XAVFSIZLIK
- Zod validation — barcha API
- next-auth JWT — session
- Prisma ORM — SQL injection yo'q
- Rate limiting (T1)
- `dangerouslySetInnerHTML` faqat sanitizatsiya bilan; user URL'larda `javascript:`/`data:` bloklanadi
- `target="_blank"` — `rel="noopener noreferrer"` bilan
- Commit oldidan: hardcoded secret, `console.log`, ochiq token yo'qligi tekshiriladi

## ENV
- `.env` / `.env.local` commit qilinmaydi; namuna — `.env.example`
- Majburiy: `DATABASE_URL`, `DIRECT_URL`, `NEXTAUTH_SECRET`, `NEXTAUTH_URL`
- Client-side: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Env yo'q bo'lsa ilova aniq xato beradi (jimgina ishlamay qolmaydi)

## TEKSHIRUV
- `npm run verify` — `tsc --noEmit && npm run build` (commit oldidan majburiy)
- `npm run build` — Prisma generate + production build
- `npm run seed` — test e'lonlari (4 ta ACTIVE listing)
- Yangi kod uchun lint xatolari tuzatiladi; mavjud legacy lint xatolari alohida hal qilinadi

## AGENT SOZLAMALARI
- `.opencode/skills/prisma-patterns/` — Prisma/Supabase query, migratsiya, pool patternlari
- `.opencode/skills/react-performance/` — RSC, waterfall, bundle, re-render qoidalari
- `.opencode/agent/database-reviewer.md` — DB/schema/query review (subagent)
- `.opencode/agent/react-reviewer.md` — React/RSC/a11y review (subagent)
- Ushbu agentlar faqat review qiladi (edit yo'q); topilmalar `file:line` bilan beriladi

## TEGMASLIK KERAK
- prisma/schema.prisma (lead tasdiqisiz)
- vercel.json (crons)
- next-auth config
- middleware auth logic

## GIT
- Branch: main, dev, feature/*
- Commit: Conventional Commits
- PR: dev → main

## HISOBOT
- Nima o'zgardi
- Qaysi fayllar
- Build holati
- Commit hash

## MULOQOT QOIDALARI (MAJBURIY)

1. **Chat javoblari** — barcha javoblar chatda ko'rsatiladi
2. **Fayl yozish** — faqat foydalanuvchi aniq so'raganda ("faylga saqla", "yozib qo'y")
3. **Kod yozish** — kod chatda ham, faylga ham (ikkalasida)
4. **Hisobot** — qisqa xulosa chatda, batafsil faylga (agar kerak)
5. **Hech qachon** — "yozdim" deb javob berma, o'rniga matnni ko'rsat

### Noto'g'ri:
> "README.md ga yozdim"

### To'g'ri:
> "Mana README.md mazmuni:
>
> # Senest
> ...
>
> Faylni saqlashimni xohlasangiz, ayting."
