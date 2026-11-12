-- =====================================================================
--  WristWatch.uz — Supabase sxemasi (v2, xavfsiz)
--  Supabase > SQL Editor ga to'liq nusxalab, "Run" tugmasini bosing.
--  Bu faylni qayta-qayta ishga tushirish XAVFSIZ (mavjud ma'lumotlar o'chmaydi).
-- =====================================================================

create extension if not exists "uuid-ossp";

-- ---------- MAHSULOTLAR ----------
create table if not exists public.products (
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
alter table public.products add column if not exists featured boolean default false;
-- Xususiyatlar: admin har bir soat uchun O'ZI haqiqiy ma'lumotni kiritadi (ixtiyoriy)
alter table public.products add column if not exists brand text;
alter table public.products add column if not exists movement text;
alter table public.products add column if not exists case_material text;
alter table public.products add column if not exists strap text;
alter table public.products add column if not exists water_resistance text;
alter table public.products add column if not exists case_size text;
alter table public.products add column if not exists warranty text;

-- ---------- BUYURTMALAR ----------
create table if not exists public.orders (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid references public.products(id) on delete set null,
  product_name text,
  product_price numeric,
  customer_name text,
  customer_phone text,
  status text default 'new',          -- new | processing | done | cancelled
  created_at timestamptz default now()
);
alter table public.orders add column if not exists customer_region text;
alter table public.orders add column if not exists customer_address text;
alter table public.orders add column if not exists comment text;

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists products_category_idx on public.products (category);

-- ---------- ADMINLAR ----------
-- Faqat shu jadvaldagi foydalanuvchilar admin hisoblanadi.
-- (Faqat "login qilgan" bo'lish yetarli EMAS — bu eng muhim xavfsizlik qatlami.)
create table if not exists public.admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now()
);
alter table public.admins enable row level security;   -- siyosat yo'q = API orqali hech kim o'qiy/yoza olmaydi

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (select 1 from public.admins where user_id = auth.uid());
$$;
revoke all on function public.is_admin() from public;
grant execute on function public.is_admin() to anon, authenticated;

-- Hozir Authentication > Users ro'yxatida mavjud foydalanuvchilar admin qilinadi.
-- (Faqat o'zingiz yaratgan hisob bo'lishi kerak. Tekshirib ko'ring!)
insert into public.admins (user_id)
select id from auth.users
on conflict (user_id) do nothing;

-- Keyinchalik yangi admin qo'shish kerak bo'lsa (emailni almashtiring):
--   insert into public.admins (user_id) select id from auth.users where email = 'yangi@admin.com' on conflict do nothing;

-- ---------- BUYURTMA: narx/nomni serverda to'ldirish ----------
-- Mijoz yuborgan narxga ishonilmaydi: mahsulot nomi va narxi bazadan olinadi.
create or replace function public.orders_before_insert()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  p_name text;
  p_price numeric;
begin
  if new.product_id is not null then
    select name_uz, price into p_name, p_price from public.products where id = new.product_id;
    if found then
      new.product_name := p_name;
      new.product_price := p_price;
    end if;
  end if;
  new.status := coalesce(new.status, 'new');
  return new;
end;
$$;

drop trigger if exists orders_before_insert on public.orders;
create trigger orders_before_insert
  before insert on public.orders
  for each row execute function public.orders_before_insert();

-- ---------- XAVFSIZLIK SIYOSATLARI (RLS) ----------
alter table public.products enable row level security;
alter table public.orders enable row level security;

-- eski siyosatlarni tozalash
drop policy if exists "Public can read products" on public.products;
drop policy if exists "Authenticated can insert products" on public.products;
drop policy if exists "Authenticated can update products" on public.products;
drop policy if exists "Authenticated can delete products" on public.products;
drop policy if exists "Public can insert orders" on public.orders;
drop policy if exists "Authenticated can insert orders" on public.orders;
drop policy if exists "Authenticated can read orders" on public.orders;
drop policy if exists "Authenticated can update orders" on public.orders;
drop policy if exists "Authenticated can delete orders" on public.orders;
drop policy if exists products_read_all on public.products;
drop policy if exists products_admin_insert on public.products;
drop policy if exists products_admin_update on public.products;
drop policy if exists products_admin_delete on public.products;
drop policy if exists orders_public_insert on public.orders;
drop policy if exists orders_admin_select on public.orders;
drop policy if exists orders_admin_update on public.orders;
drop policy if exists orders_admin_delete on public.orders;

-- Mahsulotlar: hamma ko'ra oladi, faqat admin o'zgartiradi
create policy products_read_all on public.products
  for select using (true);
create policy products_admin_insert on public.products
  for insert to authenticated with check (public.is_admin());
create policy products_admin_update on public.products
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy products_admin_delete on public.products
  for delete to authenticated using (public.is_admin());

-- Buyurtmalar: mijoz faqat YARATA oladi (o'qiy olmaydi), faqat admin ko'radi va boshqaradi
create policy orders_public_insert on public.orders
  for insert to anon, authenticated
  with check (
    status = 'new'
    and customer_name is not null and char_length(customer_name) between 2 and 100
    and customer_phone is not null and char_length(customer_phone) between 7 and 20
    and (customer_region is null or char_length(customer_region) <= 100)
    and (customer_address is null or char_length(customer_address) <= 300)
    and (comment is null or char_length(comment) <= 500)
  );
create policy orders_admin_select on public.orders
  for select to authenticated using (public.is_admin());
create policy orders_admin_update on public.orders
  for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy orders_admin_delete on public.orders
  for delete to authenticated using (public.is_admin());

-- ---------- RASMLAR UCHUN OMBOR (Storage) ----------
insert into storage.buckets (id, name, public)
values ('products', 'products', true)
on conflict (id) do update set public = true;

drop policy if exists products_bucket_admin_insert on storage.objects;
drop policy if exists products_bucket_admin_update on storage.objects;
drop policy if exists products_bucket_admin_delete on storage.objects;

create policy products_bucket_admin_insert on storage.objects
  for insert to authenticated with check (bucket_id = 'products' and public.is_admin());
create policy products_bucket_admin_update on storage.objects
  for update to authenticated using (bucket_id = 'products' and public.is_admin());
create policy products_bucket_admin_delete on storage.objects
  for delete to authenticated using (bucket_id = 'products' and public.is_admin());

-- ---------- Avval qo'shilgan namuna mahsulotning buzuq rasmini tuzatish ----------
update public.products
set image_url = 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800'
where image_url like '%0b5b6e6b6b6b%';
