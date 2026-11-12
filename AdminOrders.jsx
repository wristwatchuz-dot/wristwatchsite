import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLang } from '../../i18n/index.jsx'
import { supabase } from '../../lib/supabaseClient'
import { downloadCsv, formatPrice } from '../../lib/utils'

const STATUSES = ['new', 'processing', 'done', 'cancelled']
const STATUS_STYLE = {
  new: 'bg-gold/15 text-gold-dark',
  processing: 'bg-blue-50 text-blue-600',
  done: 'bg-green-50 text-green-600',
  cancelled: 'bg-red-50 text-red-500',
}

export default function AdminOrders() {
  const { t } = useLang()
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const load = useCallback(async (silent = false) => {
    if (!silent) setLoading(true)
    const { data, error: err } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
    setError(err ? err.message : '')
    if (data) setOrders(data)
    setLoading(false)
  }, [])

  useEffect(() => {
    load()
    // Yangi buyurtmalar o'zi paydo bo'lishi uchun har 30 soniyada yangilanadi
    const timer = setInterval(() => load(true), 30000)
    return () => clearInterval(timer)
  }, [load])

  const statusLabel = (s) => t(`admin.status_${s}`)

  async function setStatus(order, status) {
    setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, status } : o)))
    const { error: err } = await supabase.from('orders').update({ status }).eq('id', order.id)
    if (err) {
      setError(err.message)
      load(true)
    }
  }

  async function remove(order) {
    if (!confirm(`${t('admin.confirm_delete')}\n\n#${order.id.slice(0, 8).toUpperCase()} — ${order.customer_name}`)) return
    const { error: err } = await supabase.from('orders').delete().eq('id', order.id)
    if (err) setError(err.message)
    else setOrders((list) => list.filter((o) => o.id !== order.id))
  }

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    return orders.filter((o) => {
      if (filter !== 'all' && o.status !== filter) return false
      if (!q) return true
      return `${o.customer_name} ${o.customer_phone} ${o.product_name} ${o.customer_region} ${o.customer_address}`.toLowerCase().includes(q)
    })
  }, [orders, filter, search])

  function exportCsv() {
    const rows = [
      ['ID', 'Sana', 'Mahsulot', 'Narx', 'Mijoz', 'Telefon', 'Hudud', 'Manzil', 'Izoh', 'Holat'],
      ...shown.map((o) => [
        o.id.slice(0, 8).toUpperCase(),
        new Date(o.created_at).toLocaleString('ru-RU'),
        o.product_name, o.product_price, o.customer_name, o.customer_phone,
        o.customer_region, o.customer_address, o.comment, o.status,
      ]),
    ]
    downloadCsv(`buyurtmalar-${new Date().toISOString().slice(0, 10)}.csv`, rows)
  }

  const counts = useMemo(() => {
    const c = { all: orders.length }
    STATUSES.forEach((s) => (c[s] = orders.filter((o) => o.status === s).length))
    return c
  }, [orders])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">{t('admin.orders')}</h1>
        <button onClick={exportCsv} disabled={!shown.length} className="rounded-full border border-ink/20 px-5 py-2 text-sm hover:border-gold disabled:opacity-40">
          ⬇ {t('admin.export_csv')}
        </button>
      </div>

      <div className="mb-5 flex flex-wrap items-center gap-2">
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-wide transition-colors ${filter === s ? 'border-ink bg-ink text-ivory' : 'border-ink/15 text-ink/60 hover:border-gold'}`}
          >
            {s === 'all' ? t('admin.all') : statusLabel(s)} <span className="opacity-60">{counts[s]}</span>
          </button>
        ))}
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('admin.search')} className="ml-auto w-full rounded-full border border-ink/15 bg-white px-5 py-2 text-sm outline-none focus:border-gold sm:w-64" />
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}

      {loading ? (
        <p className="text-ink/40">{t('admin.loading')}</p>
      ) : shown.length === 0 ? (
        <p className="text-ink/40">{orders.length === 0 ? t('admin.no_orders') : t('admin.no_results')}</p>
      ) : (
        <div className="space-y-3">
          {shown.map((o) => (
            <div key={o.id} className="rounded-xl border border-ink/10 bg-white p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-xs text-ink/40">
                    #{o.id.slice(0, 8).toUpperCase()} · {new Date(o.created_at).toLocaleString('ru-RU')}
                  </p>
                  <p className="mt-1 font-display text-xl">{o.product_name || '—'}</p>
                  <p className="text-sm font-medium text-gold-dark">{formatPrice(o.product_price)}</p>
                </div>
                <select
                  value={o.status || 'new'}
                  onChange={(e) => setStatus(o, e.target.value)}
                  className={`rounded-full border-0 px-4 py-1.5 text-xs font-medium uppercase tracking-wide outline-none ${STATUS_STYLE[o.status] || STATUS_STYLE.new}`}
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>{statusLabel(s)}</option>
                  ))}
                </select>
              </div>

              <div className="mt-4 grid gap-x-8 gap-y-2 text-sm sm:grid-cols-2">
                <p><span className="text-ink/40">{t('admin.order_customer')}: </span>{o.customer_name || '—'}</p>
                <p>
                  <span className="text-ink/40">{t('admin.phone')}: </span>
                  {o.customer_phone ? <a href={`tel:${o.customer_phone}`} className="text-gold-dark underline-offset-2 hover:underline">{o.customer_phone}</a> : '—'}
                </p>
                <p><span className="text-ink/40">{t('admin.region')}: </span>{o.customer_region || '—'}</p>
                <p><span className="text-ink/40">{t('admin.address')}: </span>{o.customer_address || '—'}</p>
                {o.comment && <p className="sm:col-span-2"><span className="text-ink/40">{t('admin.comment')}: </span>{o.comment}</p>}
              </div>

              <div className="mt-4 flex gap-5 text-xs">
                {o.customer_phone && <a href={`tel:${o.customer_phone}`} className="text-gold-dark hover:underline">☎ {t('admin.call')}</a>}
                <button onClick={() => remove(o)} className="text-red-400 hover:text-red-600">{t('admin.delete_order')}</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
