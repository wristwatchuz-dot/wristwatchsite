import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

const CX = 200
const CY = 200

// Brend uslubidagi jonli soat: foydalanuvchining haqiqiy vaqtini ko'rsatadi,
// ochilganda strelkalar 12:00 dan hozirgi vaqtga silliq aylanib keladi.
export default function LiveClock({ className = '' }) {
  const hourRef = useRef(null)
  const minRef = useRef(null)
  const secRef = useRef(null)

  useEffect(() => {
    let raf
    const start = performance.now()
    const SWEEP = 2000
    const easeOut = (x) => 1 - Math.pow(1 - x, 4)

    function frame(now) {
      const d = new Date()
      const sec = d.getSeconds() + d.getMilliseconds() / 1000
      const min = d.getMinutes() + sec / 60
      const hour = (d.getHours() % 12) + min / 60
      const k = easeOut(Math.min(1, (now - start) / SWEEP))
      hourRef.current?.setAttribute('transform', `rotate(${hour * 30 * k} ${CX} ${CY})`)
      minRef.current?.setAttribute('transform', `rotate(${min * 6 * k} ${CX} ${CY})`)
      secRef.current?.setAttribute('transform', `rotate(${sec * 6 * k} ${CX} ${CY})`)
      raf = requestAnimationFrame(frame)
    }
    raf = requestAnimationFrame(frame)
    return () => cancelAnimationFrame(raf)
  }, [])

  const ticks = Array.from({ length: 60 }, (_, i) => i)

  return (
    <motion.div
      className={className}
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
    >
      <svg viewBox="0 0 400 400" className="h-full w-full" role="img" aria-label="WristWatch.uz clock">
        <defs>
          <radialGradient id="dialGlow" cx="50%" cy="45%" r="60%">
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
            <stop offset="70%" stopColor="#F5F1E8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#EADFC8" stopOpacity="0.9" />
          </radialGradient>
          <linearGradient id="goldRing" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#D4B483" />
            <stop offset="50%" stopColor="#8A6D3F" />
            <stop offset="100%" stopColor="#D4B483" />
          </linearGradient>
        </defs>

        <circle cx={CX} cy={CY} r="192" fill="url(#dialGlow)" />
        <motion.circle
          cx={CX}
          cy={CY}
          r="192"
          fill="none"
          stroke="url(#goldRing)"
          strokeWidth="3"
          initial={{ pathLength: 0, rotate: -90 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
          style={{ originX: '50%', originY: '50%' }}
        />
        <circle cx={CX} cy={CY} r="176" fill="none" stroke="#0E0D0B" strokeOpacity="0.08" strokeWidth="1" />

        {ticks.map((i) => {
          const hour = i % 5 === 0
          return (
            <g key={i} transform={`rotate(${i * 6} ${CX} ${CY})`}>
              <motion.rect
                x={CX - (hour ? 2.2 : 0.8)}
                y={CY - 168}
                width={hour ? 4.4 : 1.6}
                height={hour ? 22 : 8}
                rx={hour ? 2.2 : 0.8}
                fill={hour ? '#B08D57' : '#0E0D0B'}
                fillOpacity={hour ? 1 : 0.35}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.35 + i * 0.018, duration: 0.5 }}
              />
            </g>
          )
        })}

        <text x={CX} y="128" textAnchor="middle" fontSize="12" letterSpacing="5" fill="#0E0D0B" fillOpacity="0.75" fontFamily="Inter, sans-serif" fontWeight="500">
          WRISTWATCH.UZ
        </text>
        <text x={CX} y="290" textAnchor="middle" fontSize="8" letterSpacing="4" fill="#8A6D3F" fontFamily="Inter, sans-serif">
          TIME. STYLE. YOU.
        </text>

        {/* soat strelkasi */}
        <g ref={hourRef} transform={`rotate(0 ${CX} ${CY})`}>
          <path d={`M${CX} ${CY - 98} L${CX + 7} ${CY + 14} L${CX - 7} ${CY + 14} Z`} fill="#0E0D0B" />
        </g>
        {/* minut strelkasi */}
        <g ref={minRef} transform={`rotate(0 ${CX} ${CY})`}>
          <path d={`M${CX} ${CY - 142} L${CX + 5.5} ${CY + 16} L${CX - 5.5} ${CY + 16} Z`} fill="#0E0D0B" />
        </g>
        {/* soniya strelkasi */}
        <g ref={secRef} transform={`rotate(0 ${CX} ${CY})`}>
          <rect x={CX - 0.9} y={CY - 156} width="1.8" height="190" fill="#B08D57" />
          <circle cx={CX} cy={CY + 30} r="4" fill="#B08D57" />
        </g>
        <circle cx={CX} cy={CY} r="10" fill="#0E0D0B" />
        <circle cx={CX} cy={CY} r="4.5" fill="#B08D57" />
      </svg>
    </motion.div>
  )
}
