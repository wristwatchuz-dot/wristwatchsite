import { motion } from 'framer-motion'

// Sahifa almashganda: eskisi tez so'nadi, yangisi pastdan yumshoq ko'tariladi.
export default function PageTransition({ children }) {
  return (
    <motion.main
      initial={{ opacity: 0, y: 36 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.7, delay: 0.12, ease: [0.16, 1, 0.3, 1] } }}
      exit={{ opacity: 0, y: -16, transition: { duration: 0.28, ease: 'easeIn' } }}
    >
      {children}
    </motion.main>
  )
}
