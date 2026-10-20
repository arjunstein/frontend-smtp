<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSmtpStore } from '@/stores/smtp'
import { useEmailStore } from '@/stores/email'
import type { AttachmentDTO, SendEmailRequest, SendEmailResponse } from '@/types/api'
import RecipientInput from '@/components/email/RecipientInput.vue'
import AttachmentUploader from '@/components/email/AttachmentUploader.vue'
import { formatDate } from '@/utils/formatters'
import {
  SendHorizontal,
  Server,
  Sparkles,
  Eye,
  Code2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  FileCheck
} from 'lucide-vue-next'

const smtpStore = useSmtpStore()
const emailStore = useEmailStore()

// Form state
const selectedSmtpId = ref<number | undefined>(undefined)
const toRecipients = ref<string[]>([])
const ccRecipients = ref<string[]>([])
const bccRecipients = ref<string[]>([])
const subject = ref('')
const body = ref('')
const isHtml = ref(true)
const attachments = ref<AttachmentDTO[]>([])

// View state
const activeTab = ref<'EDIT' | 'PREVIEW'>('EDIT')
const showCcBcc = ref(false)
const dispatchResult = ref<SendEmailResponse | null>(null)
const dispatchError = ref<string | null>(null)

onMounted(() => {
  smtpStore.fetchConfigs()
})

// Sample quick templates
function loadVerificationTemplate() {
  subject.value = 'Your Account Security Verification Code'
  isHtml.value = true
  body.value = `<div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff; color: #1e293b;">
  <h2 style="color: #4f46e5; margin-bottom: 8px;">Account Verification</h2>
  <p style="font-size: 14px; line-height: 1.5; color: #475569;">Use the following one-time code to complete your login authentication:</p>
  <div style="background-color: #f1f5f9; padding: 16px; border-radius: 8px; text-align: center; margin: 24px 0;">
    <span style="font-family: monospace; font-size: 28px; font-weight: bold; letter-spacing: 4px; color: #1e1b4b;">839214</span>
  </div>
  <p style="font-size: 12px; color: #94a3b8;">This code is valid for 10 minutes. Do not share this code with anyone.</p>
</div>`
}

function loadPlainTemplate() {
  subject.value = 'System Notification (Plain Text)'
  isHtml.value = false
  body.value = `Hello,\n\nThis is a test message dispatched through the Centralized SMTP Service.\nThe server is connected and ready to relay emails for your application.\n\nBest regards,\nAdministrator Team`
}

async function handleSend() {
  dispatchResult.value = null
  dispatchError.value = null

  if (toRecipients.value.length === 0) {
    dispatchError.value = 'At least one recipient (To) is required.'
    return
  }
  if (!subject.value.trim()) {
    dispatchError.value = 'Subject line is required.'
    return
  }
  if (!body.value.trim()) {
    dispatchError.value = 'Email message body cannot be empty.'
    return
  }

  const payload: SendEmailRequest = {
    smtp_config_id: selectedSmtpId.value,
    to: toRecipients.value,
    cc: ccRecipients.value.length > 0 ? ccRecipients.value : undefined,
    bcc: bccRecipients.value.length > 0 ? bccRecipients.value : undefined,
    subject: subject.value,
    body: body.value,
    is_html: isHtml.value,
    attachments: attachments.value.length > 0 ? attachments.value : undefined
  }

  try {
    const result = await emailStore.sendEmail(payload)
    dispatchResult.value = result
  } catch (err: any) {
    dispatchError.value = err.backendError || err.message || 'Failed to send email'
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">Email Dispatch Studio</h2>
        <p class="text-sm text-muted-foreground mt-0.5">
          Simulate and test the centralized email dispatch endpoint (<code class="font-mono text-xs">POST /api/v1/emails/send</code>).
        </p>
      </div>

      <!-- Quick Template Presets -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-muted-foreground hidden sm:inline">Templates:</span>
        <button
          type="button"
          @click="loadVerificationTemplate"
          class="px-3 py-1.5 rounded-xl border border-border/80 hover:bg-muted/60 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <Sparkles class="size-3 text-indigo-400" />
          <span>HTML OTP</span>
        </button>
        <button
          type="button"
          @click="loadPlainTemplate"
          class="px-3 py-1.5 rounded-xl border border-border/80 hover:bg-muted/60 text-xs font-medium flex items-center gap-1.5 transition-colors"
        >
          <span>Plain Text</span>
        </button>
      </div>
    </div>

    <!-- Success Result Banner -->
    <div
      v-if="dispatchResult"
      class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex flex-col gap-2.5 transition-all"
    >
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <CheckCircle2 class="size-5 shrink-0" />
          <h3 class="font-bold text-sm">Email Sent Successfully (Status: {{ dispatchResult.status }})</h3>
        </div>
        <span class="text-[11px] font-mono text-emerald-300">
          {{ formatDate(dispatchResult.sent_at) }}
        </span>
      </div>
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-emerald-300/90 font-mono pt-1">
        <div>
          <span class="text-emerald-400/70">SMTP Server:</span> {{ dispatchResult.smtp_name }} (#{{ dispatchResult.smtp_config_id }})
        </div>
        <div>
          <span class="text-emerald-400/70">Recipients:</span> {{ dispatchResult.recipients.join(', ') }}
        </div>
        <div class="truncate">
          <span class="text-emerald-400/70">Subject:</span> {{ dispatchResult.subject }}
        </div>
      </div>
    </div>

    <!-- Error Banner -->
    <div
      v-if="dispatchError"
      class="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-3"
    >
      <AlertCircle class="size-5 shrink-0 mt-0.5" />
      <div>
        <p class="font-bold text-sm">Failed to Send Email</p>
        <p class="mt-1 font-mono whitespace-pre-wrap leading-relaxed">{{ dispatchError }}</p>
      </div>
    </div>

    <!-- Main Composer Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2 Cols: Email Composer Form -->
      <div class="lg:col-span-2 rounded-2xl glass-panel p-5 border border-border/80 flex flex-col gap-5">
        <!-- SMTP Selection -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-foreground flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <Server class="size-3.5 text-muted-foreground" />
              SMTP Routing Profile
            </span>
            <span class="text-[11px] text-muted-foreground">Optional smtp_config_id</span>
          </label>

          <select
            v-model="selectedSmtpId"
            class="h-10 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium"
          >
            <option :value="undefined">
              (Automatic) Default Active System Mailer
              <template v-if="smtpStore.defaultConfig">
                — {{ smtpStore.defaultConfig.name }}
              </template>
            </option>
            <option
              v-for="cfg in smtpStore.configs"
              :key="cfg.id"
              :value="cfg.id"
            >
              #{{ cfg.id }} — {{ cfg.name }} ({{ cfg.host }}:{{ cfg.port }}) {{ cfg.is_default ? '★ DEFAULT' : '' }}
            </option>
          </select>
        </div>

        <!-- Recipients: To -->
        <RecipientInput
          v-model="toRecipients"
          label="Primary Recipients (To)"
          placeholder="recipient@example.com"
          :required="true"
        />

        <!-- CC / BCC Toggle -->
        <div>
          <button
            type="button"
            @click="showCcBcc = !showCcBcc"
            class="text-xs text-primary font-medium hover:underline"
          >
            {{ showCcBcc ? 'Hide CC & BCC' : '+ Add CC & BCC' }}
          </button>
        </div>

        <div v-if="showCcBcc" class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          <RecipientInput
            v-model="ccRecipients"
            label="Carbon Copy (CC)"
            placeholder="cc@example.com"
          />
          <RecipientInput
            v-model="bccRecipients"
            label="Blind Carbon Copy (BCC)"
            placeholder="bcc@example.com"
          />
        </div>

        <!-- Subject Line -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-foreground">
            Subject Line <span class="text-destructive">*</span>
          </label>
          <input
            v-model="subject"
            type="text"
            required
            placeholder="e.g. Monthly Statement / Account Security Alert"
            class="h-10 px-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <!-- Format Toggle & Content Mode -->
        <div class="flex flex-col gap-2">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <label class="text-xs font-semibold text-foreground">Message Body</label>
              <!-- Plain vs HTML toggle -->
              <label class="flex items-center gap-2 cursor-pointer text-xs text-muted-foreground select-none">
                <input
                  type="checkbox"
                  v-model="isHtml"
                  class="size-3.5 rounded text-primary focus:ring-primary/40 border-border"
                />
                <span :class="{ 'text-foreground font-semibold': isHtml }">HTML Format</span>
              </label>
            </div>

            <!-- Tab switcher for Edit vs Live Preview -->
            <div class="flex items-center gap-1 p-0.5 rounded-lg bg-muted/60 border border-border/60">
              <button
                type="button"
                @click="activeTab = 'EDIT'"
                class="px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1"
                :class="[
                  activeTab === 'EDIT'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                ]"
              >
                <Code2 class="size-3" />
                <span>Editor</span>
              </button>
              <button
                type="button"
                @click="activeTab = 'PREVIEW'"
                class="px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1"
                :class="[
                  activeTab === 'PREVIEW'
                    ? 'bg-background text-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground'
                ]"
              >
                <Eye class="size-3" />
                <span>Live Preview</span>
              </button>
            </div>
          </div>

          <!-- Body Textarea or Preview -->
          <div v-if="activeTab === 'EDIT'">
            <textarea
              v-model="body"
              rows="10"
              placeholder="Write your email body here or paste HTML markup..."
              class="w-full p-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono resize-y leading-relaxed"
            />
          </div>

          <div
            v-else
            class="min-h-[220px] max-h-[380px] overflow-y-auto p-4 rounded-xl bg-white text-zinc-900 border border-border/80 shadow-inner"
          >
            <div v-if="isHtml" v-html="body" />
            <pre v-else class="font-sans whitespace-pre-wrap text-xs text-zinc-800">{{ body || '(Empty content)' }}</pre>
          </div>
        </div>

        <!-- Attachments Component -->
        <AttachmentUploader v-model="attachments" />

        <!-- Submit Button -->
        <div class="flex items-center justify-between pt-4 border-t border-border/60">
          <span class="text-[11px] text-muted-foreground font-mono">
            {{ toRecipients.length }} recipient(s) • {{ attachments.length }} attachment(s)
          </span>
          <button
            type="button"
            @click="handleSend"
            :disabled="emailStore.isSending"
            class="px-6 py-2.5 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-md shadow-primary/25 disabled:opacity-50"
          >
            <RefreshCw v-if="emailStore.isSending" class="size-4 animate-spin" />
            <SendHorizontal v-else class="size-4" />
            <span>{{ emailStore.isSending ? 'Sending via SMTP...' : 'Send Email' }}</span>
          </button>
        </div>
      </div>

      <!-- Right 1 Col: Dispatch Diagnostics & Payload Inspector -->
      <div class="flex flex-col gap-4">
        <div class="p-5 rounded-2xl glass-panel border border-border/80 flex flex-col gap-4">
          <h3 class="font-bold text-sm flex items-center gap-2">
            <FileCheck class="size-4 text-indigo-400" />
            <span>JSON Payload Inspector</span>
          </h3>
          <p class="text-xs text-muted-foreground">
            Dispatched JSON payload structure for <code class="font-mono text-primary">POST /api/v1/emails/send</code>:
          </p>

          <pre class="p-3 rounded-xl bg-muted/50 border border-border/60 text-[11px] font-mono overflow-x-auto text-muted-foreground leading-relaxed max-h-80">{{
            JSON.stringify(
              {
                smtp_config_id: selectedSmtpId,
                to: toRecipients,
                cc: ccRecipients.length ? ccRecipients : undefined,
                bcc: bccRecipients.length ? bccRecipients : undefined,
                subject: subject || 'Subject...',
                is_html: isHtml,
                body: body ? (body.length > 50 ? body.substring(0, 50) + '...' : body) : '',
                attachments: attachments.map(a => ({ filename: a.filename, content_type: a.content_type, size: a.size }))
              },
              null,
              2
            )
          }}</pre>
        </div>

        <div class="p-4 rounded-2xl bg-muted/30 border border-border/60 text-xs text-muted-foreground flex flex-col gap-2">
          <p class="font-semibold text-foreground">💡 Dispatch Notes:</p>
          <ul class="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
            <li>If <code>smtp_config_id</code> is omitted, the backend automatically uses the active default SMTP configuration.</li>
            <li>Real-time structured logging can be observed directly on stdout in the Go backend terminal.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>
