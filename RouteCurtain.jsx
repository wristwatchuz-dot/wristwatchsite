import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import logo from '../assets/logo.png'

// Sahifalar orasida o'tishda pastdan ko'tarilib, tepaga ketuvchi qora "parda" — kuchli, lekin nafis effekt.
export default function RouteCurtain() {
  const { pathname } = useLocation()
  const first = useRef(true)
  const [run, setRun] = useState(0)

  useEffect(() => {
    if (first.current) {
      first.current = false
      return
    }
    setRun((r) => r + 1)
  }, [pathname])

  return (
    <AnimatePresence>
      {run > 0 && (
        <motion.div
          key={run}
          className="pointer-events-none fixed inset-0 z-[90] flex flex-col items-center justify-center gap-4 bg-ink"
          initial={{ y: '100%' }}
          animate={{ y: ['100%', '0%', '0%', '-100%'] }}
          transition={{ duration: 1.05, times: [0, 0.3, 0.52, 1], ease: [0.76, 0, 0.24, 1] }}
        >
          <motion.img
            src={logo}
            alt=""
            className="h-14 w-14 object-contain"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.22, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          />
          <motion.span
            className="text-[10px] uppercase tracking-[0.45em] text-gold-light"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.4 }}
          >
            WristWatch.uz
          </motion.span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
