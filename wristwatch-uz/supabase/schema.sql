-- WristWatch.uz — Supabase sxemasi
-- Buni Supabase Dashboard > SQL Editor ichiga kiritib ishga tushiring.

create extension if not exists "uuid-ossp";

-- ============ PRODUCTS ============
create table if not exists products (
  id uuid primary key default uuid_generate_v4(),
  name_uz text not null,
  name_ru text,
  name_en text,
  description_uz text,
  description_ru text,
  description_en text,
  price numeric not null default 0,
  category text default 'classic',
  image_url text,
  in_stock boolean default true,
  created_at timestamptz default now()
);

-- ============ ORDERS ============
create table if not exists orders (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references products(id) on delete set null,
  product_name text,
  product_price numeric,
  customer_name text,
  customer_phone text,
  status text default 'new', -- 'new' | 'done'
  created_at timestamptz default now()
);

-- ============ ROW LEVEL SECURITY ============
alter table products enable row level security;
alter table orders enable row level security;

-- Hamma (mijozlar) mahsulotlarni faqat o'qiy oladi
create policy "Public can read products"
  on products for select
  using ( true );

-- Faqat tizimga kirgan admin (authenticated) mahsulot qo'sha/tahrirlay/o'chira oladi
create policy "Authenticated can insert products"
  on products for insert
  to authenticated
  with check ( true );

create policy "Authenticated can update products"
  on products for update
  to authenticated
  using ( true );

create policy "Authenticated can delete products"
  on products for delete
  to authenticated
  using ( true );

-- Mijozlar (anon) faqat buyurtma yarata oladi, o'qiy olmaydi
create policy "Public can insert orders"
  on orders for insert
  to anon
  with check ( true );

create policy "Authenticated can insert orders"
  on orders for insert
  to authenticated
  with check ( true );

-- Faqat admin (authenticated) buyurtmalarni ko'ra oladi
create policy "Authenticated can read orders"
  on orders for select
  to authenticated
  using ( true );

create policy "Authenticated can update orders"
  on orders for update
  to authenticated
  using ( true );

create policy "Authenticated can delete orders"
  on orders for delete
  to authenticated
  using ( true );

-- ============ NAMUNA MAHSULOTLAR ============
insert into products (name_uz, name_ru, name_en, description_uz, description_ru, description_en, price, category, image_url)
values
  ('Aurum Classic', 'Aurum Classic', 'Aurum Classic', 'Oltin rangli minimalist erkaklar soati, charm kamar bilan.', 'Минималистичные мужские часы золотого цвета с кожаным ремешком.', 'Minimalist men''s watch in gold tone with a leather strap.', 890000, 'classic', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800'),
  ('Noir Elegance', 'Noir Elegance', 'Noir Elegance', 'Qora sirtli, oltin strelkali klassik soat.', 'Классические часы с чёрным циферблатом и золотыми стрелками.', 'Classic watch with black dial and gold hands.', 1250000, 'classic', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800'),
  ('Sport Steel', 'Sport Steel', 'Sport Steel', 'Zanglamaydigan po''latdan sport uslubidagi soat.', 'Спортивные часы из нержавеющей стали.', 'Sport-style stainless steel watch.', 760000, 'sport', 'https://images.unsplash.com/photo-1461038960941-0b5b6e6b6b6b?w=800');
