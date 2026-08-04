import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'
import { supabase } from '../lib/supabaseClient'
import ProductCard from '../components/ProductCard.jsx'

export default function Catalog() {
  const { t } = useLang()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('new')

  useEffect(() => {
    supabase
      .from('products')
      .select('*')
      .then(({ data }) => {
        setProducts(data || [])
        setLoading(false)
      })
  }, [])

  const categories = useMemo(() => {
    const set = new Set(products.map((p) => p.category).filter(Boolean))
    return ['all', ...set]
  }, [products])

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const matchesCat = category === 'all' || p.category === category
      const name = (p.name_uz || '') + (p.name_ru || '') + (p.name_en || '')
      const matchesSearch = name.toLowerCase().includes(search.toLowerCase())
      return matchesCat && matchesSearch
    })
    if (sort === 'price_asc') list = [...list].sort((a, b) => a.price - b.price)
    if (sort === 'price_desc') list = [...list].sort((a, b) => b.price - a.price)
    if (sort === 'new') list = [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    return list
  }, [products, search, category, sort])

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 pt-32 sm:pt-40 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="mb-12 text-center"
      >
        <h1 className="font-display text-4xl sm:text-5xl mb-3">{t('catalog.title')}</h1>
        <p className="text-ink/50">{t('catalog.subtitle')}</p>
      </motion.div>

      <div className="flex flex-col sm:flex-row gap-4 sm:items-center sm:justify-between mb-10">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t('catalog.search')}
          className="w-full sm:w-64 px-4 py-2.5 rounded-full border border-ink/15 bg-transparent focus:border-gold outline-none text-sm"
        />

        <div className="flex gap-2 flex-wrap">
          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-4 py-1.5 rounded-full text-xs uppercase tracking-wide border transition-colors ${
                category === c ? 'bg-ink text-ivory border-ink' : 'border-ink/15 text-ink/60 hover:border-gold'
              }`}
            >
              {c === 'all' ? t('catalog.all') : c}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2.5 rounded-full border border-ink/15 bg-transparent text-sm outline-none focus:border-gold"
        >
          <option value="new">{t('catalog.sort_new')}</option>
          <option value="price_asc">{t('catalog.sort_price_asc')}</option>
          <option value="price_desc">{t('catalog.sort_price_desc')}</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-32 text-ink/40">{t('catalog.loading')}</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-32 text-ink/40">{t('catalog.empty')}</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 sm:gap-10">
          {filtered.map((p, i) => (
            <ProductCard key={p.id} product={p} index={i % 8} />
          ))}
        </div>
      )}
    </div>
  )
}
