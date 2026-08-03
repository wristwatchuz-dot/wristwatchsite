export function formatPrice(value) {
  if (value === null || value === undefined) return ''
  return new Intl.NumberFormat('uz-UZ').format(value) + " so'm"
}

export async function submitOrder({ product, name, phone }) {
  const { supabase } = await import('./supabaseClient')

  const { error } = await supabase
    .from('orders')
    .insert([
      {
        product_id: product.id,
        product_name: product.name_uz,
        product_price: product.price,
        customer_name: name || null,
        customer_phone: phone || null,
        status: 'new',
      },
    ])

  if (error) throw error

  // Netlify function orqali Telegram bot'ga xabar yuboriladi.
  // Token va chat_id serverda (env variable) saqlanadi — clientda ko'rinmaydi.
  try {
    await fetch('/.netlify/functions/notify-order', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productName: product.name_uz,
        price: product.price,
        customerName: name,
        customerPhone: phone,
      }),
    })
  } catch (e) {
    // Xabarnoma yuborilmasa ham, buyurtma bazaga saqlanган bo'ladi.
    console.warn('Telegram xabarnomasi yuborilmadi:', e)
  }
}
