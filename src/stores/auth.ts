import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { User, LoginRequest, AuthResponse } from '@/types/api'
import {
  apiClient,
  setAuthTokens,
  clearAuthData,
  getAccessToken,
  USER_STORAGE_KEY
} from '@/utils/api'

function getStoredUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(getAccessToken())
  const user = ref<User | null>(getStoredUser())
  const isLoading = ref<boolean>(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed<boolean>(() => Boolean(token.value))

  const userInitials = computed<string>(() => {
    if (!user.value) return 'U'
    if (user.value.name) {
      const parts = user.value.name.trim().split(/\s+/)
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      }
      return user.value.name.substring(0, 2).toUpperCase()
    }
    return user.value.username.substring(0, 2).toUpperCase()
  })

  async function login(credentials: LoginRequest): Promise<void> {
    isLoading.value = true
    error.value = null
    try {
      const res = await apiClient<AuthResponse>('/api/v1/auth/login', {
        method: 'POST',
        body: JSON.stringify(credentials)
      })

      if (res.data) {
        token.value = res.data.access_token
        user.value = res.data.user
        setAuthTokens(res.data.access_token, res.data.refresh_token)
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data.user))
      }
    } catch (err: any) {
      error.value = err.message || 'Login failed. Please check your credentials.'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function fetchMe(): Promise<User | null> {
    if (!token.value) return null
    try {
      const res = await apiClient<User>('/api/v1/auth/me', {
        method: 'GET'
      })
      if (res.data) {
        user.value = res.data
        localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(res.data))
        return res.data
      }
      return null
    } catch {
      // If fetching profile fails (e.g. invalid token), logout
      logout()
      return null
    }
  }

  function logout(): void {
    token.value = null
    user.value = null
    error.value = null
    clearAuthData()
  }

  // Handle global auth expiration event triggered by API interceptor
  if (typeof window !== 'undefined') {
    window.addEventListener('auth:expired', () => {
      logout()
    })
  }

  return {
    token,
    user,
    isLoading,
    error,
    isAuthenticated,
    userInitials,
    login,
    fetchMe,
    logout
  }
})
