import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Havola ulashilganda (Telegram, Instagram...) rasm chiqishi uchun sayt manzili kerak.
// Netlify build paytida `URL` o'zgaruvchisini o'zi beradi. Bo'lmasa, manzilga bog'liq teglar olib tashlanadi.
function socialMeta() {
  return {
    name: 'ww-social-meta',
    transformIndexHtml(html) {
      const base = (process.env.URL || process.env.SITE_URL || '').replace(/\/$/, '')
      if (!base) return html.replace(/\s*<meta [^>]*__SITE_URL__[^>]*>/g, '')
      return html.split('__SITE_URL__').join(base)
    },
  }
}

export default defineConfig({
  plugins: [react(), socialMeta()],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // Kutubxonalar alohida fayllarga ajratiladi — sayt tezroq yuklanadi va keshlanadi
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          motion: ['framer-motion'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
})
