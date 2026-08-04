// Bu fayl serverda ishlaydi (Netlify Function). Bot tokeni faqat shu yerda,
// Netlify Environment Variables orqali ishlatiladi — clientga hech qachon yuborilmaydi.

exports.handler = async function (event) {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID

  if (!BOT_TOKEN || !CHAT_ID) {
    console.error('TELEGRAM_BOT_TOKEN yoki TELEGRAM_CHAT_ID sozlanmagan (Netlify env variables).')
    return { statusCode: 500, body: JSON.stringify({ error: 'Server not configured' }) }
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON' }) }
  }

  const { productName, price, customerName, customerPhone, orderId } = payload

  const text = [
    '🛎 *Yangi buyurtma — WristWatch.uz*',
    '',
    `⌚ Mahsulot: ${productName || '-'}`,
    `💰 Narx: ${price ? price.toLocaleString('uz-UZ') + " so'm" : '-'}`,
    customerName ? `👤 Mijoz: ${customerName}` : null,
    customerPhone ? `📞 Telefon: ${customerPhone}` : null,
    orderId ? `🆔 Buyurtma ID: ${orderId}` : null,
  ]
    .filter(Boolean)
    .join('\n')

  try {
    const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: CHAT_ID,
        text,
        parse_mode: 'Markdown',
      }),
    })

    const result = await res.json()
    if (!result.ok) {
      console.error('Telegram API xatosi:', result)
      return { statusCode: 502, body: JSON.stringify({ error: 'Telegram API error' }) }
    }

    return { statusCode: 200, body: JSON.stringify({ success: true }) }
  } catch (err) {
    console.error('Telegram yuborishda xato:', err)
    return { statusCode: 500, body: JSON.stringify({ error: 'Internal error' }) }
  }
}
