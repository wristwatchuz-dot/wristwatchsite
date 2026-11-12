import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'
import logo from '../assets/logo.png'

export const INTRO_SEEN_KEY = 'ww_intro_seen'

// Kirish videosi kerak emasligini aniqlash: sekin internet, "trafikni tejash" yoki "animatsiyani kamaytirish" yoqilgan bo'lsa.
export function shouldSkipIntro() {
  try {
    if (sessionStorage.getItem(INTRO_SEEN_KEY)) return true
    const c = navigator.connection
    if (c && (c.saveData || /(^|-)2g$/.test(c.effectiveType || ''))) return true
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return true
    return false
  } catch {
    return true
  }
}

// Fon sahifa rangiga singib ketishi uchun chetlari yumshoq so'nadigan niqob (telefon varianti)
const FADE_X = 'linear-gradient(to right, transparent 0%, #000 14%, #000 86%, transparent 100%)'
const FADE_Y = 'linear-gradient(to bottom, transparent 0%, #000 20%, #000 80%, transparent 100%)'
const MASK_STYLE = {
  backgroundColor: '#FAF7F0',
  WebkitMaskImage: `${FADE_X}, ${FADE_Y}`,
  maskImage: `${FADE_X}, ${FADE_Y}`,
  WebkitMaskComposite: 'source-in',
  maskComposite: 'intersect',
}

export default function IntroLoader({ onFinish }) {
  const { t } = useLang()
  const videoRef = useRef(null)
  const doneRef = useRef(false)
  const timers = useRef([])
  const barRef = useRef(null)
  const [playing, setPlaying] = useState(false)
  // Telefon (tik) ekran: soat to'liq ko'rinadigan, yengil variant. Kompyuter: butun ekranli kino.
  const [mobile] = useState(() => window.innerWidth < 768)

  const finish = useCallback(() => {
    if (doneRef.current) return
    doneRef.current = true
    timers.current.forEach(clearTimeout)
    onFinish()
  }, [onFinish])

  useEffect(() => {
    const v = videoRef.current
    // Video 9 soniya ichida boshlanmasa (sekin internet yoki avtoplay bloklangan) — kirishni o'tkazib yuboramiz
    timers.current.push(setTimeout(finish, 9000))
    if (v) {
      const p = v.play()
      if (p && p.catch) p.catch(() => finish())
    }
    return () => timers.current.forEach(clearTimeout)
  }, [finish])

  function handlePlaying() {
    if (playing) return
    setPlaying(true)
    timers.current.forEach(clearTimeout)
    timers.current = []
    const d = videoRef.current?.duration
    // Video tugashini kutamiz (onEnded ishlamasa — zaxira taymer)
    timers.current.push(setTimeout(finish, (isFinite(d) && d ? d : 8) * 1000 + 1500))
  }

  function handleTime() {
    const v = videoRef.current
    if (v && v.duration && barRef.current) {
      barRef.current.style.transform = `scaleX(${Math.min(1, v.currentTime / v.duration)})`
    }
  }

  const videoProps = {
    ref: videoRef,
    src: mobile ? '/intro-m.mp4' : '/intro.mp4',
    poster: mobile ? '/intro-m-poster.jpg' : '/intro-poster.jpg',
    autoPlay: true,
    muted: true,
    playsInline: true,
    preload: 'auto',
    onPlaying: handlePlaying,
    onTimeUpdate: handleTime,
    onEnded: finish,
    onError: finish,
  }

  return (
    <motion.div
      className={`fixed inset-0 z-[100] overflow-hidden ${mobile ? 'bg-ivory' : 'bg-ink'}`}
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
    >
      {mobile ? (
        <>
          <motion.div
            className="absolute left-0 right-0 top-[13%] flex flex-col items-center gap-3"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.2 } }}
          >
            <img src={logo} alt="" className="h-12 w-12 object-contain" />
            <span className="font-display text-2xl text-ink">
              WristWatch<span className="text-gold">.uz</span>
            </span>
          </motion.div>
          <div className="absolute inset-0 flex items-center justify-center">
            <motion.div
              className="w-[150%] max-w-none shrink-0"
              style={MASK_STYLE}
              initial={{ scale: 1.06 }}
              animate={{ scale: 1, transition: { duration: 7, ease: 'linear' } }}
              exit={{ scale: 1.12, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } }}
            >
              <video {...videoProps} className="block aspect-video w-full" />
            </motion.div>
          </div>
          <motion.p
            className="absolute bottom-[17%] left-0 right-0 text-center text-[11px] uppercase tracking-[0.45em] text-gold-dark"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { duration: 1, delay: 0.6 } }}
          >
            {t('nav.tagline')}
          </motion.p>
        </>
      ) : (
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.05 }}
          animate={{ scale: 1, transition: { duration: 7, ease: 'linear' } }}
          exit={{ scale: 1.12, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } }}
        >
          <video {...videoProps} className="h-full w-full object-cover" />
        </motion.div>
      )}

      {/* pastdagi oltin progress chizig'i */}
      <div className={`absolute bottom-0 left-0 right-0 h-[3px] ${mobile ? 'bg-ink/10' : 'bg-ivory/10'}`}>
        <div ref={barRef} className={`h-full origin-left ${mobile ? 'bg-gold-dark' : 'bg-gold-light'}`} style={{ transform: 'scaleX(0)' }} />
      </div>

      <motion.button
        onClick={finish}
        className={`absolute bottom-8 right-6 rounded-full border px-5 py-2.5 text-xs uppercase tracking-widest2 backdrop-blur-sm transition-colors sm:right-10 ${
          mobile
            ? 'border-ink/25 bg-ivory/60 text-ink/70 hover:border-gold hover:text-gold-dark'
            : 'border-ivory/40 bg-ink/30 text-ivory/90 hover:border-gold-light hover:text-gold-light'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1, transition: { delay: 0.8 } }}
        exit={{ opacity: 0 }}
      >
        {t('intro.skip')}
      </motion.button>
    </motion.div>
  )
}
