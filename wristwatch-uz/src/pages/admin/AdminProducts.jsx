import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../../i18n/index.jsx'
import { supabase } from '../../lib/supabaseClient'
import { formatPrice } from '../../lib/utils'

const EMPTY = {
  name_uz: '', name_ru: '', name_en: '',
  description_uz: '', description_ru: '', description_en: '',
  price: '', category: 'classic', image_url: '', in_stock: true,
}

export default function AdminProducts() {
  const { t } = useLang()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null) // null = closed, {} = new, {...} = edit
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  async function load() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProducts(data || [])
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  function openNew() {
    setForm(EMPTY)
    setEditing({})
  }

  function openEdit(p) {
    setForm({ ...EMPTY, ...p })
    setEditing(p)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = { ...form, price: Number(form.price) }
    delete payload.id
    delete payload.created_at

    if (editing?.id) {
      await supabase.from('products').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('products').insert([payload])
    }
    setSaving(false)
    setEditing(null)
    load()
  }

  async function handleDelete(id) {
    if (!confirm(t('admin.confirm_delete'))) return
    await supabase.from('products').delete().eq('id', id)
    load()
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-2xl sm:text-3xl">{t('admin.products')}</h1>
        <button
          onClick={openNew}
          className="bg-ink text-ivory hover:bg-gold-dark transition-colors px-5 py-2.5 rounded-full text-sm"
        >
          + {t('admin.add_product')}
        </button>
      </div>

      {loading ? (
        <p className="text-ink/40">...</p>
      ) : products.length === 0 ? (
        <p className="text-ink/40">{t('admin.no_products')}</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {products.map((p) => (
            <div key={p.id} className="border border-ink/10 rounded-xl p-4 flex gap-4 bg-white">
              <img src={p.image_url} alt={p.name_uz} className="h-20 w-20 object-cover rounded-lg flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-display text-lg truncate">{p.name_uz}</p>
                <p className="text-gold-dark text-sm font-medium">{formatPrice(p.price)}</p>
                <p className="text-xs text-ink/40 uppercase">{p.category}</p>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => openEdit(p)} className="text-xs text-ink/60 hover:text-gold-dark">{t('admin.edit')}</button>
                  <button onClick={() => handleDelete(p.id)} className="text-xs text-red-400 hover:text-red-600">{t('admin.delete')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-ink/60 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setEditing(null)}
          >
            <motion.form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSave}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="bg-ivory rounded-2xl p-6 sm:p-8 w-full max-w-lg max-h-[85vh] overflow-y-auto flex flex-col gap-3"
            >
              <h2 className="font-display text-xl mb-2">{editing?.id ? t('admin.edit') : t('admin.add_product')}</h2>

              {['name_uz', 'name_ru', 'name_en'].map((f) => (
                <input key={f} placeholder={`${t('admin.name')} (${f.split('_')[1]})`} value={form[f]}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-ink/15 focus:border-gold outline-none" required={f === 'name_uz'} />
              ))}

              {['description_uz', 'description_ru', 'description_en'].map((f) => (
                <textarea key={f} placeholder={`${t('admin.description_field')} (${f.split('_')[1]})`} value={form[f]}
                  onChange={(e) => setForm({ ...form, [f]: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-ink/15 focus:border-gold outline-none resize-none" rows={2} />
              ))}

              <div className="grid grid-cols-2 gap-3">
                <input type="number" placeholder={t('admin.price_field')} value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-ink/15 focus:border-gold outline-none" required />
                <input placeholder={t('admin.category_field')} value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="px-4 py-2.5 rounded-lg border border-ink/15 focus:border-gold outline-none" />
              </div>

              <input placeholder={t('admin.image_url')} value={form.image_url}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                className="px-4 py-2.5 rounded-lg border border-ink/15 focus:border-gold outline-none" />

              <div className="flex gap-3 mt-3">
                <button type="button" onClick={() => setEditing(null)}
                  className="flex-1 py-2.5 rounded-full border border-ink/15 text-sm">{t('admin.cancel')}</button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-full bg-ink text-ivory hover:bg-gold-dark transition-colors text-sm disabled:opacity-50">
                  {saving ? '...' : t('admin.save')}
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
