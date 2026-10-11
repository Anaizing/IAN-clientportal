import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'dark' | 'light'

export function ThemeToggle({ admin = false }: { admin?: boolean }) {
  const storageKey = admin ? 'ian-admin-theme' : 'ian-client-theme'
  const [theme, setTheme] = useState<Theme>(() => {
    const savedTheme = localStorage.getItem(storageKey)
    return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : admin ? 'light' : 'dark'
  })
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem(storageKey, theme) }, [storageKey, theme])
  return <button className={admin ? 'theme-toggle admin-theme-toggle' : 'theme-toggle'} type="button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}<span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button>
}
