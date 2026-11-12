import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLang } from '../../i18n/index.jsx'
import { supabase } from '../../lib/supabaseClient'
import { useAdminSession, useNoIndex } from '../../lib/useAdminSession'
import logo from '../../assets/logo.png'

export default function AdminLogin() {
  useNoIndex()
  const { t } = useLang()
  const { loading, session, isAdmin } = useAdminSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  if (!loading && session && isAdmin) return <Navigate to="/admin/dashboard" replace />

  async function handleSubmit(e) {
    e.preventDefault()
    setBusy(true)
    setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    if (err) {
      setError(t('admin.login_error'))
      setBusy(false)
      // Taxminiy parol tanlashga qarshi kichik kechikish
      return
    }
    // Muvaffaqiyatli: useAdminSession admin huquqini tekshiradi va yuqoridagi <Navigate> ishga tushadi
    setTimeout(() => setBusy(false), 1500)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink px-5">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }} className="w-full max-w-sm">
        {session && !loading && !isAdmin ? (
          <div className="rounded-2xl border border-ivory/10 bg-graphite/60 p-8 text-center backdrop-blur-md">
            <h1 className="mb-3 font-display text-2xl text-ivory">{t('admin.no_access')}</h1>
            <p className="mb-6 text-sm leading-relaxed text-ivory/60">{t('admin.no_access_text')}</p>
            <button onClick={() => supabase.auth.signOut()} className="rounded-full border border-ivory/30 px-6 py-2.5 text-sm text-ivory hover:border-gold-light hover:text-gold-light">
              {t('admin.logout')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="rounded-2xl border border-ivory/10 bg-graphite/60 p-8 backdrop-blur-md">
            <div className="mb-8 flex flex-col items-center">
              <img src={logo} alt="" className="mb-3 h-12 w-12 object-contain" />
              <h1 className="font-display text-2xl text-ivory">{t('admin.login_title')}</h1>
            </div>
            <div className="flex flex-col gap-4">
              <input required type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('admin.email')} className="rounded-xl border border-ivory/15 bg-ivory/5 px-4 py-3 text-ivory outline-none focus:border-gold" />
              <input required type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('admin.password')} className="rounded-xl border border-ivory/15 bg-ivory/5 px-4 py-3 text-ivory outline-none focus:border-gold" />
              {error && <p className="text-sm text-red-400">{error}</p>}
              <button type="submit" disabled={busy || loading} className="mt-2 rounded-xl bg-gold py-3 text-sm uppercase tracking-widest2 text-ink transition-colors hover:bg-gold-light disabled:opacity-50">
                {busy ? '...' : t('admin.login')}
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  )
}
