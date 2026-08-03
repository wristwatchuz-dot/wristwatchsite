import { motion } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'

const CONTACTS = [
  { key: 'phone', value: '+998 33 231 11 01', href: 'tel:+998332311101', icon: '📞' },
  { key: 'telegram_channel', value: '@wristwatchuzbb', href: 'https://t.me/wristwatchuzbb', icon: '✈️' },
  { key: 'telegram_bot', value: '@wristwatchuz_bot', href: 'https://t.me/wristwatchuz_bot', icon: '🤖' },
  { key: 'instagram', value: '@wristwatch__uz', href: 'https://www.instagram.com/wristwatch__uz/', icon: '📷' },
  { key: 'youtube', value: '@WRISTWATCHUZ', href: 'https://youtube.com/@WRISTWATCHUZ', icon: '▶️' },
]

export default function Contact() {
  const { t } = useLang()

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 pt-32 sm:pt-40 pb-24 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <h1 className="font-display text-4xl sm:text-5xl mb-3">{t('contact.title')}</h1>
        <p className="text-ink/50 mb-16">{t('contact.subtitle')}</p>
      </motion.div>

      <div className="flex flex-col gap-4">
        {CONTACTS.map((c, i) => (
          <motion.a
            key={c.key}
            href={c.href}
            target={c.key === 'phone' ? undefined : '_blank'}
            rel="noreferrer"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            className="group flex items-center justify-between px-6 py-5 rounded-2xl border border-ink/10 hover:border-gold transition-colors duration-400"
          >
            <span className="flex items-center gap-4">
              <span className="text-xl">{c.icon}</span>
              <span className="text-left">
                <span className="block text-xs uppercase tracking-widest2 text-ink/40">{t(`contact.${c.key}`)}</span>
                <span className="block font-display text-lg">{c.value}</span>
              </span>
            </span>
            <span className="text-gold-dark opacity-0 group-hover:opacity-100 transition-opacity duration-300">→</span>
          </motion.a>
        ))}
      </div>

      <p className="mt-16 text-sm text-ink/40">{t('contact.form_note')}</p>
    </div>
  )
}
