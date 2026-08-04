# WristWatch.uz — Sayt

Katalog + Telegram orqali buyurtma, admin panel, 3 til (UZ/RU/EN), Supabase + Netlify.

## 🔗 Ikkita link

- **Mijozlar uchun:** `https://sizning-domeningiz.netlify.app/`
- **Admin uchun:** `https://sizning-domeningiz.netlify.app/admin`

Ikkalasi ham bitta saytda — faqat `/admin` yo'li himoyalangan va faqat login qilgan admin kira oladi.

---

## 1-qadam — Supabase sozlash

1. [supabase.com](https://supabase.com) da yangi loyiha yarating.
2. Chap menyudan **SQL Editor** ga o'ting, `supabase/schema.sql` faylining barcha kodini nusxalab, **Run** tugmasini bosing. Bu `products` va `orders` jadvallarini, xavfsizlik siyosatlarini (RLS) va 3 ta namuna mahsulotni yaratadi.
3. **Authentication → Users** bo'limiga o'ting → **Add user** → o'zingiz uchun email va parol kiriting. Shu email/parol bilan `/admin` sahifasiga kirasiz.
4. **Project Settings → API** bo'limidan quyidagilarni nusxalab oling:
   - `Project URL` → bu `VITE_SUPABASE_URL`
   - `anon public` key → bu `VITE_SUPABASE_ANON_KEY`

## 2-qadam — Telegram bot sozlash

1. Botingiz (`@wristwatchuz_bot`) allaqachon bor. Agar tokeningiz bo'lmasa, Telegram'da **@BotFather** ga `/mybots` yozib, botingizni tanlab, **API Token** ni oling.
2. Xabarlar qaysi chat'ga borishini bilish uchun **chat_id** kerak:
   - Botingizga birinchi marta `/start` deb yozing (shaxsiy chatdan yoki guruhdan).
   - Brauzerda oching: `https://api.telegram.org/bot<TOKEN>/getUpdates`
   - Javobdagi `"chat":{"id": ...}` qatoridagi raqam — bu sizning `TELEGRAM_CHAT_ID`.

⚠️ **Tokenni hech qachon kodga yozmang yoki hech kimga yubormang** — faqat quyidagi Netlify muhit o'zgaruvchilariga kiritiladi.

## 3-qadam — Netlify'ga deploy qilish

1. Bu loyihani GitHub'ga yuklang (yoki papkani to'g'ridan-to'g'ri Netlify'ga tashlang — "Deploy manually").
2. [netlify.com](https://netlify.com) da **Add new site → Import an existing project** orqali repo'ni ulang.
3. Build sozlamalari avtomatik olinadi (`netlify.toml` fayli bor):
   - Build command: `npm run build`
   - Publish directory: `dist`
4. **Site settings → Environment variables** bo'limiga quyidagilarni qo'shing:

   | Nomi | Qiymati |
   |---|---|
   | `VITE_SUPABASE_URL` | Supabase Project URL |
   | `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
   | `TELEGRAM_BOT_TOKEN` | Bot tokeningiz |
   | `TELEGRAM_CHAT_ID` | Xabar boradigan chat ID |

5. **Deploy site** tugmasini bosing. Bir necha daqiqadan so'ng sayt tayyor bo'ladi.

## 4-qadam — Sinab ko'rish

- Asosiy link orqali saytga kiring — logo video ochilib, keyin saytga o'tadi.
- `/catalog` sahifasida namuna mahsulotlar ko'rinadi (Supabase'dan keladi).
- Bir mahsulotni ochib "Buyurtma berish" tugmasini bosing — ism/telefon kiriting — buyurtma yuborilgach, Telegram botingizga xabar kelishi kerak.
- `/admin` orqali kirib, mahsulot qo'shing/tahrirlang, buyurtmalarni va statistikani ko'ring.

## Lokal ishga tushirish (ixtiyoriy, test uchun)

```bash
npm install
cp .env.example .env   # va qiymatlarni to'ldiring
npm run dev
```

## Loyiha tuzilishi

```
src/
  components/   — Navbar, Footer, IntroLoader, ProductCard va h.k.
  pages/         — Home, Catalog, ProductDetail, Contact
  pages/admin/   — AdminLogin, AdminLayout, AdminProducts, AdminOrders, AdminStats
  i18n/          — UZ/RU/EN tarjimalar
  lib/           — Supabase klient va yordamchi funksiyalar
netlify/functions/notify-order.js  — Telegram xabarnomasini xavfsiz yuboradi
supabase/schema.sql                — Baza jadvallari va xavfsizlik siyosatlari
```

## Mahsulot qo'shish

100+ mahsulotni bitta-bitta chatga yozish shart emas — `/admin/products` orqali:
1. **+ Mahsulot qo'shish** tugmasini bosing
2. Nomi (uz/ru/en), narxi, kategoriyasi, tavsifi va rasm havolasini kiriting
3. **Saqlash** — mahsulot darhol katalogda ko'rinadi

Rasm uchun hozircha URL manzili kiritiladi (masalan Unsplash yoki o'zingizning hosting'ingizdagi rasm havolasi). Agar to'g'ridan-to'g'ri fayl yuklash funksiyasi kerak bo'lsa, buni keyingi bosqichda Supabase Storage orqali qo'shib beraman.
