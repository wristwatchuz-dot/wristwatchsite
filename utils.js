import { supabase } from './supabaseClient'

const CURRENCY = { uz: "so'm", ru: 'сум', en: 'UZS' }

export function formatPrice(value, lang = 'uz') {
  if (value === null || value === undefined || value === '') return ''
  const n = Number(value)
  if (!isFinite(n)) return ''
  const grouped = new Intl.NumberFormat('ru-RU').format(n).replace(/[\u00A0\u202F]/g, ' ')
  return `${grouped} ${CURRENCY[lang] || CURRENCY.uz}`
}

// "90 123 45 67", "+998901234567", "998 90 123-45-67" -> "+998901234567". Noto'g'ri bo'lsa null.
export function normalizePhone(input) {
  let d = String(input || '').replace(/\D/g, '')
  if (d.length === 9) d = '998' + d
  if (d.length === 12 && d.startsWith('998')) return '+' + d
  return null
}

export function formatPhone(normalized) {
  const m = /^\+998(\d{2})(\d{3})(\d{2})(\d{2})$/.exec(normalized || '')
  return m ? `+998 ${m[1]} ${m[2]} ${m[3]} ${m[4]}` : normalized || ''
}

function newId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  // Eski brauzerlar uchun zaxira
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16)
  })
}

/**
 * Buyurtmani bazaga yozadi va Telegram xabarnomasini yuboradi.
 * Telegram yuborilmasa ham buyurtma bazada saqlanadi (admin panelda ko'rinadi).
 */
export async function submitOrder({ product, name, phone, region, address, comment, website }) {
  const id = newId()

  const { error } = await supabase.from('orders').insert([
    {
      id,
      product_id: product.id,
      product_name: product.name_uz,
      product_price: product.price,
      customer_name: name,
      customer_phone: phone,
      customer_region: region || null,
      customer_address: address || null,
      comment: comment || null,
      status: 'new',
    },
  ])
  if (error) throw error

  let notified = false
  try {
    const res = await fetch('/.netlify/functions/notify-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        orderId: id,
        productId: product.id,
        productName: product.name_uz,
        price: product.price,
        customerName: name,
        customerPhone: phone,
        region,
        address,
        comment,
        website,
      }),
    })
    notified = res.ok
    if (!res.ok) console.warn('Telegram xabarnomasi yuborilmadi:', res.status)
  } catch (e) {
    console.warn('Telegram xabarnomasi yuborilmadi:', e)
  }

  return { id, notified }
}

/** Rasmni kichraytirib, JPEG ga o'giradi (yuklash tezroq, sayt yengilroq bo'ladi). */
export async function compressImage(file, maxSize = 1600, quality = 0.86) {
  const url = URL.createObjectURL(file)
  try {
    const img = await new Promise((resolve, reject) => {
      const i = new Image()
      i.onload = () => resolve(i)
      i.onerror = () => reject(new Error("Rasm formati qo'llab-quvvatlanmaydi (JPG, PNG yoki WebP yuklang)"))
      i.src = url
    })
    const scale = Math.min(1, maxSize / Math.max(img.naturalWidth, img.naturalHeight))
    const w = Math.max(1, Math.round(img.naturalWidth * scale))
    const h = Math.max(1, Math.round(img.naturalHeight * scale))
    const canvas = document.createElement('canvas')
    canvas.width = w
    canvas.height = h
    const ctx = canvas.getContext('2d')
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, w, h)
    ctx.drawImage(img, 0, 0, w, h)
    return await new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error('Rasmni o\'zgartirib bo\'lmadi'))), 'image/jpeg', quality)
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}

export function downloadCsv(filename, rows) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`
  const csv = '\uFEFF' + rows.map((r) => r.map(esc).join(',')).join('\r\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(a.href), 1000)
}
