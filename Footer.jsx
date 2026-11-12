import { Link } from 'react-router-dom'
import { useLang } from '../i18n/index.jsx'
import { BRAND } from '../lib/config'
import logo from '../assets/logo.png'

export default function Footer() {
  const { t } = useLang()
  const year = new Date().getFullYear()

  return (
    <footer className="mt-24 bg-graphite text-ivory/80">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-5 py-14 sm:grid-cols-3 sm:px-8">
        <div>
          <div className="mb-3 flex items-center gap-2.5">
            <img src={logo} alt="" className="h-8 w-8 object-contain" />
            <span className="font-display text-xl text-ivory">
              WristWatch<span className="text-gold-light">.uz</span>
            </span>
          </div>
          <p className="text-sm uppercase tracking-widest2 text-ivory/50">{t('footer.tagline')}</p>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <Link to="/" className="transition-colors hover:text-gold-light">{t('nav.home')}</Link>
          <Link to="/catalog" className="transition-colors hover:text-gold-light">{t('nav.catalog')}</Link>
          <Link to="/about" className="transition-colors hover:text-gold-light">{t('nav.about')}</Link>
          <Link to="/contact" className="transition-colors hover:text-gold-light">{t('nav.contact')}</Link>
        </div>

        <div className="flex flex-col gap-2 text-sm">
          <a href={`tel:${BRAND.phone}`} className="transition-colors hover:text-gold-light">{BRAND.phoneDisplay}</a>
          <a href={BRAND.telegramBot} target="_blank" rel="noreferrer" className="transition-colors hover:text-gold-light">Telegram — {BRAND.telegramBotHandle}</a>
          <a href={BRAND.telegramChannel} target="_blank" rel="noreferrer" className="transition-colors hover:text-gold-light">Telegram — {BRAND.telegramChannelHandle}</a>
          <a href={BRAND.instagram} target="_blank" rel="noreferrer" className="transition-colors hover:text-gold-light">Instagram</a>
          <a href={BRAND.youtube} target="_blank" rel="noreferrer" className="transition-colors hover:text-gold-light">YouTube</a>
        </div>
      </div>
      <div className="border-t border-ivory/10 py-5 text-center text-xs text-ivory/40">
        © {year} WristWatch.uz — {t('footer.rights')}
      </div>
    </footer>
  )
}
