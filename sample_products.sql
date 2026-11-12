-- IXTIYORIY: bo'sh bazaga 3 ta namuna soat qo'shish. Faqat bir marta ishga tushiring.
-- (Haqiqiy mahsulotlarni admin paneldan rasm yuklab qo'shasiz — bu fayl shart emas.)
insert into public.products (name_uz, name_ru, name_en, description_uz, description_ru, description_en, price, category, image_url, featured)
values
  ('Aurum Classic', 'Aurum Classic', 'Aurum Classic',
   'Oltin rangli minimalist erkaklar soati, charm kamar bilan.',
   'Минималистичные мужские часы золотого цвета с кожаным ремешком.',
   'Minimalist men''s watch in gold tone with a leather strap.',
   890000, 'classic', 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=800', true),
  ('Noir Elegance', 'Noir Elegance', 'Noir Elegance',
   'Qora sirtli, oltin strelkali klassik soat.',
   'Классические часы с чёрным циферблатом и золотыми стрелками.',
   'Classic watch with black dial and gold hands.',
   1250000, 'classic', 'https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=800', true);
