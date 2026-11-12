import { motion } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'
import { BRAND } from '../lib/config'

export default function Contact() {
  const { t } = useLang()

  const items = [
    { key: 'telegram_bot', value: BRAND.telegramBotHandle, href: BRAND.telegramBot, icon: '✈', primary: true },
    { key: 'phone', value: BRAND.phoneDisplay, href: `tel:${BRAND.phone}`, icon: '☎' },
    { key: 'telegram_channel', value: BRAND.telegramChannelHandle, href: BRAND.telegramChannel, icon: '✉' },
    { key: 'instagram', value: BRAND.instagramHandle, href: BRAND.instagram, icon: '◎' },
    { key: 'youtube', value: BRAND.youtubeHandle, href: BRAND.youtube, icon: '▶' },
  ]

  return (
    <div className="mx-auto max-w-3xl px-5 pb-24 pt-32 text-center sm:px-8 sm:pt-40">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
        <h1 className="mb-3 font-display text-4xl sm:text-6xl">{t('contact.title')}</h1>
        <p className="mb-16 text-ink/50">{t('contact.subtitle')}</p>
      </motion.div>

      <div className="flex flex-col gap-4">
        {items.map((c, i) => (
          <motion.a
            key={c.key}
            href={c.href}
            target={c.key === 'phone' ? undefined : '_blank'}
            rel="noreferrer"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            whileHover={{ x: 6 }}
            className={`group flex items-center justify-between rounded-2xl border px-6 py-5 transition-colors duration-300 ${
              c.primary ? 'border-gold bg-gold/5' : 'border-ink/10 hover:border-gold'
            }`}
          >
            <span className="flex items-center gap-4">
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-ink text-lg text-gold-light">{c.icon}</span>
              <span className="text-left">
                <span className="block text-xs uppercase tracking-widest2 text-ink/40">{t(`contact.${c.key}`)}</span>
                <span className="block font-display text-lg sm:text-xl">{c.value}</span>
              </span>
            </span>
            <span className="text-gold-dark transition-transform duration-300 group-hover:translate-x-1">→</span>
          </motion.a>
        ))}
      </div>

      <p className="mt-16 text-sm text-ink/40">{t('contact.form_note')}</p>
    </div>
  )
}
