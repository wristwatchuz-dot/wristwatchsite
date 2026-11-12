import { lazy, Suspense, useCallback, useState } from 'react'
import { Navigate, Route, Routes, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import IntroLoader, { INTRO_SEEN_KEY, shouldSkipIntro } from './components/IntroLoader.jsx'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'
import PageTransition from './components/PageTransition.jsx'
import RouteCurtain from './components/RouteCurtain.jsx'
import Home from './pages/Home.jsx'
import Catalog from './pages/Catalog.jsx'
import ProductDetail from './pages/ProductDetail.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import NotFound from './pages/NotFound.jsx'

// Admin kodi faqat admin sahifasiga kirilganda yuklanadi (mijozlar uchun sayt yengil qoladi)
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin.jsx'))
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout.jsx'))
const AdminStats = lazy(() => import('./pages/admin/AdminStats.jsx'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts.jsx'))
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders.jsx'))

export default function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')

  // Kirish videosi faqat bosh sahifaga kirilganda va sessiyada bir marta ko'rsatiladi
  const [introDone, setIntroDone] = useState(() => isAdmin || location.pathname !== '/' || shouldSkipIntro())
  const finishIntro = useCallback(() => {
    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, '1')
    } catch {
      /* ignore */
    }
    setIntroDone(true)
  }, [])

  if (isAdmin) {
    return (
      <Suspense fallback={<div className="min-h-screen bg-ink" />}>
        <Routes>
          <Route path="/admin" element={<AdminLogin />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard" element={<AdminStats />} />
            <Route path="/admin/products" element={<AdminProducts />} />
            <Route path="/admin/orders" element={<AdminOrders />} />
          </Route>
          <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </Suspense>
    )
  }

  return (
    <>
      <AnimatePresence>{!introDone && <IntroLoader key="intro" onFinish={finishIntro} />}</AnimatePresence>

      {introDone && (
        <>
          <RouteCurtain />
          <Navbar />
          <AnimatePresence mode="wait" onExitComplete={() => window.scrollTo(0, 0)}>
            <Routes location={location} key={location.pathname}>
              <Route path="/" element={<PageTransition><Home /></PageTransition>} />
              <Route path="/catalog" element={<PageTransition><Catalog /></PageTransition>} />
              <Route path="/product/:id" element={<PageTransition><ProductDetail /></PageTransition>} />
              <Route path="/about" element={<PageTransition><About /></PageTransition>} />
              <Route path="/contact" element={<PageTransition><Contact /></PageTransition>} />
              <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
            </Routes>
          </AnimatePresence>
          <Footer />
        </>
      )}
    </>
  )
}
