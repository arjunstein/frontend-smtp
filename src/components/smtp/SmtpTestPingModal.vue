<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSmtpStore } from '@/stores/smtp'
import type { SMTPConfig } from '@/types/api'
import {
  X,
  Activity,
  CheckCircle2,
  AlertCircle,
  RefreshCw
} from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  config?: SMTPConfig | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const smtpStore = useSmtpStore()

const isTesting = ref(false)
const testResult = ref<{
  success: boolean
  latency: number
  message: string
} | null>(null)

async function runTest() {
  if (!props.config) return
  isTesting.value = true
  testResult.value = null
  try {
    const res = await smtpStore.testConnection(props.config.id)
    testResult.value = res
  } finally {
    isTesting.value = false
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open && props.config) {
      runTest()
    } else {
      testResult.value = null
    }
  }
)
</script>

<template>
  <div
    v-if="isOpen && config"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
  >
    <div
      class="w-full max-w-lg rounded-2xl glass-panel shadow-2xl p-6 border border-border/80 flex flex-col gap-5"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-3 border-b border-border/60">
        <div class="flex items-center gap-2.5">
          <div class="size-8 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center">
            <Activity class="size-4" />
          </div>
          <div>
            <h2 class="text-base font-bold tracking-tight">Diagnostic SMTP Connection Ping</h2>
            <p class="text-xs text-muted-foreground">{{ config.name }} (#{{ config.id }})</p>
          </div>
        </div>
        <button
          @click="emit('close')"
          class="size-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <X class="size-4" />
        </button>
      </div>

      <!-- Config Details Panel -->
      <div class="p-3.5 rounded-xl bg-muted/40 border border-border/60 text-xs flex flex-col gap-2 font-mono">
        <div class="flex justify-between items-center text-muted-foreground">
          <span>Host & Port:</span>
          <span class="text-foreground font-semibold">{{ config.host }}:{{ config.port }}</span>
        </div>
        <div class="flex justify-between items-center text-muted-foreground">
          <span>Encryption:</span>
          <span class="text-foreground font-semibold">{{ config.encryption }}</span>
        </div>
        <div class="flex justify-between items-center text-muted-foreground">
          <span>User:</span>
          <span class="text-foreground truncate max-w-[200px]">{{ config.username }}</span>
        </div>
      </div>

      <!-- Active Testing State -->
      <div
        v-if="isTesting"
        class="py-8 flex flex-col items-center justify-center gap-3 text-center"
      >
        <RefreshCw class="size-8 text-primary animate-spin" />
        <div>
          <p class="text-sm font-semibold">Menguji Koneksi & Handshake TLS...</p>
          <p class="text-xs text-muted-foreground mt-0.5">Membuka socket TCP ke {{ config.host }}:{{ config.port }}</p>
        </div>
      </div>

      <!-- Result State -->
      <div v-else-if="testResult" class="flex flex-col gap-4">
        <!-- Success Card -->
        <div
          v-if="testResult.success"
          class="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex flex-col gap-2"
        >
          <div class="flex items-center gap-2">
            <CheckCircle2 class="size-5 shrink-0" />
            <h3 class="text-sm font-bold">Koneksi Berhasil (CONNECTED)</h3>
          </div>
          <p class="text-xs text-emerald-300/90 leading-relaxed">
            {{ testResult.message }}
          </p>
          <div class="pt-2 mt-2 border-t border-emerald-500/20 flex items-center justify-between text-xs text-emerald-400/80 font-mono">
            <span>Handshake Roundtrip:</span>
            <span class="font-bold">{{ testResult.latency }} ms</span>
          </div>
        </div>

        <!-- Failure Card -->
        <div
          v-else
          class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 flex flex-col gap-2"
        >
          <div class="flex items-center gap-2">
            <AlertCircle class="size-5 shrink-0" />
            <h3 class="text-sm font-bold">Koneksi / Otentikasi Gagal</h3>
          </div>
          <p class="text-xs text-rose-300/90 leading-relaxed font-mono whitespace-pre-wrap break-all">
            {{ testResult.message }}
          </p>
          <div class="pt-2 mt-2 border-t border-rose-500/20 flex items-center justify-between text-xs text-rose-400/80 font-mono">
            <span>Time Elapsed:</span>
            <span class="font-bold">{{ testResult.latency }} ms</span>
          </div>
        </div>
      </div>

      <!-- Footer Actions -->
      <div class="flex items-center justify-end gap-3 pt-3 border-t border-border/60">
        <button
          type="button"
          @click="emit('close')"
          class="px-4 py-2 rounded-xl text-xs font-medium border border-border/70 hover:bg-muted/50 transition-colors"
        >
          Tutup
        </button>
        <button
          type="button"
          @click="runTest"
          :disabled="isTesting"
          class="px-4 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-1.5 disabled:opacity-50"
        >
          <RefreshCw class="size-3.5" :class="{ 'animate-spin': isTesting }" />
          <span>Ping Ulang</span>
        </button>
      </div>
    </div>
  </div>
</template>
