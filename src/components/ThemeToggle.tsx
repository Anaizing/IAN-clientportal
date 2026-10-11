import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'

type Theme = 'dark' | 'light'

export function ThemeToggle({ admin = false }: { admin?: boolean }) {
  const [theme, setTheme] = useState<Theme>(() => (localStorage.getItem('ian-theme') as Theme) || (admin ? 'light' : 'dark'))
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem('ian-theme', theme) }, [theme])
  return <button className={admin ? 'theme-toggle admin-theme-toggle' : 'theme-toggle'} type="button" aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`} onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}<span>{theme === 'dark' ? 'Light' : 'Dark'}</span></button>
}
