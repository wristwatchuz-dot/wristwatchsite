import { Navigate, NavLink, Outlet } from 'react-router-dom'
import { useLang } from '../../i18n/index.jsx'
import { supabase } from '../../lib/supabaseClient'
import { useAdminSession, useNoIndex } from '../../lib/useAdminSession'
import LanguageSwitcher from '../../components/LanguageSwitcher.jsx'
import logo from '../../assets/logo.png'

export default function AdminLayout() {
  useNoIndex()
  const { t } = useLang()
  const { loading, session, isAdmin } = useAdminSession()

  if (loading) {
    return <div className="flex min-h-screen items-center justify-center bg-ink text-ivory/50">{t('admin.loading')}</div>
  }
  if (!session) return <Navigate to="/admin" replace />
  if (!isAdmin) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink px-5">
        <div className="max-w-sm rounded-2xl border border-ivory/10 bg-graphite/60 p-8 text-center">
          <h1 className="mb-3 font-display text-2xl text-ivory">{t('admin.no_access')}</h1>
          <p className="mb-6 text-sm leading-relaxed text-ivory/60">{t('admin.no_access_text')}</p>
          <button onClick={() => supabase.auth.signOut()} className="rounded-full border border-ivory/30 px-6 py-2.5 text-sm text-ivory hover:text-gold-light">
            {t('admin.logout')}
          </button>
        </div>
      </div>
    )
  }

  const links = [
    { to: '/admin/dashboard', label: t('admin.stats') },
    { to: '/admin/products', label: t('admin.products') },
    { to: '/admin/orders', label: t('admin.orders') },
  ]

  return (
    <div className="flex min-h-screen flex-col bg-ivory md:flex-row">
      <aside className="sticky top-0 z-20 flex flex-col gap-3 bg-ink px-4 py-3 text-ivory md:h-screen md:w-64 md:justify-between md:px-6 md:py-8">
        <div>
          <div className="flex items-center justify-between md:mb-10 md:block">
            <div className="flex items-center gap-2.5">
              <img src={logo} alt="" className="h-8 w-8 object-contain" />
              <span className="font-display text-lg">WristWatch<span className="text-gold-light">.uz</span></span>
            </div>
            <div className="md:hidden">
              <button onClick={() => supabase.auth.signOut()} className="text-sm text-ivory/60 hover:text-red-400">{t('admin.logout')}</button>
            </div>
          </div>
          <nav className="flex gap-1 overflow-x-auto md:flex-col">
            {links.map((l) => (
              <NavLink
                key={l.to}
                to={l.to}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-lg px-4 py-2.5 text-sm transition-colors ${isActive ? 'bg-gold/15 text-gold-light' : 'text-ivory/60 hover:bg-ivory/5 hover:text-ivory'}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="hidden flex-col gap-3 md:flex">
          <a href="/" target="_blank" rel="noreferrer" className="px-4 text-sm text-ivory/50 hover:text-gold-light">{t('admin.view_site')} ↗</a>
          <div className="px-4"><LanguageSwitcher /></div>
          <p className="truncate px-4 text-xs text-ivory/35">{session.user?.email}</p>
          <button onClick={() => supabase.auth.signOut()} className="px-4 py-2 text-left text-sm text-ivory/50 hover:text-red-400">{t('admin.logout')}</button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 px-4 py-8 sm:px-8 sm:py-10">
        <Outlet />
      </main>
    </div>
  )
}
