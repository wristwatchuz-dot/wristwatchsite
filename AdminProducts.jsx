import { useEffect, useMemo, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../../i18n/index.jsx'
import { supabase } from '../../lib/supabaseClient'
import { compressImage, formatPrice } from '../../lib/utils'
import { SPEC_FIELDS } from '../../lib/specs'
import SafeImage from '../../components/SafeImage.jsx'

const EMPTY = {
  name_uz: '', name_ru: '', name_en: '',
  description_uz: '', description_ru: '', description_en: '',
  price: '', category: 'classic', image_url: '', in_stock: true, featured: false,
  brand: '', movement: '', case_material: '', strap: '', water_resistance: '', case_size: '', warranty: '',
}
const CATEGORIES = ['classic', 'sport', 'men', 'women', 'unisex', 'luxury']

const field = 'w-full rounded-lg border border-ink/15 bg-white px-4 py-2.5 text-sm outline-none focus:border-gold'

export default function AdminProducts() {
  const { t } = useLang()
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState(null) // null = yopiq, {} = yangi, {...} = tahrirlash
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formError, setFormError] = useState('')

  async function load() {
    setLoading(true)
    const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setLoadError(error ? error.message : '')
    setProducts(data || [])
    setLoading(false)
  }
  useEffect(() => {
    load()
  }, [])

  const shown = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return products
    return products.filter((p) => `${p.name_uz} ${p.name_ru} ${p.name_en} ${p.category}`.toLowerCase().includes(q))
  }, [products, search])

  function openNew() {
    setForm(EMPTY)
    setFormError('')
    setEditing({})
  }
  function openEdit(p) {
    setForm({ ...EMPTY, ...p, price: p.price ?? '', image_url: p.image_url || '' })
    setFormError('')
    setEditing(p)
  }
  function openCopy(p) {
    // Mavjud mahsulotdan nusxa: rasm olinmaydi, nomga "(nusxa)" qo'shiladi
    setForm({ ...EMPTY, ...p, name_uz: `${p.name_uz} (nusxa)`, price: p.price ?? '', image_url: '' })
    setFormError('')
    setEditing({})
  }
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))

  async function handleFile(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    setFormError('')
    try {
      const blob = await compressImage(file)
      const path = `${crypto.randomUUID()}.jpg`
      const { error } = await supabase.storage.from('products').upload(path, blob, { contentType: 'image/jpeg', cacheControl: '31536000' })
      if (error) throw error
      const { data } = supabase.storage.from('products').getPublicUrl(path)
      setForm((f) => ({ ...f, image_url: data.publicUrl }))
    } catch (err) {
      setFormError(`${t('admin.save_error')}: ${err.message || err}`)
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    setFormError('')
    const payload = {
      name_uz: form.name_uz.trim(),
      name_ru: form.name_ru.trim() || null,
      name_en: form.name_en.trim() || null,
      description_uz: form.description_uz?.trim() || null,
      description_ru: form.description_ru?.trim() || null,
      description_en: form.description_en?.trim() || null,
      price: Number(form.price) || 0,
      category: form.category.trim() || 'classic',
      image_url: form.image_url.trim() || null,
      in_stock: Boolean(form.in_stock),
      featured: Boolean(form.featured),
      ...Object.fromEntries(SPEC_FIELDS.map(({ key }) => [key, (form[key] || '').trim() || null])),
    }
    const res = editing?.id
      ? await supabase.from('products').update(payload).eq('id', editing.id)
      : await supabase.from('products').insert([payload])
    setSaving(false)
    if (res.error) {
      setFormError(`${t('admin.save_error')}: ${res.error.message}`)
      return
    }
    setEditing(null)
    load()
  }

  async function handleDelete(p) {
    if (!confirm(`${t('admin.confirm_delete')}\n\n${p.name_uz}`)) return
    const { error } = await supabase.from('products').delete().eq('id', p.id)
    if (error) alert(`${t('admin.delete_error')}: ${error.message}`)
    else load()
  }

  async function toggleStock(p) {
    await supabase.from('products').update({ in_stock: p.in_stock === false }).eq('id', p.id)
    load()
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl">
          {t('admin.products')} <span className="text-base text-ink/35">({products.length})</span>
        </h1>
        <button onClick={openNew} className="rounded-full bg-ink px-6 py-2.5 text-sm text-ivory transition-colors hover:bg-gold-dark">
          + {t('admin.add_product')}
        </button>
      </div>

      <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('admin.search')} className="mb-6 w-full max-w-sm rounded-full border border-ink/15 bg-white px-5 py-2.5 text-sm outline-none focus:border-gold" />

      {loadError && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{loadError}</p>}

      {loading ? (
        <p className="text-ink/40">{t('admin.loading')}</p>
      ) : shown.length === 0 ? (
        <p className="text-ink/40">{products.length === 0 ? t('admin.no_products') : t('admin.no_results')}</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => (
            <div key={p.id} className="flex gap-4 rounded-xl border border-ink/10 bg-white p-4">
              <SafeImage src={p.image_url} alt={p.name_uz} className="h-24 w-24 flex-shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate font-display text-lg">{p.name_uz}</p>
                <p className="text-sm font-medium text-gold-dark">{formatPrice(p.price)}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] uppercase text-ink/40">
                  <span>{p.category}</span>
                  {p.featured && <span className="rounded bg-gold/15 px-1.5 py-0.5 text-gold-dark">★</span>}
                  <button onClick={() => toggleStock(p)} className={`rounded px-1.5 py-0.5 ${p.in_stock === false ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'}`}>
                    {p.in_stock === false ? t('admin.stock_out') : t('admin.stock_in')}
                  </button>
                </div>
                <div className="mt-2 flex gap-4">
                  <button onClick={() => openEdit(p)} className="text-xs text-ink/60 hover:text-gold-dark">{t('admin.edit')}</button>
                  <button onClick={() => openCopy(p)} className="text-xs text-ink/60 hover:text-gold-dark">{t('admin.duplicate')}</button>
                  <button onClick={() => handleDelete(p)} className="text-xs text-red-400 hover:text-red-600">{t('admin.delete')}</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editing !== null && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-ink/60 p-4 backdrop-blur-sm" onClick={() => setEditing(null)}>
            <motion.form
              onClick={(e) => e.stopPropagation()}
              onSubmit={handleSave}
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              className="flex max-h-[90vh] w-full max-w-xl flex-col gap-3 overflow-y-auto rounded-2xl bg-ivory p-6 sm:p-8"
            >
              <h2 className="mb-1 font-display text-2xl">{editing?.id ? t('admin.edit') : t('admin.add_product')}</h2>

              {/* Rasm */}
              <div className="flex items-center gap-4 rounded-xl border border-dashed border-ink/20 bg-white p-3">
                <SafeImage src={form.image_url} alt="" className="h-24 w-24 flex-shrink-0 rounded-lg object-cover" />
                <div className="min-w-0 flex-1">
                  <label className="inline-block cursor-pointer rounded-full bg-ink px-5 py-2 text-sm text-ivory hover:bg-gold-dark">
                    {uploading ? t('admin.uploading') : t('admin.upload_image')}
                    <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} className="hidden" />
                  </label>
                  {form.image_url && (
                    <button type="button" onClick={() => setForm((f) => ({ ...f, image_url: '' }))} className="ml-3 text-xs text-red-400 hover:text-red-600">
                      {t('admin.remove_image')}
                    </button>
                  )}
                  <p className="mt-2 text-xs text-ink/40">{t('admin.image_hint')}</p>
                </div>
              </div>
              <input value={form.image_url} onChange={set('image_url')} placeholder={t('admin.or_url')} className={field} />

              <input required value={form.name_uz} onChange={set('name_uz')} placeholder={`${t('admin.name')} (UZ)`} className={field} />
              <input value={form.name_ru} onChange={set('name_ru')} placeholder={`${t('admin.name')} (RU)`} className={field} />
              <input value={form.name_en} onChange={set('name_en')} placeholder={`${t('admin.name')} (EN)`} className={field} />

              <textarea rows={2} value={form.description_uz || ''} onChange={set('description_uz')} placeholder={`${t('admin.description_field')} (UZ)`} className={`${field} resize-none`} />
              <textarea rows={2} value={form.description_ru || ''} onChange={set('description_ru')} placeholder={`${t('admin.description_field')} (RU)`} className={`${field} resize-none`} />
              <textarea rows={2} value={form.description_en || ''} onChange={set('description_en')} placeholder={`${t('admin.description_field')} (EN)`} className={`${field} resize-none`} />

              <div className="grid grid-cols-2 gap-3">
                <input required type="number" min="0" step="1000" value={form.price} onChange={set('price')} placeholder={`${t('admin.price_field')} (so'm)`} className={field} />
                <>
                  <input list="ww-categories" value={form.category} onChange={set('category')} placeholder={t('admin.category_field')} className={field} />
                  <datalist id="ww-categories">{CATEGORIES.map((c) => <option key={c} value={c} />)}</datalist>
                </>
              </div>

              <p className="mt-2 text-xs uppercase tracking-widest text-ink/40">{t('admin.specs_title')}</p>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {SPEC_FIELDS.map(({ key, example }) => (
                  <input key={key} value={form[key] || ''} onChange={set(key)} maxLength={80} placeholder={`${t(`specs.${key}`)} — ${example}`} className={field} />
                ))}
              </div>

              <div className="flex flex-wrap gap-6 py-1 text-sm">
                <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.in_stock)} onChange={set('in_stock')} className="h-4 w-4 accent-[#8A6D3F]" /> {t('admin.stock_in')}</label>
                <label className="flex items-center gap-2"><input type="checkbox" checked={Boolean(form.featured)} onChange={set('featured')} className="h-4 w-4 accent-[#8A6D3F]" /> {t('admin.featured')}</label>
              </div>

              {formError && <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">{formError}</p>}

              <div className="mt-2 flex gap-3">
                <button type="button" onClick={() => setEditing(null)} className="flex-1 rounded-full border border-ink/15 py-2.5 text-sm">{t('admin.cancel')}</button>
                <button type="submit" disabled={saving || uploading} className="flex-1 rounded-full bg-ink py-2.5 text-sm text-ivory hover:bg-gold-dark disabled:opacity-50">
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
