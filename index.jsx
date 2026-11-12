import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import uz from './locales/uz.json'
import ru from './locales/ru.json'
import en from './locales/en.json'

const DICTS = { uz, ru, en }
const LangContext = createContext(null)

// Sayt standart holatda o'zbek tilida ochiladi; tanlangan til eslab qolinadi.
function getInitialLang() {
  try {
    const saved = localStorage.getItem('ww_lang')
    if (saved && DICTS[saved]) return saved
  } catch {
    /* ignore */
  }
  return 'uz'
}

function lookup(dict, path) {
  let node = dict
  for (const p of path.split('.')) node = node?.[p]
  return node
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang)

  useEffect(() => {
    try {
      localStorage.setItem('ww_lang', lang)
    } catch {
      /* ignore */
    }
    document.documentElement.lang = lang
  }, [lang])

  // t('product.order_no', { id: 'AB12' })  ->  "{id}" o'rniga qiymat qo'yiladi
  const t = useCallback(
    (path, vars) => {
      let node = lookup(DICTS[lang], path)
      if (node === undefined || node === null) node = lookup(DICTS.uz, path)
      if (node === undefined || node === null) return path
      if (typeof node === 'string' && vars) {
        return node.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? ''))
      }
      return node
    },
    [lang]
  )

  const value = useMemo(() => ({ lang, setLang, t }), [lang, t])
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
