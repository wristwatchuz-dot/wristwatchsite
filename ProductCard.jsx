import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'
import { formatPrice } from '../lib/utils'
import SafeImage from './SafeImage.jsx'

export default function ProductCard({ product, index = 0 }) {
  const { lang, t } = useLang()
  const name = product[`name_${lang}`] || product.name_uz
  const soldOut = product.in_stock === false

  return (
    <motion.div
      initial={{ opacity: 0, y: 36 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.7, delay: (index % 4) * 0.08, ease: [0.16, 1, 0.3, 1] }}
    >
      <Link to={`/product/${product.id}`} className="group block">
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper">
          <SafeImage
            src={product.image_url}
            alt={name}
            className={`h-full w-full object-cover transition-transform duration-[900ms] ease-out group-hover:scale-110 ${soldOut ? 'opacity-60 grayscale' : ''}`}
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-ink/55 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          {soldOut && (
            <span className="absolute left-3 top-3 rounded-full bg-ink/85 px-3 py-1 text-[10px] uppercase tracking-widest text-ivory">
              {t('catalog.out_of_stock')}
            </span>
          )}
          <span className="absolute bottom-3 right-3 flex h-10 w-10 translate-y-3 items-center justify-center rounded-full bg-ivory text-ink opacity-0 shadow-lg transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
            →
          </span>
        </div>
        <div className="mt-4 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="truncate font-display text-lg leading-tight">{name}</h3>
            <p className="mt-1 text-xs uppercase tracking-widest2 text-ink/40">{product.category}</p>
          </div>
          <p className="whitespace-nowrap text-sm font-medium text-gold-dark sm:text-base">{formatPrice(product.price, lang)}</p>
        </div>
      </Link>
    </motion.div>
  )
}
