# WristWatch.uz — sayt

Katalog + buyurtma (Telegram'ga xabar), admin panel, 3 til (UZ / RU / EN).
**React + Vite + Tailwind** · baza: **Supabase** · hosting: **Netlify**

| Kim uchun | Havola |
|---|---|
| Mijozlar | `https://SAYTINGIZ.netlify.app/` |
| Admin | `https://SAYTINGIZ.netlify.app/admin` |

Admin sahifasiga faqat **admin huquqi bor** foydalanuvchi kira oladi (huquq bazada tekshiriladi).

## ⚠️ Eng muhim qoida
**Zip faylni Netlify'ga to'g'ridan-to'g'ri yuklamang.** Netlify saytni o'zi "quradi" — buning uchun kod **GitHub'da** turishi kerak. Zip'ni ochib (extract), ichidagi papkani GitHub'ga yuklang.

## 1-qadam — Supabase (bir marta; yangilanganda ham qayta Run qiling)
1. **SQL Editor** → `supabase/schema.sql` dagi **hamma matnni** joylashtiring → **Run**. Xato bermasligi kerak. Qayta-qayta ishga tushirish xavfsiz (ma'lumotlar o'chmaydi).
2. **Authentication → Users** da **faqat sizning hisobingiz** bo'lsin (admin shu). Yo'q bo'lsa: **Add user** (email + parol, "Auto Confirm User") — keyin 1-bandni qayta Run qiling.
3. **Authentication → Sign In / Providers** da **"Allow new users to sign up"** ni **o'chiring**.
4. (Ixtiyoriy) namuna soatlar: `supabase/sample_products.sql`.

## 2-qadam — GitHub
Eski fayllarni o'chiring → zip'ni oching → **Add file → Upload files** → `wristwatch-uz` **papkasini** bitta harakatda sudrab tashlang → **Commit changes**.

## 3-qadam — Netlify
**Build settings:** Base directory = `wristwatch-uz`, Build command = `npm run build`, Publish directory = `dist` (`netlify.toml` ustun turadi).

**Environment variables:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

Keyin **Deploys → Trigger deploy → Deploy project without cache**.

## 4-qadam — Telegram'ni tekshirish
1. Xabarni qabul qiladigan hisobdan botga (`@wristwatchuz_bot`) kirib **/start** bosing.
2. Oching: `https://SAYTINGIZ.netlify.app/.netlify/functions/notify-order?check=1` — `chat_reachable: true` bo'lishi kerak.
3. Saytdan sinov buyurtma bering — Telegram'ga xabar kelishi va `/admin → Buyurtmalar` da ko'rinishi kerak.

Chat ID topish: botga /start yozing, so'ng `https://api.telegram.org/bot<TOKEN>/getUpdates` ni oching, `"chat":{"id": ...}`.

## Admin panel
- **Statistika** — buyurtmalar, tushum (bajarilganlardan), 14 kunlik grafik, top mahsulotlar, hududlar.
- **Mahsulotlar** — qo'shish/tahrirlash/o'chirish/**nusxa**, **rasm yuklash** (avtomatik kichraytiriladi), "sotuvda yo'q", "bosh sahifada ko'rsatish".
  **Xususiyatlar** (brend, mexanizm, korpus, kamar, suv o'tkazmasligi, o'lcham, kafolat) — har bir soat uchun **o'zingiz haqiqiy ma'lumotni** kiritasiz; bo'sh qoldirilganlar saytda ko'rinmaydi.
- **Buyurtmalar** — mijoz, telefon, viloyat, manzil, izoh; holat: Yangi → Jarayonda → Bajarildi / Bekor; CSV yuklab olish.

Yangi admin qo'shish (Authentication → Users orqali foydalanuvchi yaratgach), SQL Editor'da:
```sql
insert into public.admins (user_id) select id from auth.users where email = 'yangi@admin.com' on conflict do nothing;
```

## Matnlarni o'zgartirish
Saytdagi barcha matnlar `src/i18n/locales/` ichida (`uz.json`, `ru.json`, `en.json`). Telefon va ijtimoiy tarmoq havolalari `src/lib/config.js` da.
**Diqqat:** saytga faqat tasdiqlangan ma'lumot yozing (masalan, "Swiss made", kafolat muddati, suv o'tkazmasligi) — buni har bir soat uchun admin paneldagi "Xususiyatlar"da kiriting.

## Xavfsizlik
- Bot tokeni faqat serverda (Netlify funksiyasi) — mijoz brauzeriga chiqmaydi.
- Mijoz buyurtma **yarata oladi**, lekin hech narsani **o'qiy olmaydi**. Narx va nom serverda bazadan to'ldiriladi.
- Mahsulot, buyurtma va rasmlarni faqat `admins` jadvalidagi foydalanuvchi o'zgartira oladi.
- Spam himoyasi: yashirin tuzoq, so'rovlar tezligi cheklovi, uzunlik cheklovlari.
- Sarlavhalar (`X-Frame-Options`, `nosniff`, `Referrer-Policy`); admin qidiruvdan yashirilgan.

## Tuzilishi
```
src/pages/           Bosh sahifa, Katalog, Mahsulot, Biz haqimizda, Aloqa, 404
src/pages/admin/     Login, Statistika, Mahsulotlar, Buyurtmalar
src/components/      Kirish, parda animatsiyasi, jonli soat, scroll-animatsiya (kadrlar ketma-ketligi)
src/i18n/locales/    uz.json · ru.json · en.json
netlify/functions/   notify-order.mjs (Telegram, serverda)
supabase/            schema.sql · sample_products.sql
public/              intro.mp4 / intro-m.mp4 (kirish) · seq/ (scroll-animatsiya kadrlari) · og-image.jpg · logo
```
Lokal: `npm install` → `cp .env.example .env` → `npm run dev`.
