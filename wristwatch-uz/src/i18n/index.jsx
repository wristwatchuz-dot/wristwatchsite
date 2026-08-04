import { createContext, useContext, useEffect, useState } from 'react'
import uz from './locales/uz.json'
import ru from './locales/ru.json'
import en from './locales/en.json'

const DICTS = { uz, ru, en }
const LangContext = createContext(null)

function getInitialLang() {
  const saved = localStorage.getItem('ww_lang')
  if (saved && DICTS[saved]) return saved
  const nav = (navigator.language || 'uz').slice(0, 2)
  return DICTS[nav] ? nav : 'uz'
}

export function LangProvider({ children }) {
  const [lang, setLang] = useState(getInitialLang)

  useEffect(() => {
    localStorage.setItem('ww_lang', lang)
    document.documentElement.lang = lang
  }, [lang])

  function t(path) {
    const parts = path.split('.')
    let node = DICTS[lang]
    for (const p of parts) {
      node = node?.[p]
    }
    return node ?? path
  }

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LangContext)
  if (!ctx) throw new Error('useLang must be used within LangProvider')
  return ctx
}
