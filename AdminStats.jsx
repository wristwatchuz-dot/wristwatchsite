import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../../i18n/index.jsx'
import { supabase } from '../../lib/supabaseClient'
import { formatPrice } from '../../lib/utils'

const dayKey = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export default function AdminStats() {
  const { t, lang } = useLang()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    supabase.from('orders').select('*').then(({ data, error: err }) => {
      setError(err ? err.message : '')
      setOrders(data || [])
      setLoading(false)
    })
  }, [])

  const stats = useMemo(() => {
    const now = new Date()
    const monthly = orders.filter((o) => {
      const d = new Date(o.created_at)
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    const done = orders.filter((o) => o.status === 'done')
    const revenue = done.reduce((s, o) => s + (Number(o.product_price) || 0), 0)

    // oxirgi 14 kun
    const days = Array.from({ length: 14 }, (_, i) => {
      const d = new Date(now)
      d.setDate(now.getDate() - (13 - i))
      return { key: dayKey(d), label: d.getDate(), count: 0 }
    })
    const idx = Object.fromEntries(days.map((d, i) => [d.key, i]))
    orders.forEach((o) => {
      const k = dayKey(new Date(o.created_at))
      if (k in idx) days[idx[k]].count++
    })

    const top = {}
    const regions = {}
    orders.forEach((o) => {
      if (o.product_name) top[o.product_name] = (top[o.product_name] || 0) + 1
      if (o.customer_region) regions[o.customer_region] = (regions[o.customer_region] || 0) + 1
    })
    const sort = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]).slice(0, 5)

    return {
      total: orders.length,
      monthly: monthly.length,
      fresh: orders.filter((o) => o.status === 'new').length,
      done: done.length,
      revenue,
      days,
      top: sort(top),
      regions: sort(regions),
    }
  }, [orders])

  const cards = [
    { label: t('admin.total_orders'), value: stats.total },
    { label: t('admin.stat_new'), value: stats.fresh },
    { label: t('admin.monthly_orders'), value: stats.monthly },
    { label: t('admin.stat_done'), value: stats.done },
    { label: t('admin.stat_revenue_done'), value: formatPrice(stats.revenue, lang), wide: true },
  ]
  const max = Math.max(1, ...stats.days.map((d) => d.count))

  const Bars = ({ rows }) =>
    rows.length === 0 ? (
      <p className="text-sm text-ink/40">{t('admin.no_orders')}</p>
    ) : (
      <div className="flex flex-col gap-3">
        {rows.map(([name, count], i) => (
          <div key={name}>
            <div className="mb-1 flex justify-between text-sm">
              <span className="truncate pr-3">{i + 1}. {name}</span>
              <span className="text-ink/50">{count}</span>
            </div>
            <div className="h-1.5 rounded-full bg-ink/5">
              <motion.div initial={{ width: 0 }} animate={{ width: `${(count / rows[0][1]) * 100}%` }} transition={{ duration: 0.8, delay: 0.1 * i }} className="h-full rounded-full bg-gold-dark" />
            </div>
          </div>
        ))}
      </div>
    )

  return (
    <div>
      <h1 className="mb-8 font-display text-3xl">{t('admin.dashboard')}</h1>
      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-ink/40">{t('admin.loading')}</p>
      ) : (
        <>
          <div className="mb-8 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {cards.map((c, i) => (
              <motion.div key={c.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.07 }} className={`rounded-2xl border border-ink/10 bg-white p-5 ${c.wide ? 'col-span-2 lg:col-span-1' : ''}`}>
                <p className="mb-2 text-[11px] uppercase tracking-widest text-ink/40">{c.label}</p>
                <p className="font-display text-2xl text-gold-dark sm:text-3xl">{c.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="mb-8 rounded-2xl border border-ink/10 bg-white p-6">
            <h2 className="mb-6 text-xs uppercase tracking-widest text-ink/40">{t('admin.stat_last14')}</h2>
            <div className="flex h-40 items-end gap-1.5 sm:gap-2">
              {stats.days.map((d, i) => (
                <div key={d.key} className="flex h-full flex-1 flex-col items-center justify-end gap-2" title={`${d.key}: ${d.count}`}>
                  <span className="text-[10px] text-ink/40">{d.count || ''}</span>
                  <motion.div initial={{ height: 0 }} animate={{ height: `${(d.count / max) * 100}%` }} transition={{ duration: 0.7, delay: i * 0.03 }} className="w-full min-h-[3px] rounded-t bg-gold-dark/80" style={{ minHeight: d.count ? 6 : 3, opacity: d.count ? 1 : 0.25 }} />
                  <span className="text-[10px] text-ink/40">{d.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-2xl border border-ink/10 bg-white p-6">
              <h2 className="mb-5 text-xs uppercase tracking-widest text-ink/40">{t('admin.top_products')}</h2>
              <Bars rows={stats.top} />
            </div>
            <div className="rounded-2xl border border-ink/10 bg-white p-6">
              <h2 className="mb-5 text-xs uppercase tracking-widest text-ink/40">{t('admin.stat_by_region')}</h2>
              <Bars rows={stats.regions} />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
