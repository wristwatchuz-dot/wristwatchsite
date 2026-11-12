import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard.jsx'

function Skeleton() {
  return (
    <div>
      <div className="aspect-[4/5] animate-pulse rounded-2xl bg-paper" />
      <div className="mt-4 h-4 w-2/3 animate-pulse rounded bg-paper" />
      <div className="mt-2 h-3 w-1/3 animate-pulse rounded bg-paper" />
    </div>
  )
}

export default function Catalog() {
  const { t } = useLang()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('new')
  const [limit, setLimit] = useState(24)

  async function load() {
    setLoading(true)
    setFailed(false)
    const { data, error } = await supabase.from('products').select('*')
    if (error) setFailed(true)
    setProducts(data || [])
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])
  useEffect(() => setLimit(24), [search, category, sort])

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean))
    return ['all', ...set]
  }, [products])

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    let list = products.filter((p) => {
      const matchesCat = category === 'all' || p.category === category
      const hay = `${p.name_uz || ''} ${p.name_ru || ''} ${p.name_en || ''}`.toLowerCase()
      return matchesCat && (!q || hay.includes(q))
    })
    if (sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'new') list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return list
  }, [products, search, category, sort])

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }} className="mb-12 text-center">
        <h1 className="mb-3 font-display text-4xl sm:text-6xl">{t('catalog.title')}</h1>
        <p className="text-ink/50">{t('catalog.subtitle')}</p>
      </motion.div>

      <div className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('catalog.search')}
          className="w-full rounded-full border border-ink/15 bg-transparent px-5 py-3 text-sm outline-none transition-colors focus:border-gold lg:w-72"
        />
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-wide transition-colors ${
                category === c ? 'border-ink bg-ink text-ivory' : 'border-ink/15 text-ink/60 hover:border-gold'
              }`}
            >
              {c === 'all' ? t('catalog.all') : c}
            </button>
          ))}
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="rounded-full border border-ink/15 bg-transparent px-4 py-3 text-sm outline-none focus:border-gold"
        >
          <option value="new">{t('catalog.sort_new')}</option>
          <option value="price_asc">{t('catalog.sort_price_asc')}</option>
          <option value="price_desc">{t('catalog.sort_price_desc')}</option>
        </select>
      </div>

      {!loading && !failed && filtered.length > 0 && (
        <p className="mb-6 text-sm text-ink/40">{t('catalog.count', { n: filtered.length })}</p>
      )}

      {loading ? (
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} />
          ))}
        </div>
      ) : failed ? (
        <div className="py-28 text-center">
          <p className="mb-5 text-ink/50">{t('product.err_generic')}</p>
          <button onClick={load} className="rounded-full border border-gold px-7 py-3 text-sm uppercase tracking-widest2 text-gold-dark hover:bg-gold hover:text-ivory">
            {t('common.retry')}
          </button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-28 text-center">
          <p className="mb-5 text-ink/40">{t('catalog.empty')}</p>
          {(search || category !== 'all') && (
            <button
              onClick={() => {
                setSearch('')
                setCategory('all')
              }}
              className="text-sm uppercase tracking-wide text-gold-dark"
            >
              {t('catalog.reset')}
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-8 lg:grid-cols-4">
            {filtered.slice(0, limit).map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} />
            ))}
          </div>
          {filtered.length > limit && (
            <div className="mt-14 text-center">
              <button onClick={() => setLimit((l) => l + 24)} className="rounded-full border border-gold px-9 py-3.5 text-sm uppercase tracking-widest2 text-gold-dark transition-all duration-500 hover:bg-gold hover:text-ivory">
                {t('catalog.load_more')} ({filtered.length - limit})
              </button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
