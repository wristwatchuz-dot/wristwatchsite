import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'

const STEPS = [1, 2, 3]

// Kadrlar "sprite" rasmlarga joylangan (har birida 3x4 = 12 kadr). Telefon uchun yengilroq to'plam.
const SEQ = {
  d: { w: 1120, h: 630, sheets: 7, cols: 3, rows: 4, frames: 80, path: '/seq/d-' },
  m: { w: 720, h: 405, sheets: 7, cols: 3, rows: 4, frames: 80, path: '/seq/m-' },
}

// To'rt tomondan ham yumshoq so'nadigan niqob: chetlari sahifa fonida butunlay yo'qoladi
const FADE_X = 'linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%)'
const FADE_Y = 'linear-gradient(to bottom, transparent 0%, #000 20%, #000 80%, transparent 100%)'
const MASK_STYLE = {
  backgroundColor: '#FAF7F0',
  WebkitMaskImage: `${FADE_X}, ${FADE_Y}`,
  maskImage: `${FADE_X}, ${FADE_Y}`,
  WebkitMaskComposite: 'source-in',
  maskComposite: 'intersect',
}

/**
 * Scroll bilan boshqariladigan animatsiya (Apple uslubida): foydalanuvchi sudraganda soat "sochiladi" va yig'iladi.
 * <video> o'rniga kadrlar ketma-ketligi ishlatiladi — shuning uchun iPhone/Safari'da ham, past quvvatli
 * telefonlarda ham ishonchli, silliq ishlaydi (kadrlar orasi yumshoq aralashtiriladi).
 */
export default function ScrollSequence() {
  const { t } = useLang()
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const barRef = useRef(null)
  const [step, setStep] = useState(0)

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const cfg = window.innerWidth < 900 ? SEQ.m : SEQ.d
    const per = cfg.cols * cfg.rows
    const sheets = new Array(cfg.sheets).fill(null)
    const s = { target: 0, current: 0, visible: false, raf: 0, lastKey: '' }
    let cancelled = false

    function sizeCanvas() {
      const rect = canvas.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = Math.max(2, Math.round(rect.width * dpr))
      const h = Math.round((w * cfg.h) / cfg.w)
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w
        canvas.height = h
        s.lastKey = ''
      }
    }

    function frameSource(i) {
      const sheet = sheets[Math.floor(i / per)]
      if (!sheet) return null
      const k = i % per
      return [sheet, (k % cfg.cols) * cfg.w, Math.floor(k / cfg.cols) * cfg.h]
    }

    // Hali yuklanmagan kadr uchun eng yaqin yuklangan kadr ko'rsatiladi
    function nearestLoaded(i) {
      for (let d = 0; d < cfg.frames; d++) {
        if (i - d >= 0 && frameSource(i - d)) return i - d
        if (i + d < cfg.frames && frameSource(i + d)) return i + d
      }
      return -1
    }

    function draw(p) {
      const pos = Math.min(1, Math.max(0, p)) * (cfg.frames - 1)
      const i0 = Math.floor(pos)
      const a = pos - i0
      const i1 = Math.min(cfg.frames - 1, i0 + 1)
      const loaded = sheets.reduce((n, x) => n + (x ? 1 : 0), 0)
      const key = `${i0}:${Math.round(a * 16)}:${canvas.width}:${loaded}`
      if (key === s.lastKey) return
      s.lastKey = key
      const base = nearestLoaded(i0)
      if (base < 0) return
      const f0 = frameSource(base)
      ctx.globalAlpha = 1
      ctx.drawImage(f0[0], f0[1], f0[2], cfg.w, cfg.h, 0, 0, canvas.width, canvas.height)
      if (a > 0.05 && i1 !== i0) {
        const f1 = frameSource(i1)
        if (f1) {
          ctx.globalAlpha = a
          ctx.drawImage(f1[0], f1[1], f1[2], cfg.w, cfg.h, 0, 0, canvas.width, canvas.height)
          ctx.globalAlpha = 1
        }
      }
    }

    function loop() {
      s.raf = 0
      const rect = container.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 1))
      s.target = total > 0 ? scrolled / total : 0

      // inersiya: animatsiya scroll ortidan yumshoq "ergashadi"
      const diff = s.target - s.current
      s.current = Math.abs(diff) < 0.0004 ? s.target : s.current + diff * 0.16

      draw(s.current)
      if (barRef.current) barRef.current.style.transform = `scaleY(${s.current})`
      const idx = Math.min(STEPS.length - 1, Math.floor(s.current * STEPS.length))
      setStep((prev) => (prev === idx ? prev : idx))

      if (s.visible && Math.abs(s.target - s.current) > 0.0004) s.raf = requestAnimationFrame(loop)
    }
    function kick() {
      if (!s.raf) s.raf = requestAnimationFrame(loop)
    }

    function loadSheet(n) {
      return new Promise((resolve) => {
        const img = new Image()
        img.decoding = 'async'
        img.onload = async () => {
          try {
            if (img.decode) await img.decode() // oldindan dekodlash — scroll paytida qotib qolmasligi uchun
          } catch {
            /* ignore */
          }
          if (!cancelled) {
            sheets[n] = img
            kick()
          }
          resolve()
        }
        img.onerror = () => resolve()
        img.src = `${cfg.path}${n}.webp`
      })
    }

    async function loadAll() {
      // Asosiy sahifa kontenti bilan raqobatlashmaslik uchun biroz kutamiz
      await new Promise((r) => setTimeout(r, 400))
      if (cancelled) return
      await loadSheet(0)
      await Promise.all(Array.from({ length: cfg.sheets - 1 }, (_, i) => loadSheet(i + 1)))
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        s.visible = entry.isIntersecting
        if (entry.isIntersecting) kick()
      },
      { rootMargin: '300px 0px' }
    )
    io.observe(container)
    const onResize = () => {
      sizeCanvas()
      kick()
    }
    sizeCanvas()
    window.addEventListener('scroll', kick, { passive: true })
    window.addEventListener('resize', onResize)
    loadAll()
    kick()

    return () => {
      cancelled = true
      io.disconnect()
      window.removeEventListener('scroll', kick)
      window.removeEventListener('resize', onResize)
      if (s.raf) cancelAnimationFrame(s.raf)
    }
  }, [])

  return (
    <div ref={containerRef} className="relative h-[380vh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-ivory">
        <div className="mx-auto grid h-full max-w-7xl grid-cols-1 content-center items-center gap-4 px-5 pt-16 sm:px-8 md:grid-cols-[0.8fr_1.2fr] md:gap-8 md:pt-0">
          {/* CHAP — scroll bilan almashadigan matn */}
          <div className="relative order-2 min-h-[230px] md:order-1 md:min-h-[320px]">
            <div className="absolute left-0 top-0 hidden h-full w-px bg-ink/10 md:block">
              <div ref={barRef} className="h-full w-px origin-top bg-gold-dark" style={{ transform: 'scaleY(0)' }} />
            </div>
            <div className="relative md:pl-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 28 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -28 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                >
                  <p className="mb-4 text-xs uppercase tracking-widest2 text-gold-dark sm:text-sm">
                    {String(step + 1).padStart(2, '0')} — {t(`home.mechanism_step${step + 1}_eyebrow`)}
                  </p>
                  <h3 className="mb-4 font-display text-3xl leading-tight sm:text-5xl">{t(`home.mechanism_step${step + 1}_title`)}</h3>
                  <p className="max-w-md text-sm leading-relaxed text-ink/60 sm:text-base">{t(`home.mechanism_step${step + 1}_text`)}</p>
                </motion.div>
              </AnimatePresence>
              <div className="mt-8 flex gap-2">
                {STEPS.map((_, i) => (
                  <span key={i} className={`h-1.5 rounded-full transition-all duration-500 ${i === step ? 'w-10 bg-gold-dark' : 'w-1.5 bg-ink/15'}`} />
                ))}
              </div>
            </div>
          </div>

          {/* O'NG — kadrlar ketma-ketligi (fon sahifaga singdirilgan) */}
          <div className="order-1 md:order-2">
            <div className="relative -ml-[15%] w-[130%] max-w-none sm:mx-auto sm:ml-auto sm:w-full sm:max-w-[760px]" style={MASK_STYLE}>
              <canvas ref={canvasRef} className="block aspect-video w-full" role="img" aria-label="WristWatch.uz" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
