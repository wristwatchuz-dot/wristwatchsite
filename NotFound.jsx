import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'

export default function NotFound() {
  const { t } = useLang()
  return (
    <div className="mx-auto flex min-h-[80vh] max-w-2xl flex-col items-center justify-center px-5 pt-24 text-center">
      <motion.p
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="gold-gradient-text animate-shimmer mb-4 font-display text-8xl sm:text-9xl"
      >
        404
      </motion.p>
      <h1 className="mb-3 font-display text-3xl">{t('notfound.title')}</h1>
      <p className="mb-8 text-ink/55">{t('notfound.text')}</p>
      <Link to="/" className="rounded-full bg-ink px-8 py-3.5 text-sm uppercase tracking-widest2 text-ivory transition-colors duration-500 hover:bg-gold-dark">
        {t('notfound.home')}
      </Link>
    </div>
  )
}
