import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient, getApiBaseUrl, getApiKey } from '@/utils/api'
import type { HealthResponse } from '@/types/api'

export const useConfigStore = defineStore('config', () => {
  const baseUrl = ref(getApiBaseUrl())
  const apiKey = ref(getApiKey())
  const isHealthy = ref<boolean | null>(null)
  const latencyMs = ref<number | null>(null)
  const isCheckingHealth = ref(false)
  const healthMessage = ref<string>('')
  const lastCheckedAt = ref<Date | null>(null)

  function setBaseUrl(url: string) {
    const formatted = url.trim().replace(/\/$/, '')
    baseUrl.value = formatted
    localStorage.setItem('smtp_api_base_url', formatted)
  }

  function setApiKey(key: string) {
    const formatted = key.trim()
    apiKey.value = formatted
    localStorage.setItem('smtp_api_key', formatted)
  }

  async function checkHealth(): Promise<boolean> {
    isCheckingHealth.value = true
    const startTime = performance.now()
    try {
      const res = await apiClient<HealthResponse>('/health', {
        method: 'GET'
      })
      latencyMs.value = Math.round(performance.now() - startTime)
      isHealthy.value = res.success === true
      healthMessage.value = res.message || 'Service is healthy'
      lastCheckedAt.value = new Date()
      return true
    } catch (err: any) {
      latencyMs.value = Math.round(performance.now() - startTime)
      isHealthy.value = false
      healthMessage.value = err.message || 'Backend unreachable'
      lastCheckedAt.value = new Date()
      return false
    } finally {
      isCheckingHealth.value = false
    }
  }

  return {
    baseUrl,
    apiKey,
    isHealthy,
    latencyMs,
    isCheckingHealth,
    healthMessage,
    lastCheckedAt,
    setBaseUrl,
    setApiKey,
    checkHealth
  }
})
