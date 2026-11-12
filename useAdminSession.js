import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

/**
 * Admin sessiyasi: foydalanuvchi tizimga kirganmi VA bazadagi `admins` jadvalida bormi.
 * (Faqat login qilish yetarli emas — admin huquqi serverda tekshiriladi.)
 */
export function useAdminSession() {
  const [state, setState] = useState({ loading: true, session: null, isAdmin: false })

  useEffect(() => {
    let active = true

    async function evaluate(session) {
      if (!session) {
        if (active) setState({ loading: false, session: null, isAdmin: false })
        return
      }
      const { data, error } = await supabase.rpc('is_admin')
      if (active) setState({ loading: false, session, isAdmin: !error && data === true })
    }

    supabase.auth.getSession().then(({ data }) => evaluate(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      // Callback ichida to'g'ridan-to'g'ri supabase chaqirmaslik kerak (qotib qolishi mumkin)
      setTimeout(() => evaluate(session), 0)
    })

    return () => {
      active = false
      sub.subscription.unsubscribe()
    }
  }, [])

  return state
}

/** Admin sahifalari qidiruv tizimlarida ko'rinmasligi uchun <meta robots noindex> */
export function useNoIndex() {
  useEffect(() => {
    const meta = document.createElement('meta')
    meta.name = 'robots'
    meta.content = 'noindex, nofollow'
    document.head.appendChild(meta)
    return () => meta.remove()
  }, [])
}
