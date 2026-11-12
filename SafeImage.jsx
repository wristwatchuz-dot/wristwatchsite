import { useEffect, useState } from 'react'
import logo from '../assets/logo.png'

// Rasm bo'lmasa yoki yuklanmasa — chiroyli "logo" o'rnini bosuvchi blok ko'rsatiladi (buzilgan rasm belgisi emas).
export default function SafeImage({ src, alt = '', className = '', eager = false }) {
  const [failed, setFailed] = useState(false)
  useEffect(() => setFailed(false), [src])

  if (!src || failed) {
    return (
      <div className={`flex items-center justify-center bg-paper ${className}`} role="img" aria-label={alt}>
        <img src={logo} alt="" className="h-1/4 w-1/4 object-contain opacity-30" />
      </div>
    )
  }
  return (
    <img
      src={src}
      alt={alt}
      loading={eager ? 'eager' : 'lazy'}
      decoding="async"
      onError={() => setFailed(true)}
      className={className}
    />
  )
}
