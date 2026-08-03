import { useState, useRef, useEffect } from 'react'
import { useLang } from '../i18n/index.jsx'

const LANGS = [
  { code: 'uz', label: "O'zbekcha" },
  { code: 'ru', label: 'Русский' },
  { code: 'en', label: 'English' },
]

export default function LanguageSwitcher() {
  const { lang, setLang } = useLang()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="text-xs tracking-widest2 uppercase border border-ink/15 rounded-full px-4 py-2 hover:border-gold transition-colors flex items-center gap-2"
      >
        {lang}
        <span className={`transition-transform duration-300 ${open ? 'rotate-180' : ''}`}>⌄</span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 bg-ivory border border-ink/10 rounded-xl shadow-lg overflow-hidden min-w-[140px] animate-fadeUp" style={{ animationDuration: '0.25s' }}>
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => {
                setLang(l.code)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gold/10 transition-colors ${
                lang === l.code ? 'text-gold-dark font-medium' : 'text-ink/80'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
