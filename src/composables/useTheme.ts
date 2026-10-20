import { ref, onMounted } from 'vue'

export type ThemeMode = 'dark' | 'light'

const currentTheme = ref<ThemeMode>('dark')

export function useTheme() {
  function applyTheme(theme: ThemeMode) {
    currentTheme.value = theme
    localStorage.setItem('smtp_theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  function toggleTheme() {
    applyTheme(currentTheme.value === 'dark' ? 'light' : 'dark')
  }

  onMounted(() => {
    const saved = localStorage.getItem('smtp_theme') as ThemeMode | null
    if (saved) {
      applyTheme(saved)
    } else {
      applyTheme('dark')
    }
  })

  return {
    theme: currentTheme,
    toggleTheme,
    applyTheme
  }
}
