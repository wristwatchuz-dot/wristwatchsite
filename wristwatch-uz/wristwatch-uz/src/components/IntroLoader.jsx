import { useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const SESSION_KEY = 'ww_intro_seen'

export default function IntroLoader({ onFinish }) {
  const videoRef = useRef(null)
  const [visible, setVisible] = useState(() => !sessionStorage.getItem(SESSION_KEY))
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!visible) {
      onFinish()
      return
    }
    // Video haqiqiy davomiyligidan 2 soniya ortiqni kutamiz (agar "onEnded" ishlamasa)
    const el = videoRef.current
    function setupFallback() {
      const duration = el?.duration
      const ms = duration && isFinite(duration) ? duration * 1000 + 1500 : 15000
      return setTimeout(finish, ms)
    }
    let fallbackTimer = setTimeout(setupFallback, 300)
    return () => clearTimeout(fallbackTimer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function finish() {
    sessionStorage.setItem(SESSION_KEY, '1')
    setVisible(false)
    setTimeout(onFinish, 900)
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] flex items-center justify-center bg-ink overflow-hidden"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            exit={{ scale: 1.15, transition: { duration: 1.1, ease: [0.16, 1, 0.3, 1] } }}
          >
            <video
              ref={videoRef}
              className="h-full w-full object-cover"
              style={{ opacity: ready ? 1 : 0, transition: 'opacity 0.6s ease' }}
              src="/intro.mov"
              autoPlay
              muted
              playsInline
              onCanPlay={() => setReady(true)}
              onEnded={finish}
            />
          </motion.div>

          <motion.button
            onClick={finish}
            className="absolute bottom-8 right-8 text-xs tracking-widest2 uppercase text-ivory/70 hover:text-gold-light transition-colors border border-ivory/30 hover:border-gold px-4 py-2 rounded-full backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, transition: { delay: 1 } }}
            exit={{ opacity: 0 }}
          >
            O'tkazib yuborish
          </motion.button>

          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
