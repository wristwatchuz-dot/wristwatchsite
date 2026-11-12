import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { MotionConfig } from 'framer-motion'
import App from './App.jsx'
import { LangProvider } from './i18n/index.jsx'
import '@fontsource/inter/latin-400.css'
import '@fontsource/inter/latin-500.css'
import '@fontsource/inter/latin-600.css'
import '@fontsource/inter/latin-ext-400.css'
import '@fontsource/inter/latin-ext-500.css'
import '@fontsource/inter/latin-ext-600.css'
import '@fontsource/inter/cyrillic-400.css'
import '@fontsource/inter/cyrillic-500.css'
import '@fontsource/inter/cyrillic-600.css'
import '@fontsource/cormorant-garamond/latin-400.css'
import '@fontsource/cormorant-garamond/latin-500.css'
import '@fontsource/cormorant-garamond/latin-600.css'
import '@fontsource/cormorant-garamond/latin-ext-400.css'
import '@fontsource/cormorant-garamond/latin-ext-500.css'
import '@fontsource/cormorant-garamond/latin-ext-600.css'
import '@fontsource/cormorant-garamond/cyrillic-400.css'
import '@fontsource/cormorant-garamond/cyrillic-500.css'
import '@fontsource/cormorant-garamond/cyrillic-600.css'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <LangProvider>
        {/* Foydalanuvchi qurilmasida "animatsiyani kamaytirish" yoqilgan bo'lsa, harakatlar avtomatik soddalashadi */}
        <MotionConfig reducedMotion="user">
          <App />
        </MotionConfig>
      </LangProvider>
    </BrowserRouter>
  </React.StrictMode>
)
