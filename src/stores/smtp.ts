import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { apiClient } from '@/utils/api'
import type {
  SMTPConfig,
  CreateSMTPConfigRequest,
  UpdateSMTPConfigRequest,
  TestConnectionResponse
} from '@/types/api'

export const useSmtpStore = defineStore('smtp', () => {
  const configs = ref<SMTPConfig[]>([])
  const isLoading = ref(false)
  const isTesting = ref<Record<number, boolean>>({})
  const error = ref<string | null>(null)

  const defaultConfig = computed(() => configs.value.find((c) => c.is_default))
  const activeConfigs = computed(() => configs.value.filter((c) => c.is_active))
  const configCount = computed(() => configs.value.length)

  async function fetchConfigs() {
    isLoading.value = true
    error.value = null
    try {
      const res = await apiClient<SMTPConfig[]>('/api/v1/smtp-configs', {
        method: 'GET'
      })
      configs.value = res.data || []
    } catch (err: any) {
      error.value = err.message || 'Failed to fetch SMTP configurations'
      throw err
    } finally {
      isLoading.value = false
    }
  }

  async function createConfig(payload: CreateSMTPConfigRequest): Promise<SMTPConfig> {
    isLoading.value = true
    try {
      const res = await apiClient<SMTPConfig>('/api/v1/smtp-configs', {
        method: 'POST',
        body: JSON.stringify(payload)
      })
      await fetchConfigs()
      return res.data!
    } finally {
      isLoading.value = false
    }
  }

  async function updateConfig(id: number, payload: UpdateSMTPConfigRequest): Promise<SMTPConfig> {
    isLoading.value = true
    try {
      const res = await apiClient<SMTPConfig>(`/api/v1/smtp-configs/${id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      })
      await fetchConfigs()
      return res.data!
    } finally {
      isLoading.value = false
    }
  }

  async function deleteConfig(id: number): Promise<void> {
    isLoading.value = true
    try {
      await apiClient(`/api/v1/smtp-configs/${id}`, {
        method: 'DELETE'
      })
      configs.value = configs.value.filter((c) => c.id !== id)
    } finally {
      isLoading.value = false
    }
  }

  async function setDefaultConfig(id: number): Promise<void> {
    isLoading.value = true
    try {
      await apiClient(`/api/v1/smtp-configs/${id}/default`, {
        method: 'PUT'
      })
      // Update local state atomically
      configs.value = configs.value.map((c) => ({
        ...c,
        is_default: c.id === id
      }))
    } finally {
      isLoading.value = false
    }
  }

  async function testConnection(id: number): Promise<{ success: boolean; latency: number; message: string }> {
    isTesting.value[id] = true
    const start = performance.now()
    try {
      const res = await apiClient<TestConnectionResponse>(`/api/v1/smtp-configs/${id}/test`, {
        method: 'POST'
      })
      const latency = Math.round(performance.now() - start)
      return {
        success: true,
        latency,
        message: res.message || 'SMTP Connection & Authentication Verified Successfully'
      }
    } catch (err: any) {
      const latency = Math.round(performance.now() - start)
      return {
        success: false,
        latency,
        message: err.message || (err.backendError ? `${err.message}: ${err.backendError}` : 'SMTP connection failed')
      }
    } finally {
      isTesting.value[id] = false
    }
  }

  return {
    configs,
    isLoading,
    isTesting,
    error,
    defaultConfig,
    activeConfigs,
    configCount,
    fetchConfigs,
    createConfig,
    updateConfig,
    deleteConfig,
    setDefaultConfig,
    testConnection
  }
})
