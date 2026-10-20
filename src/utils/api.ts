import type { APIResponse } from '@/types/api'

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

export function getApiBaseUrl(): string {
  return localStorage.getItem('smtp_api_base_url') || import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082'
}

export function getApiKey(): string {
  return localStorage.getItem('smtp_api_key') || ''
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

  // Set X-API-Key if configured
  const apiKey = getApiKey()
  if (apiKey) {
    headers['X-API-Key'] = apiKey
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers
    })

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
