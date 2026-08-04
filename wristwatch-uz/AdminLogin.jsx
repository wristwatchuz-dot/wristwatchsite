import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLang } from '../../i18n/index.jsx'
import { supabase } from '../../lib/supabaseClient'
import logo from '../../assets/logo.png'

export default function AdminLogin() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(t('admin.login_error'))
      return
    }
    navigate('/admin/dashboard')
  }

  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-5">
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-sm bg-graphite/60 border border-ivory/10 rounded-2xl p-8 backdrop-blur-md"
      >
        <div className="flex flex-col items-center mb-8">
          <img src={logo} alt="logo" className="h-12 w-12 object-contain mb-3" />
          <h1 className="font-display text-2xl text-ivory">{t('admin.login_title')}</h1>
        </div>

        <div className="flex flex-col gap-4">
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t('admin.email')}
            className="px-4 py-3 rounded-xl bg-ivory/5 border border-ivory/15 text-ivory focus:border-gold outline-none"
          />
          <input
            required
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t('admin.password')}
            className="px-4 py-3 rounded-xl bg-ivory/5 border border-ivory/15 text-ivory focus:border-gold outline-none"
          />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="mt-2 bg-gold text-ink hover:bg-gold-light transition-colors duration-400 py-3 rounded-xl tracking-widest2 uppercase text-sm disabled:opacity-50"
          >
            {loading ? '...' : t('admin.login')}
          </button>
        </div>
      </motion.form>
    </div>
  )
}
