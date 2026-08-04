import { Link } from 'react-router-dom'
import { useLang } from '../i18n/index.jsx'
import logo from '../assets/logo.png'

export default function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  return (
    <footer className="bg-graphite text-ivory/80 mt-24">
      <div className="max-w-7xl mx-auto px-5 sm:px-8 py-14 grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <img src={logo} alt="logo" className="h-8 w-8 object-contain" />
            <span className="font-display text-xl text-ivory">WristWatch<span className="text-gold-light">.uz</span></span>
          </div>
          <p className="text-sm text-ivory/50 tracking-widest2 uppercase">{t('footer.tagline')}</p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <Link to="/" className="hover:text-gold-light transition-colors">{t('nav.home')}</Link>
          <Link to="/catalog" className="hover:text-gold-light transition-colors">{t('nav.catalog')}</Link>
          <Link to="/about" className="hover:text-gold-light transition-colors">{t('nav.about')}</Link>
          <Link to="/contact" className="hover:text-gold-light transition-colors">{t('nav.contact')}</Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <a href="tel:+998332311101" className="hover:text-gold-light transition-colors">+998 33 231 11 01</a>
          <a href="https://t.me/wristwatchuzbb" target="_blank" rel="noreferrer" className="hover:text-gold-light transition-colors">Telegram</a>
          <a href="https://www.instagram.com/wristwatch__uz/" target="_blank" rel="noreferrer" className="hover:text-gold-light transition-colors">Instagram</a>
          <a href="https://youtube.com/@WRISTWATCHUZ" target="_blank" rel="noreferrer" className="hover:text-gold-light transition-colors">YouTube</a>
        </div>
      </div>
      <div className="border-t border-ivory/10 py-5 text-center text-xs text-ivory/40">
        © {year} WristWatch.uz — {t('footer.rights')}
      </div>
    </footer>
  )
}
