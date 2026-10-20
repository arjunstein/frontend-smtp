import { defineStore } from 'pinia'
import { ref } from 'vue'
import { apiClient } from '@/utils/api'
import type { SendEmailRequest, SendEmailResponse, DispatchHistoryItem } from '@/types/api'

export const useEmailStore = defineStore('email', () => {
  const isSending = ref(false)
  const lastResult = ref<SendEmailResponse | null>(null)
  const history = ref<DispatchHistoryItem[]>(loadHistory())

  function loadHistory(): DispatchHistoryItem[] {
    try {
      const stored = localStorage.getItem('smtp_dispatch_history')
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  function saveHistory() {
    try {
      localStorage.setItem('smtp_dispatch_history', JSON.stringify(history.value.slice(0, 30)))
    } catch (e) {
      console.error('Failed to save history', e)
    }
  }

  async function sendEmail(payload: SendEmailRequest): Promise<SendEmailResponse> {
    isSending.value = true
    try {
      const res = await apiClient<SendEmailResponse>('/api/v1/emails/send', {
        method: 'POST',
        body: JSON.stringify(payload)
      })

      lastResult.value = res.data!

      // Log into local history
      history.value.unshift({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        recipients: res.data?.recipients || payload.to,
        subject: res.data?.subject || payload.subject,
        smtpName: res.data?.smtp_name || (payload.smtp_config_id ? `Config #${payload.smtp_config_id}` : 'Default SMTP'),
        status: 'SUCCESS'
      })
      saveHistory()

      return res.data!
    } catch (err: any) {
      history.value.unshift({
        id: Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toISOString(),
        recipients: payload.to,
        subject: payload.subject,
        smtpName: payload.smtp_config_id ? `Config #${payload.smtp_config_id}` : 'Default SMTP',
        status: 'FAILED',
        error: err.backendError || err.message
      })
      saveHistory()
      throw err
    } finally {
      isSending.value = false
    }
  }

  function clearHistory() {
    history.value = []
    localStorage.removeItem('smtp_dispatch_history')
  }

  return {
    isSending,
    lastResult,
    history,
    sendEmail,
    clearHistory
  }
})
