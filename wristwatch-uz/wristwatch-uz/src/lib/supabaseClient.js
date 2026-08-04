import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!url || !anonKey) {
  console.warn(
    '[WristWatch.uz] Supabase muhit o\'zgaruvchilari topilmadi. .env faylida VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY ni sozlang.'
  )
}

export const supabase = createClient(url || '', anonKey || '')
