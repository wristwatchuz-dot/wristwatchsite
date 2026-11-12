import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const isSupabaseConfigured = Boolean(url && anonKey)

if (!isSupabaseConfigured) {
  console.warn(
    "[WristWatch.uz] VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY sozlanmagan. Netlify > Environment variables bo'limini tekshiring."
  )
}

// Agar kalitlar yo'q bo'lsa ham sayt "oq ekran" bo'lib qolmasligi uchun vaqtinchalik qiymat ishlatiladi.
export const supabase = createClient(
  url || 'https://placeholder.supabase.co',
  anonKey || 'placeholder-anon-key'
)
