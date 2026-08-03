import { useState, useEffect } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useLang } from '../i18n/index.jsx'
import LanguageSwitcher from './LanguageSwitcher.jsx'
import logo from '../assets/logo.png'

export default function Navbar() {
  const { t } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/catalog', label: t('nav.catalog') },
    { to: '/contact', label: t('nav.contact') },
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled ? 'bg-ivory/90 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5" onClick={() => setMenuOpen(false)}>
          <img src={logo} alt="WristWatch.uz" className="h-8 w-8 sm:h-9 sm:w-9 object-contain" />
          <span className="font-display text-lg sm:text-xl tracking-wide">WristWatch<span className="text-gold">.uz</span></span>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              className={({ isActive }) =>
                `text-sm tracking-wide uppercase transition-colors relative py-1 ${
                  isActive ? 'text-ink' : 'text-ink/60 hover:text-ink'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {l.label}
                  {isActive && (
                    <motion.div
                      layoutId="nav-underline"
                      className="absolute -bottom-0.5 left-0 right-0 h-[1.5px] bg-gold"
                      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
          <LanguageSwitcher />
        </nav>

        <button
          className="md:hidden flex flex-col gap-1.5 p-2"
          onClick={() => setMenuOpen((o) => !o)}
          aria-label="Menu"
        >
          <motion.span animate={{ rotate: menuOpen ? 45 : 0, y: menuOpen ? 6 : 0 }} className="block h-[1.5px] w-6 bg-ink" />
          <motion.span animate={{ opacity: menuOpen ? 0 : 1 }} className="block h-[1.5px] w-6 bg-ink" />
          <motion.span animate={{ rotate: menuOpen ? -45 : 0, y: menuOpen ? -6 : 0 }} className="block h-[1.5px] w-6 bg-ink" />
        </button>
      </div>

      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden bg-ivory/95 backdrop-blur-md border-t border-ink/10 mt-3"
          >
            <div className="flex flex-col px-5 py-4 gap-4">
              {links.map((l) => (
                <NavLink
                  key={l.to}
                  to={l.to}
                  onClick={() => setMenuOpen(false)}
                  className={({ isActive }) =>
                    `text-base uppercase tracking-wide ${isActive ? 'text-gold-dark' : 'text-ink/70'}`
                  }
                >
                  {l.label}
                </NavLink>
              ))}
              <div className="pt-2">
                <LanguageSwitcher />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
