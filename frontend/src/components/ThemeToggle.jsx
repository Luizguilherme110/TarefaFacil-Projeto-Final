import { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const [temaEscuro, setTemaEscuro] = useState(() => {
    try {
      const saved = localStorage.getItem('theme')
      if (saved) return saved === 'dark'
      return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    } catch (e) {
      return false
    }
  })

  useEffect(() => {
    if (temaEscuro) document.documentElement.classList.add('dark')
    else document.documentElement.classList.remove('dark')
  }, [temaEscuro])

  const toggle = () => {
    const novo = !temaEscuro
    setTemaEscuro(novo)
    try { localStorage.setItem('theme', novo ? 'dark' : 'light') } catch (e) {}
  }

  return (
    <button
      onClick={toggle}
      aria-label="Alternar tema"
      className="fixed top-4 left-4 z-50 p-2 rounded-full bg-white shadow-md dark:bg-gray-800 hover:scale-105 transition-transform"
    >
      {temaEscuro ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
    </button>
  )
}
