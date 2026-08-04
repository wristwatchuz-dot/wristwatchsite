import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'
import { supabase } from '../lib/supabaseClient'
import { formatPrice, submitOrder } from '../lib/utils'

export default function ProductDetail() {
  const { id } = useParams()
  const { t, lang } = useLang()
  const [product, setProduct] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | done | error

  useEffect(() => {
    supabase.from('products').select('*').eq('id', id).single().then(({ data }) => {
      setProduct(data)
    })
  }, [id])

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('sending')
    try {
      await submitOrder({ product, name, phone })
      setStatus('done')
    } catch (err) {
      console.error(err)
      setStatus('error')
    }
  }

  if (!product) return <div className="pt-40 text-center text-ink/40">{t('catalog.loading')}</div>

  const productName = product[`name_${lang}`] || product.name_uz
  const description = product[`description_${lang}`] || product.description_uz

  return (
    <div className="max-w-6xl mx-auto px-5 sm:px-8 pt-32 sm:pt-40 pb-24">
      <Link to="/catalog" className="text-sm text-ink/50 hover:text-gold-dark transition-colors">
        ← {t('product.back')}
      </Link>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-10 sm:gap-16 items-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl overflow-hidden bg-paper aspect-square"
        >
          <img src={product.image_url} alt={productName} className="h-full w-full object-cover" />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
        >
          <p className="text-xs uppercase tracking-widest2 text-gold-dark mb-3">{product.category}</p>
          <h1 className="font-display text-3xl sm:text-4xl mb-4">{productName}</h1>
          <p className="text-2xl text-gold-dark font-medium mb-6">{formatPrice(product.price)}</p>

          {description && (
            <div className="mb-8">
              <h3 className="text-xs uppercase tracking-widest2 text-ink/40 mb-2">{t('product.description')}</h3>
              <p className="text-ink/65 leading-relaxed">{description}</p>
            </div>
          )}

          {!showForm && status !== 'done' && (
            <button
              onClick={() => setShowForm(true)}
              className="w-full sm:w-auto bg-ink text-ivory hover:bg-gold-dark transition-colors duration-500 px-8 py-3.5 rounded-full text-sm tracking-widest2 uppercase"
            >
              {t('product.order_now')}
            </button>
          )}

          <AnimatePresence>
            {showForm && status !== 'done' && (
              <motion.form
                onSubmit={handleSubmit}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="overflow-hidden flex flex-col gap-4 mt-2"
              >
                <p className="text-sm text-ink/50">{t('product.order_note')}</p>
                <input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t('admin.name')}
                  className="px-4 py-3 rounded-xl border border-ink/15 bg-transparent focus:border-gold outline-none"
                />
                <input
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+998 90 123 45 67"
                  className="px-4 py-3 rounded-xl border border-ink/15 bg-transparent focus:border-gold outline-none"
                />
                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="bg-gold-dark text-ivory hover:bg-ink transition-colors duration-500 px-8 py-3.5 rounded-full text-sm tracking-widest2 uppercase disabled:opacity-50"
                >
                  {status === 'sending' ? '...' : t('product.order_via_telegram')}
                </button>
                {status === 'error' && (
                  <p className="text-sm text-red-500">Xatolik yuz berdi, qaytadan urinib ko'ring.</p>
                )}
              </motion.form>
            )}
          </AnimatePresence>

          {status === 'done' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="mt-2 rounded-xl border border-gold/40 bg-gold/5 p-6 text-center"
            >
              <p className="font-display text-xl text-gold-dark mb-1">✓</p>
              <p className="text-ink/70">Buyurtmangiz qabul qilindi. Tez orada siz bilan bog'lanamiz.</p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
