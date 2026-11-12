import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'
import { supabase } from '../lib/supabaseClient'
import { BRAND } from '../lib/config'
import ProductCard from '../components/ProductCard.jsx'
import ScrollSequence from '../components/ScrollSequence.jsx'
import LiveClock from '../components/LiveClock.jsx'
import Marquee from '../components/Marquee.jsx'

const EASE = [0.16, 1, 0.3, 1]

export default function Home() {
  const { t } = useLang()
  const [featured, setFeatured] = useState([])
  const heroRef = useRef(null)

  const { scrollYProgress } = useScroll({ target: heroRef, offset: ['start start', 'end start'] })
  const textY = useTransform(scrollYProgress, [0, 1], [0, 110])
  const clockY = useTransform(scrollYProgress, [0, 1], [0, -70])
  const heroFade = useTransform(scrollYProgress, [0, 0.75], [1, 0])

  useEffect(() => {
    let active = true
    async function load() {
      // `featured` ustuni bo'lmasa (SQL hali ishga tushirilmagan bo'lsa) oddiy so'rovga o'tamiz
      let res = await supabase
        .from('products')
        .select('*')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(4)
      if (res.error) {
        res = await supabase.from('products').select('*').order('created_at', { ascending: false }).limit(4)
      }
      if (active && res.data) setFeatured(res.data)
    }
    load()
    return () => {
      active = false
    }
  }, [])

  const titleLines = String(t('hero.title')).split('\n')

  return (
    <div>
      {/* ============ HERO ============ */}
      <section ref={heroRef} className="relative flex min-h-[100svh] items-center overflow-hidden bg-ivory px-5 pb-20 pt-28 sm:px-8">
        <div className="pointer-events-none absolute inset-0 opacity-[0.08]">
          <div
            className="absolute inset-0"
            style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, #B08D57 1px, transparent 0)', backgroundSize: '32px 32px' }}
          />
        </div>
        <motion.div
          className="pointer-events-none absolute -right-32 top-10 h-[560px] w-[560px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(176,141,87,0.22) 0%, transparent 68%)' }}
          animate={{ scale: [1, 1.12, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        />
        <motion.div
          className="pointer-events-none absolute -bottom-40 -left-32 h-[480px] w-[480px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,180,131,0.2) 0%, transparent 70%)' }}
          animate={{ scale: [1.1, 1, 1.1] }}
          transition={{ duration: 11, repeat: Infinity, ease: 'easeInOut' }}
        />

        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:gap-6">
          <motion.div style={{ y: textY, opacity: heroFade }} className="order-2 text-center lg:order-1 lg:text-left">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="mb-6 flex items-center justify-center gap-4 lg:justify-start"
            >
              <span className="h-px w-10 bg-gold" />
              <span className="text-xs uppercase tracking-widest2 text-gold-dark sm:text-sm">{t('hero.eyebrow')}</span>
            </motion.div>

            <h1 className="font-display text-[2.7rem] leading-[1.04] sm:text-6xl xl:text-7xl">
              {titleLines.map((line, i) => (
                <span key={i} className="-mb-2 block overflow-hidden pb-2">
                  <motion.span
                    className={`block ${i === titleLines.length - 1 ? 'gold-gradient-text animate-shimmer' : ''}`}
                    initial={{ y: '115%' }}
                    animate={{ y: 0 }}
                    transition={{ duration: 1.05, delay: 0.25 + i * 0.18, ease: EASE }}
                  >
                    {line}
                  </motion.span>
                </span>
              ))}
            </h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.75 }}
              className="mx-auto mt-7 max-w-xl text-base leading-relaxed text-ink/60 sm:text-lg lg:mx-0"
            >
              {t('hero.subtitle')}
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.95 }}
              className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center lg:justify-start"
            >
              <Link to="/catalog" className="group relative inline-block w-full sm:w-auto">
                <motion.span
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.97 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  className="relative flex items-center justify-center gap-3 overflow-hidden rounded-full bg-ink px-9 py-4 text-sm uppercase tracking-widest2 text-ivory shadow-lg shadow-gold/25"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-gold-dark via-gold-light to-gold-dark opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <span className="relative transition-colors duration-500 group-hover:text-ink">{t('hero.cta')}</span>
                  <motion.span
                    className="relative transition-colors duration-500 group-hover:text-ink"
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    →
                  </motion.span>
                </motion.span>
              </Link>
              <a
                href={BRAND.telegramBot}
                target="_blank"
                rel="noreferrer"
                className="inline-flex w-full items-center justify-center rounded-full border border-gold px-9 py-4 text-sm uppercase tracking-widest2 text-gold-dark transition-all duration-500 hover:bg-gold hover:text-ivory sm:w-auto"
              >
                {t('hero.cta2')}
              </a>
            </motion.div>
          </motion.div>

          <motion.div style={{ y: clockY }} className="order-1 flex justify-center lg:order-2 lg:justify-end">
            <LiveClock className="h-[250px] w-[250px] sm:h-[340px] sm:w-[340px] lg:h-[470px] lg:w-[470px]" />
          </motion.div>
        </div>

        <motion.div
          className="pointer-events-none absolute bottom-6 left-1/2 hidden -translate-x-1/2 flex-col items-center gap-2 text-[10px] uppercase tracking-widest2 text-ink/35 sm:flex"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
        >
          {t('hero.scroll')}
          <motion.span
            className="block h-8 w-px bg-gold"
            animate={{ scaleY: [0.2, 1, 0.2], originY: 0 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
        </motion.div>
      </section>

      <Marquee />

      {/* ============ FALSAFA ============ */}
      <section className="mx-auto max-w-4xl px-5 py-24 text-center sm:px-8 sm:py-32">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mb-4 text-xs uppercase tracking-widest2 text-gold-dark"
        >
          {t('home.philosophy_eyebrow')}
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-6 font-display text-3xl leading-tight sm:text-5xl"
        >
          {t('home.philosophy_title')}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="text-base leading-relaxed text-ink/60 sm:text-lg"
        >
          {t('home.philosophy_text')}
        </motion.p>
      </section>

      <div className="divider-gold mx-auto max-w-xs" />

      {/* ============ SCROLL VIDEO ============ */}
      <ScrollSequence />

      {/* ============ TANLANGANLAR ============ */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
          <div className="mb-12 flex items-end justify-between">
            <div>
              <p className="mb-3 text-xs uppercase tracking-widest2 text-gold-dark">{t('home.featured_eyebrow')}</p>
              <h2 className="font-display text-3xl sm:text-4xl">{t('home.featured_title')}</h2>
            </div>
            <Link to="/catalog" className="hidden text-sm uppercase tracking-wide text-ink/50 transition-colors hover:text-gold-dark sm:block">
              {t('home.featured_cta')} →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-5 sm:gap-8 lg:grid-cols-4">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
          <div className="mt-10 text-center sm:hidden">
            <Link to="/catalog" className="text-sm uppercase tracking-wide text-gold-dark">
              {t('home.featured_cta')} →
            </Link>
          </div>
        </section>
      )}

      {/* ============ QADRIYATLAR ============ */}
      <section className="bg-paper py-24 sm:py-32">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          <h2 className="mb-16 text-center font-display text-3xl sm:text-4xl">{t('home.values_title')}</h2>
          <div className="grid grid-cols-1 gap-12 sm:grid-cols-3 sm:gap-8">
            {[1, 2, 3].map((n, i) => (
              <motion.div
                key={n}
                initial={{ opacity: 0, y: 36 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: EASE }}
                className="text-center"
              >
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full border border-gold/40 font-display text-xl text-gold-dark">
                  {n}
                </div>
                <h3 className="mb-2 font-display text-xl">{t(`home.value_${n}_title`)}</h3>
                <p className="mx-auto max-w-xs text-sm leading-relaxed text-ink/55">{t(`home.value_${n}_text`)}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ============ CTA ============ */}
      <section className="relative overflow-hidden bg-ink px-5 py-24 text-center text-ivory sm:px-8 sm:py-28">
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(176,141,87,0.25) 0%, transparent 70%)' }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: EASE }}
          className="relative mx-auto max-w-2xl"
        >
          <h2 className="gold-gradient-text mb-5 font-display text-3xl leading-tight sm:text-5xl">{t('home.cta_title')}</h2>
          <p className="mb-9 text-ivory/60">{t('home.cta_text')}</p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <a href={BRAND.telegramBot} target="_blank" rel="noreferrer" className="w-full rounded-full bg-gold px-9 py-4 text-sm uppercase tracking-widest2 text-ink transition-colors duration-500 hover:bg-gold-light sm:w-auto">
              {t('home.cta_tg')}
            </a>
            <a href={`tel:${BRAND.phone}`} className="w-full rounded-full border border-ivory/30 px-9 py-4 text-sm uppercase tracking-widest2 text-ivory transition-colors duration-500 hover:border-gold-light hover:text-gold-light sm:w-auto">
              {t('home.cta_call')}
            </a>
          </div>
        </motion.div>
      </section>
    </div>
  )
}
