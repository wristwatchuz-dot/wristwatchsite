import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'
import { supabase } from '../lib/supabaseClient'
import { BRAND } from '../lib/config'
import { REGIONS } from '../lib/regions'
import { SPEC_FIELDS } from '../lib/specs'
import { formatPrice, formatPhone, normalizePhone, submitOrder } from '../lib/utils'
import SafeImage from '../components/SafeImage.jsx'
import ProductCard from '../components/ProductCard.jsx'

const EASE = [0.16, 1, 0.3, 1]

const inputCls = (err) =>
  `w-full rounded-xl border bg-transparent px-4 py-3.5 text-[15px] outline-none transition-colors focus:border-gold ${
    err ? 'border-red-400' : 'border-ink/15'
  }`

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs uppercase tracking-widest text-ink/45">{label}</span>
      {children}
      {error && <span className="mt-1.5 block text-sm text-red-500">{error}</span>}
    </label>
  )
}

export default function ProductDetail() {
  const { id } = useParams()
  const { t, lang } = useLang()
  const [product, setProduct] = useState(undefined) // undefined = yuklanmoqda, null = topilmadi
  const [similar, setSimilar] = useState([])

  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [region, setRegion] = useState('')
  const [address, setAddress] = useState('')
  const [comment, setComment] = useState('')
  const [website, setWebsite] = useState('') // spam-tuzoq (ko'rinmaydi)
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle') // idle | sending | done | error
  const [orderNo, setOrderNo] = useState('')
  const doneRef = useRef(null)

  useEffect(() => {
    let active = true
    setProduct(undefined)
    setStatus('idle')
    supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return
        setProduct(data || null)
        if (data?.category) {
          supabase
            .from('products')
            .select('*')
            .eq('category', data.category)
            .neq('id', data.id)
            .limit(4)
            .then((r) => active && setSimilar(r.data || []))
        } else {
          setSimilar([])
        }
      })
    return () => {
      active = false
    }
  }, [id])

  useEffect(() => {
    if (status === 'done') {
      const timer = setTimeout(() => doneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 250)
      return () => clearTimeout(timer)
    }
  }, [status])

  async function handleSubmit(e) {
    e.preventDefault()
    if (status === 'sending') return

    const errs = {}
    if (name.trim().length < 2) errs.name = t('product.err_name')
    const normalized = normalizePhone(phone)
    if (!normalized) errs.phone = t('product.err_phone')
    if (!region) errs.region = t('product.err_region')
    if (address.trim().length < 5) errs.address = t('product.err_address')
    setErrors(errs)
    if (Object.keys(errs).length) return

    // Spam-bot to'ldirgan bo'lsa — jim "muvaffaqiyat" ko'rsatamiz, hech narsa yubormaymiz
    if (website) {
      setStatus('done')
      return
    }

    setStatus('sending')
    try {
      const res = await submitOrder({
        product,
        name: name.trim(),
        phone: normalized,
        region,
        address: address.trim(),
        comment: comment.trim(),
        website,
      })
      setOrderNo(res.id.slice(0, 8).toUpperCase())
      setStatus('done')
    } catch (err) {
      console.error('Buyurtma xatosi:', err)
      setStatus('error')
    }
  }

  if (product === undefined) {
    return (
      <div className="mx-auto max-w-6xl px-5 pb-24 pt-36 sm:px-8 sm:pt-44">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="aspect-square animate-pulse rounded-3xl bg-paper" />
          <div className="space-y-4">
            <div className="h-4 w-24 animate-pulse rounded bg-paper" />
            <div className="h-10 w-2/3 animate-pulse rounded bg-paper" />
            <div className="h-6 w-1/3 animate-pulse rounded bg-paper" />
          </div>
        </div>
      </div>
    )
  }

  if (product === null) {
    return (
      <div className="mx-auto flex min-h-[70vh] max-w-xl flex-col items-center justify-center px-5 pt-24 text-center">
        <h1 className="mb-3 font-display text-3xl">{t('product.not_found')}</h1>
        <p className="mb-8 text-ink/55">{t('product.not_found_text')}</p>
        <Link to="/catalog" className="rounded-full bg-ink px-8 py-3.5 text-sm uppercase tracking-widest2 text-ivory hover:bg-gold-dark">
          {t('product.back_catalog')}
        </Link>
      </div>
    )
  }

  const productName = product[`name_${lang}`] || product.name_uz
  const description = product[`description_${lang}`] || product.description_uz
  const soldOut = product.in_stock === false

  return (
    <div className="mx-auto max-w-6xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <Link to="/catalog" className="text-sm text-ink/50 transition-colors hover:text-gold-dark">
        ← {t('product.back')}
      </Link>

      <div className="mt-8 grid grid-cols-1 items-start gap-10 md:grid-cols-2 md:gap-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.9, ease: EASE }}
          className="aspect-square overflow-hidden rounded-3xl bg-paper md:sticky md:top-28"
        >
          <SafeImage src={product.image_url} alt={productName} eager className="h-full w-full object-cover" />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}>
          <p className="mb-3 text-xs uppercase tracking-widest2 text-gold-dark">{product.category}</p>
          <h1 className="mb-4 font-display text-4xl leading-tight sm:text-5xl">{productName}</h1>
          <p className="mb-6 text-2xl font-medium text-gold-dark">{formatPrice(product.price, lang)}</p>

          {description && (
            <div className="mb-8">
              <h2 className="mb-2 text-xs uppercase tracking-widest2 text-ink/40">{t('product.description')}</h2>
              <p className="leading-relaxed text-ink/65">{description}</p>
            </div>
          )}

          {SPEC_FIELDS.some(({ key }) => product[key]) && (
            <div className="mb-8">
              <h2 className="mb-3 text-xs uppercase tracking-widest2 text-ink/40">{t('specs.title')}</h2>
              <dl className="divide-y divide-ink/10 rounded-2xl border border-ink/10 bg-white/50 text-sm">
                {SPEC_FIELDS.filter(({ key }) => product[key]).map(({ key }) => (
                  <div key={key} className="flex justify-between gap-6 px-5 py-3">
                    <dt className="text-ink/45">{t(`specs.${key}`)}</dt>
                    <dd className="text-right font-medium text-ink/80">{product[key]}</dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {soldOut ? (
            <div className="rounded-2xl border border-ink/10 bg-paper p-6">
              <p className="mb-1 font-display text-xl">{t('product.out_of_stock')}</p>
              <p className="mb-5 text-sm text-ink/55">{t('product.out_of_stock_text')}</p>
              <a href={BRAND.telegramBot} target="_blank" rel="noreferrer" className="inline-block rounded-full bg-ink px-7 py-3 text-sm uppercase tracking-widest2 text-ivory hover:bg-gold-dark">
                {t('product.write_tg')}
              </a>
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {status === 'done' ? (
                <motion.div
                  key="done"
                  ref={doneRef}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="rounded-3xl border border-gold/40 bg-gold/5 p-8 text-center"
                >
                  <svg viewBox="0 0 52 52" className="mx-auto mb-4 h-16 w-16">
                    <motion.circle cx="26" cy="26" r="24" fill="none" stroke="#B08D57" strokeWidth="2" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.7 }} />
                    <motion.path d="M15 27 L23 35 L38 18" fill="none" stroke="#8A6D3F" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.6, delay: 0.5 }} />
                  </svg>
                  <h2 className="mb-2 font-display text-2xl text-gold-dark">{t('product.success_title')}</h2>
                  <p className="mb-2 text-ink/65">{t('product.success_text')}</p>
                  {orderNo && <p className="mb-6 text-sm tracking-wide text-ink/45">{t('product.order_no', { id: orderNo })}</p>}
                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    <Link to="/catalog" className="rounded-full border border-ink/20 px-6 py-3 text-sm uppercase tracking-widest2 hover:border-gold">
                      {t('product.back_catalog')}
                    </Link>
                    <a href={BRAND.telegramBot} target="_blank" rel="noreferrer" className="rounded-full bg-ink px-6 py-3 text-sm uppercase tracking-widest2 text-ivory hover:bg-gold-dark">
                      {t('product.write_tg')}
                    </a>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  onSubmit={handleSubmit}
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4 rounded-3xl border border-ink/10 bg-white/60 p-6 sm:p-8"
                >
                  <h2 className="font-display text-2xl">{t('product.form_title')}</h2>

                  <Field label={t('product.name')} error={errors.name}>
                    <input value={name} onChange={(e) => setName(e.target.value)} placeholder={t('product.name_ph')} autoComplete="name" maxLength={100} className={inputCls(errors.name)} />
                  </Field>

                  <Field label={t('product.phone')} error={errors.phone}>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      onBlur={() => {
                        const n = normalizePhone(phone)
                        if (n) setPhone(formatPhone(n))
                      }}
                      placeholder={t('product.phone_ph')}
                      type="tel"
                      inputMode="tel"
                      autoComplete="tel"
                      maxLength={20}
                      className={inputCls(errors.phone)}
                    />
                  </Field>

                  <Field label={t('product.region')} error={errors.region}>
                    <select value={region} onChange={(e) => setRegion(e.target.value)} className={inputCls(errors.region)}>
                      <option value="">{t('product.region_ph')}</option>
                      {REGIONS.map((r) => (
                        <option key={r.uz} value={r.uz}>
                          {r[lang] || r.uz}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label={t('product.address')} error={errors.address}>
                    <textarea value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('product.address_ph')} rows={2} maxLength={300} className={`${inputCls(errors.address)} resize-none`} />
                  </Field>

                  <Field label={t('product.comment')}>
                    <input value={comment} onChange={(e) => setComment(e.target.value)} placeholder={t('product.comment_ph')} maxLength={500} className={inputCls(false)} />
                  </Field>

                  {/* spam-tuzoq: odamlar ko'rmaydi */}
                  <div aria-hidden="true" style={{ position: 'absolute', left: '-9999px', height: 0, overflow: 'hidden' }}>
                    <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} name="website" />
                  </div>

                  <motion.button
                    type="submit"
                    disabled={status === 'sending'}
                    whileHover={{ scale: status === 'sending' ? 1 : 1.015 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full rounded-full bg-ink py-4 text-sm uppercase tracking-widest2 text-ivory transition-colors duration-500 hover:bg-gold-dark disabled:opacity-60"
                  >
                    {status === 'sending' ? t('product.sending') : t('product.submit')}
                  </motion.button>

                  {status === 'error' && (
                    <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                      {t('product.err_generic')}{' '}
                      <a href={BRAND.telegramBot} target="_blank" rel="noreferrer" className="underline">
                        {BRAND.telegramBotHandle}
                      </a>
                    </p>
                  )}
                  <p className="text-xs leading-relaxed text-ink/40">{t('product.secure_note')}</p>
                </motion.form>
              )}
            </AnimatePresence>
          )}
        </motion.div>
      </div>

      {similar.length > 0 && (
        <section className="mt-24">
          <h2 className="mb-8 font-display text-3xl">{t('product.similar_title')}</h2>
          <div className="grid grid-cols-2 gap-5 sm:gap-8 lg:grid-cols-4">
            {similar.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
