// WristWatch.uz — buyurtma xabarnomasi (Netlify Function, ES-module formati).
// Bot tokeni FAQAT shu yerda, Netlify "Environment variables" orqali o'qiladi —
// brauzerga (mijozga) hech qachon yuborilmaydi.
//
// Kerakli muhit o'zgaruvchilari (Netlify > Project configuration > Environment variables):
//   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Oddiy (best-effort) tezlik cheklovi: bitta IP dan 10 daqiqada 6 ta so'rov
const hits = new Map()
function rateLimited(ip, limit = 6, windowMs = 10 * 60 * 1000) {
  const now = Date.now()
  const list = (hits.get(ip) || []).filter((t) => now - t < windowMs)
  list.push(now)
  hits.set(ip, list)
  if (hits.size > 500) {
    for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k)
  }
  return list.length > limit
}

const json = (body, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
  })

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

const clip = (s, n) => String(s ?? '').trim().slice(0, n)

function formatPrice(n) {
  const num = Number(n)
  if (!isFinite(num)) return '-'
  return new Intl.NumberFormat('ru-RU').format(num).replace(/[\u00A0\u202F]/g, ' ') + " so'm"
}

async function lookupProduct(id) {
  const base = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL
  const key = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY
  if (!base || !key || !UUID_RE.test(id)) return null
  try {
    const r = await fetch(
      `${base}/rest/v1/products?id=eq.${id}&select=id,name_uz,price,in_stock&limit=1`,
      { headers: { apikey: key, Authorization: `Bearer ${key}` } }
    )
    if (!r.ok) return null
    const rows = await r.json()
    return rows[0] || null
  } catch {
    return null
  }
}

async function telegram(method, payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN
  const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  return r.json()
}

export default async (req, context) => {
  const ip = context?.ip || req.headers.get('x-nf-client-connection-ip') || 'unknown'
  const token = process.env.TELEGRAM_BOT_TOKEN
  // Bir nechta chat ID ni vergul bilan yozish mumkin: 123456789,-1001234567890
  const chatIds = String(process.env.TELEGRAM_CHAT_ID || '')
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean)

  // ---- Diagnostika: brauzerda /.netlify/functions/notify-order?check=1 ----
  if (req.method === 'GET') {
    if (rateLimited(ip, 20)) return json({ ok: false, error: 'rate_limited' }, 429)
    const url = new URL(req.url)
    const status = {
      ok: true,
      telegram_token_set: Boolean(token),
      telegram_chat_id_set: chatIds.length > 0,
      supabase_url_set: Boolean(process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL),
      supabase_key_set: Boolean(process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY),
    }
    if (url.searchParams.get('check') === '1' && token) {
      try {
        const me = await telegram('getMe', {})
        status.bot = me.ok ? '@' + me.result.username : null
        status.bot_error = me.ok ? undefined : me.description
        if (chatIds.length) {
          const checks = await Promise.all(
            chatIds.map(async (id) => {
              const chat = await telegram('getChat', { chat_id: id })
              return { chat_id: id, reachable: Boolean(chat.ok), error: chat.ok ? undefined : chat.description }
            })
          )
          status.chats = checks
          status.chat_reachable = checks.every((c) => c.reachable)
          const firstErr = checks.find((c) => !c.reachable)
          if (firstErr) status.chat_error = firstErr.error
        }
      } catch (e) {
        status.check_error = String(e?.message || e)
      }
    }
    return json(status)
  }

  if (req.method !== 'POST') return json({ ok: false, error: 'method_not_allowed' }, 405)

  if (!token || !chatIds.length) {
    console.error('TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan.')
    return json({ ok: false, error: 'not_configured' }, 500)
  }

  if (rateLimited(ip)) return json({ ok: false, error: 'rate_limited' }, 429)

  let data
  try {
    data = await req.json()
  } catch {
    return json({ ok: false, error: 'invalid_json' }, 400)
  }

  // Spam-tuzoq: oddiy foydalanuvchi bu maydonni ko'rmaydi va to'ldirmaydi
  if (data?.website) return json({ ok: true })

  const customerName = clip(data?.customerName, 100)
  const customerPhone = clip(data?.customerPhone, 20)
  const region = clip(data?.region, 100)
  const address = clip(data?.address, 300)
  const comment = clip(data?.comment, 500)
  const orderId = UUID_RE.test(String(data?.orderId || '')) ? String(data.orderId) : null
  const productId = String(data?.productId || '')

  if (customerName.length < 2 || customerPhone.length < 7) {
    return json({ ok: false, error: 'invalid_input' }, 400)
  }

  // Mahsulot nomi va narxi bazadan olinadi (mijoz yuborgan narxga ishonilmaydi)
  const product = await lookupProduct(productId)
  const productName = product?.name_uz || clip(data?.productName, 150) || '-'
  const price = product ? product.price : data?.price

  const time = new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Tashkent' })
  const siteUrl = process.env.URL || ''

  const lines = [
    `🛎 <b>Yangi buyurtma</b>${orderId ? ' #' + orderId.slice(0, 8).toUpperCase() : ''}`,
    '',
    `⌚ <b>Mahsulot:</b> ${esc(productName)}`,
    `💰 <b>Narx:</b> ${esc(formatPrice(price))}`,
    '',
    `👤 <b>Mijoz:</b> ${esc(customerName)}`,
    `📞 <b>Telefon:</b> ${esc(customerPhone)}`,
    region ? `📍 <b>Hudud:</b> ${esc(region)}` : null,
    address ? `🏠 <b>Manzil:</b> ${esc(address)}` : null,
    comment ? `💬 <b>Izoh:</b> ${esc(comment)}` : null,
    '',
    siteUrl && productId && UUID_RE.test(productId) ? `🔗 ${esc(siteUrl)}/product/${productId}` : null,
    `🕒 ${esc(time)} (Toshkent)`,
  ]
    .filter((l) => l !== null)
    .join('\n')

  try {
    const results = await Promise.all(
      chatIds.map((id) =>
        telegram('sendMessage', { chat_id: id, text: lines, parse_mode: 'HTML', disable_web_page_preview: true }).catch((e) => ({
          ok: false,
          description: String(e?.message || e),
        }))
      )
    )
    const okCount = results.filter((r) => r.ok).length
    if (!okCount) {
      const detail = results.find((r) => !r.ok)?.description
      console.error('Telegram API xatosi:', detail)
      return json({ ok: false, error: 'telegram_error', detail }, 502)
    }
    return json({ ok: true, sent: okCount, total: results.length })
  } catch (err) {
    console.error('Telegramga yuborishda xato:', err)
    return json({ ok: false, error: 'internal' }, 500)
  }
}
