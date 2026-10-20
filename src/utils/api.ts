import type { APIResponse, RefreshTokenResponse } from '@/types/api'

export class ApiError extends Error {
  statusCode: number
  backendError?: string

  constructor(message: string, statusCode: number, backendError?: string) {
    super(message)
    this.name = 'ApiError'
    this.statusCode = statusCode
    this.backendError = backendError
  }
}

export const TOKEN_STORAGE_KEY = 'smtp_access_token'
export const REFRESH_TOKEN_STORAGE_KEY = 'smtp_refresh_token'
export const USER_STORAGE_KEY = 'smtp_auth_user'

export function getApiBaseUrl(): string {
  return localStorage.getItem('smtp_api_base_url') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'
}

export function getApiKey(): string {
  return localStorage.getItem('smtp_api_key') || ''
}

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_STORAGE_KEY)
}

export function getRefreshToken(): string | null {
  return localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY)
}

export function setAuthTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(TOKEN_STORAGE_KEY, accessToken)
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken)
  }
}

export function clearAuthData(): void {
  localStorage.removeItem(TOKEN_STORAGE_KEY)
  localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY)
  localStorage.removeItem(USER_STORAGE_KEY)
}

let isRefreshing = false
let refreshSubscribers: Array<(token: string) => void> = []

function subscribeTokenRefresh(cb: (token: string) => void) {
  refreshSubscribers.push(cb)
}

function onRefreshed(token: string) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) {
    clearAuthData()
    return null
  }

  const baseUrl = getApiBaseUrl().replace(/\/$/, '')
  try {
    const res = await fetch(`${baseUrl}/api/v1/auth/refresh`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh_token: refreshToken })
    })

    if (!res.ok) {
      clearAuthData()
      return null
    }

    const data: APIResponse<RefreshTokenResponse> = await res.json()
    if (data.success && data.data?.access_token) {
      setAuthTokens(data.data.access_token, data.data.refresh_token)
      return data.data.access_token
    }

    clearAuthData()
    return null
  } catch {
    clearAuthData()
    return null
  }
}

export async function apiClient<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<APIResponse<T>> {
  const baseUrl = getApiBaseUrl().replace(/\/$/, '')
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  const url = `${baseUrl}${cleanEndpoint}`

  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...(options.headers as Record<string, string> || {})
  }

  // Set Content-Type if body is present and not already set
  if (options.body && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json'
  }

  // Attach X-API-Key if configured
  const apiKey = getApiKey()
  if (apiKey) {
    headers['X-API-Key'] = apiKey
  }

  // Attach Authorization Bearer token if available
  const accessToken = getAccessToken()
  if (accessToken && !headers['Authorization']) {
    headers['Authorization'] = `Bearer ${accessToken}`
  }

  try {
    let response = await fetch(url, {
      ...options,
      headers
    })

    // Handle 401 Unauthorized with token refresh (except for auth endpoints itself)
    const isAuthEndpoint = cleanEndpoint.startsWith('/api/v1/auth/login') ||
                           cleanEndpoint.startsWith('/api/v1/auth/register') ||
                           cleanEndpoint.startsWith('/api/v1/auth/refresh')

    if (response.status === 401 && !isAuthEndpoint && getRefreshToken()) {
      if (!isRefreshing) {
        isRefreshing = true
        const newToken = await refreshAccessToken()
        isRefreshing = false

        if (newToken) {
          onRefreshed(newToken)
          headers['Authorization'] = `Bearer ${newToken}`
          response = await fetch(url, {
            ...options,
            headers
          })
        } else {
          window.dispatchEvent(new CustomEvent('auth:expired'))
        }
      } else {
        // Wait for token refresh to finish
        const retryToken = await new Promise<string | null>((resolve) => {
          subscribeTokenRefresh((token) => resolve(token))
        })
        if (retryToken) {
          headers['Authorization'] = `Bearer ${retryToken}`
          response = await fetch(url, {
            ...options,
            headers
          })
        }
      }
    }

    const text = await response.text()
    let data: APIResponse<T>

    try {
      data = text ? JSON.parse(text) : { success: response.ok, message: response.statusText }
    } catch {
      data = {
        success: response.ok,
        message: text || response.statusText,
        error: !response.ok ? `HTTP ${response.status}` : undefined
      }
    }

    if (!response.ok || data.success === false) {
      const errMsg = data.message || `Request failed with status ${response.status}`
      throw new ApiError(errMsg, response.status, data.error)
    }

    return data
  } catch (err: any) {
    if (err instanceof ApiError) {
      throw err
    }
    // Network or CORS failure
    throw new ApiError(
      err.message || 'Unable to connect to the SMTP backend server. Please verify the service is running and CORS is allowed.',
      0
    )
  }
}

