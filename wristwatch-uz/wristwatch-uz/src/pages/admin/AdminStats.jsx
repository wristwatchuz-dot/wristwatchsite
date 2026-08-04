import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '../../i18n/index.jsx'
import { supabase } from '../../lib/supabaseClient'
import { formatPrice } from '../../lib/utils'

export default function AdminStats() {
  const { t } = useLang()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('orders').select('*').then(({ data }) => {
      setOrders(data || [])
      setLoading(false)
    })
  }, [])

  const now = new Date()
  const monthlyOrders = orders.filter((o) => {
    const d = new Date(o.created_at)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })
  const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.product_price) || 0), 0)

  const topMap = {}
  orders.forEach((o) => {
    if (!o.product_name) return
    topMap[o.product_name] = (topMap[o.product_name] || 0) + 1
  })
  const topProducts = Object.entries(topMap).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const cards = [
    { label: t('admin.total_orders'), value: orders.length },
    { label: t('admin.monthly_orders'), value: monthlyOrders.length },
    { label: t('admin.total_revenue'), value: formatPrice(totalRevenue) },
  ]

  return (
    <div>
      <h1 className="font-display text-2xl sm:text-3xl mb-8">{t('admin.dashboard')}</h1>

      {loading ? (
        <p className="text-ink/40">...</p>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
            {cards.map((c, i) => (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="bg-white border border-ink/10 rounded-2xl p-6"
              >
                <p className="text-xs uppercase tracking-widest2 text-ink/40 mb-2">{c.label}</p>
                <p className="font-display text-3xl text-gold-dark">{c.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white border border-ink/10 rounded-2xl p-6">
            <h2 className="text-sm uppercase tracking-widest2 text-ink/40 mb-5">{t('admin.top_products')}</h2>
            {topProducts.length === 0 ? (
              <p className="text-ink/40 text-sm">{t('admin.no_orders')}</p>
            ) : (
              <div className="flex flex-col gap-3">
                {topProducts.map(([name, count], i) => (
                  <div key={name} className="flex items-center gap-4">
                    <span className="font-display text-lg text-gold-dark w-6">{i + 1}</span>
                    <span className="flex-1 truncate">{name}</span>
                    <span className="text-ink/50 text-sm">{count}x</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
