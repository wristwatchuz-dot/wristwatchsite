import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'
import { formatPrice } from '../lib/utils'

export default function ProductCard({ product, index = 0 }) {
  const { lang } = useLang()
  const name = product[`name_${lang}`] || product.name_uz

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.6, delay: index * 0.06, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative overflow-hidden rounded-2xl bg-paper aspect-[4/5]">
          <img
            src={product.image_url}
            alt={name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
        </div>
        <div className="mt-4 flex items-start justify-between gap-2">
          <div>
            <h3 className="font-display text-lg leading-tight">{name}</h3>
            <p className="text-xs uppercase tracking-widest2 text-ink/40 mt-1">{product.category}</p>
          </div>
          <p className="text-gold-dark font-medium whitespace-nowrap">{formatPrice(product.price)}</p>
        </div>
      </Link>
    </motion.div>
  )
}
