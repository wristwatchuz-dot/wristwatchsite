import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'

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
    // Ba'zi brauzerlarda metadata darhol tayyor bo'ladi
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

  return (
    <div ref={containerRef} className="relative h-[280vh]">
      <div className="sticky top-0 h-screen overflow-hidden bg-ivory flex items-center justify-center">
        <video
          ref={videoRef}
          className="h-full w-full object-cover"
          src="/watch-reveal.mp4"
          muted
          playsInline
          preload="auto"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-ivory/0 via-transparent to-ivory/10 pointer-events-none" />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: progress > 0.05 && progress < 0.95 ? 1 : 0, y: 0 }}
          transition={{ duration: 0.4 }}
          className="absolute bottom-10 sm:bottom-14 left-0 right-0 text-center px-5 pointer-events-none"
        >
          <p className="text-xs sm:text-sm tracking-widest2 uppercase text-gold-dark mb-2">
            {t('home.mechanism_eyebrow')}
          </p>
          <h3 className="font-display text-2xl sm:text-4xl text-ink">
            {t('home.mechanism_title')}
          </h3>
        </motion.div>
      </div>
    </div>
  )
}
