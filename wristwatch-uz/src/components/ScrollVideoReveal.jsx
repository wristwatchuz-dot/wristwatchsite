import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'

const STEPS = [1, 2, 3]

export default function ScrollVideoReveal() {
  const { t } = useLang()
  const containerRef = useRef(null)
  const videoRef = useRef(null)
  const [duration, setDuration] = useState(0)
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    function onLoaded() {
      setDuration(video.duration || 0)
    }
    video.addEventListener('loadedmetadata', onLoaded)
    if (video.readyState >= 1) onLoaded()
    return () => video.removeEventListener('loadedmetadata', onLoaded)
  }, [])

  useEffect(() => {
    if (!duration) return
    let ticking = false

    function update() {
      const el = containerRef.current
      const video = videoRef.current
      if (!el || !video) return
      const rect = el.getBoundingClientRect()
      const total = rect.height - window.innerHeight
      const scrolled = Math.min(Math.max(-rect.top, 0), Math.max(total, 0))
      const p = total > 0 ? scrolled / total : 0
      setProgress(p)
      try {
        video.currentTime = p * duration
      } catch {
        // ignore seek errors before video is fully ready
      }
      ticking = false
    }

    function onScroll() {
      if (ticking) return
      ticking = true
      requestAnimationFrame(update)
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    update()
    return () => window.removeEventListener('scroll', onScroll)
  }, [duration])

  // Progress 0..1 ni 3 bosqichga bo'lamiz
  const activeStep = Math.min(STEPS.length - 1, Math.floor(progress * STEPS.length))

  return (
    <div ref={containerRef} className="relative h-[320vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-ivory flex items-center">
        <div className="max-w-7xl mx-auto w-full px-5 sm:px-8 grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16 items-center">
          {/* LEFT — changing text */}
          <div className="relative h-56 sm:h-64 order-2 md:order-1">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeStep}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -24 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="absolute inset-0 flex flex-col justify-center"
              >
                <p className="text-xs sm:text-sm tracking-widest2 uppercase text-gold-dark mb-4">
                  {t(`home.mechanism_step${activeStep + 1}_eyebrow`)}
                </p>
                <h3 className="font-display text-2xl sm:text-4xl mb-4 leading-tight">
                  {t(`home.mechanism_step${activeStep + 1}_title`)}
                </h3>
                <p className="text-ink/60 text-sm sm:text-base leading-relaxed max-w-md">
                  {t(`home.mechanism_step${activeStep + 1}_text`)}
                </p>
              </motion.div>
            </AnimatePresence>

            {/* progress dots */}
            <div className="absolute -bottom-2 left-0 flex gap-2">
              {STEPS.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    i === activeStep ? 'w-8 bg-gold-dark' : 'w-1.5 bg-ink/15'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* RIGHT — smaller, blended video */}
          <div className="order-1 md:order-2 flex justify-center md:justify-end">
            <div className="relative w-full max-w-xs sm:max-w-sm rounded-[2rem] overflow-hidden shadow-2xl shadow-ink/10 bg-ivory">
              <video
                ref={videoRef}
                className="h-full w-full object-cover mix-blend-multiply"
                src="/watch-reveal.mp4"
                muted
                playsInline
                preload="auto"
              />
              <div className="absolute inset-0 rounded-[2rem] ring-1 ring-ink/5 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

