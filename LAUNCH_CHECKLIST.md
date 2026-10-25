# Public Launch Checklist

## Infratuzilma
- [ ] Supabase PostgreSQL production bazasi tayyor va ulanish ishlayapti
- [ ] Supabase PgBouncer pooler `connection_limit=20` bilan sozlangan
- [ ] Upstash Redis production REST URL va token bilan sozlangan
- [ ] Vercel production deployment muvaffaqiyatli
- [ ] Vercel Domains’da production domen biriktirilgan va DNS tekshirilgan

## Xavfsizlik
- [ ] `NEXTAUTH_SECRET` production uchun kuchli, tasodifiy qiymat bilan sozlangan
- [ ] `NEXTAUTH_URL` production domeniga mos
- [ ] Sentry client/server DSN sozlangan va test hodisasi ko‘rinadi
- [ ] Rate limiting production Upstash Redis bilan ishlaydi
- [ ] Admin sahifalari va himoyalangan API’larda Admin Role tekshiruvi sinovdan o‘tgan
- [ ] Production environment o‘zgaruvchilari `node scripts/check-prod-env.js` bilan tekshirilgan

## Integratsiyalar
- [ ] Telegram Bot tokeni va chat ID production’da sozlangan
- [ ] Telegram webhook production URL va secret token bilan o‘rnatilgan
- [ ] Telegram webhook callback orqali e’lonni tasdiqlash/rad etish sinovdan o‘tgan
- [ ] Google Gemini API kaliti sozlangan va Smart Fill/AI tahriri sinovdan o‘tgan

## Funksionallik
- [ ] Yangi e’lonni barcha majburiy ma’lumotlar bilan yaratish sinovdan o‘tgan
- [ ] AI generator to‘g‘ri o‘zbekcha sarlavha va tavsif qaytaradi
- [ ] Admin moderatsiyasi ACTIVE/REJECTED holatlarini to‘g‘ri yangilaydi
- [ ] JPG, PNG va WEBP rasmlar yuklanishi, preview va o‘chirish tekshirilgan
- [ ] Mobil qurilmada e’lon joylash jarayoni sinovdan o‘tgan
- [ ] `/api/health` production’da sog‘lom DB/Redis holatini qaytaradi

## SEO va Meta
- [ ] E’lon slug’lari noyob va canonical URL’larda ishlaydi
- [ ] `/sitemap.xml` production domeni va e’lon URL’larini qaytaradi
- [ ] `/robots.txt` ishlab chiqarish muhiti uchun to‘g‘ri sozlangan
- [ ] Asosiy sahifa va e’lon sahifalarida title, description va Open Graph metadata mavjud
