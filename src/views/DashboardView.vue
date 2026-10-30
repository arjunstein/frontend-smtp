<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useSmtpStore } from '@/stores/smtp'
import { useEmailStore } from '@/stores/email'
import SmtpFormModal from '@/components/smtp/SmtpFormModal.vue'
import SmtpTestPingModal from '@/components/smtp/SmtpTestPingModal.vue'
import type { SMTPConfig } from '@/types/api'
import { formatRelativeTime } from '@/utils/formatters'
import {
  Server,
  Activity,
  SendHorizontal,
  Plus,
  ShieldCheck,
  AlertCircle,
  Trash2,
  Mail,
  Zap
} from 'lucide-vue-next'

const configStore = useConfigStore()
const smtpStore = useSmtpStore()
const emailStore = useEmailStore()

const isAddModalOpen = ref(false)
const isPingModalOpen = ref(false)
const selectedConfigForPing = ref<SMTPConfig | null>(null)

onMounted(async () => {
  configStore.checkHealth()
  try {
    await smtpStore.fetchConfigs()
  } catch (e) {
    console.error('Failed to load initial configs', e)
  }
})

function triggerPingDefault() {
  if (smtpStore.defaultConfig) {
    selectedConfigForPing.value = smtpStore.defaultConfig
    isPingModalOpen.value = true
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Top Header & Actions -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">System Overview</h2>
        <p class="text-sm text-muted-foreground mt-0.5">
          Monitoring and centralized control for SMTP dispatch services.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          @click="isAddModalOpen = true"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm shadow-primary/25"
        >
          <Plus class="size-4" />
          <span>Add SMTP</span>
        </button>
        <RouterLink
          to="/send"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 hover:bg-indigo-500/20 transition-all flex items-center gap-2"
        >
          <SendHorizontal class="size-4" />
          <span>Send Email</span>
        </RouterLink>
      </div>
    </div>

    <!-- Alert when Backend is Offline -->
    <div
      v-if="configStore.isHealthy === false"
      class="p-4 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive text-sm flex items-start justify-between gap-4"
    >
      <div class="flex items-start gap-3">
        <AlertCircle class="size-5 shrink-0 mt-0.5" />
        <div>
          <h4 class="font-bold">Backend SMTP Service Unreachable</h4>
          <p class="text-xs text-destructive/90 mt-1 leading-relaxed">
            Cannot reach <code class="font-mono bg-destructive/20 px-1 py-0.5 rounded">{{ configStore.baseUrl }}</code>.
            Ensure the Go backend service is running on port 8082 (<code class="font-mono bg-destructive/20 px-1 py-0.5 rounded">make run</code>) or change the target URL in Settings.
          </p>
        </div>
      </div>
      <button
        @click="configStore.checkHealth()"
        class="shrink-0 px-3 py-1.5 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 text-xs font-medium"
      >
        Retry
      </button>
    </div>

    <!-- Metric Cards Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <!-- Card 1: Backend Health -->
      <div class="p-5 rounded-2xl glass-panel border border-border/80 flex flex-col justify-between">
        <div class="flex items-center justify-between text-muted-foreground">
          <span class="text-xs font-medium">Backend Service</span>
          <div
            class="size-8 rounded-lg flex items-center justify-center"
            :class="[
              configStore.isHealthy === true
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-rose-500/10 text-rose-400'
            ]"
          >
            <Activity class="size-4" />
          </div>
        </div>
        <div class="mt-3">
          <div class="flex items-center gap-2">
            <span class="text-2xl font-bold tracking-tight">
              {{ configStore.isHealthy === true ? 'Healthy' : 'Offline' }}
            </span>
          </div>
          <p class="text-xs text-muted-foreground mt-1 font-mono">
            {{ configStore.latencyMs !== null ? `${configStore.latencyMs} ms latency` : 'Waiting check...' }}
          </p>
        </div>
      </div>

      <!-- Card 2: Total SMTP Accounts -->
      <div class="p-5 rounded-2xl glass-panel border border-border/80 flex flex-col justify-between">
        <div class="flex items-center justify-between text-muted-foreground">
          <span class="text-xs font-medium">SMTP Profiles</span>
          <div class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <Server class="size-4" />
          </div>
        </div>
        <div class="mt-3">
          <span class="text-2xl font-bold tracking-tight">{{ smtpStore.configCount }}</span>
          <p class="text-xs text-muted-foreground mt-1">
            {{ smtpStore.activeConfigs.length }} active profiles ready to dispatch
          </p>
        </div>
      </div>

      <!-- Card 3: Default Mailer -->
      <div class="p-5 rounded-2xl glass-panel border border-border/80 flex flex-col justify-between">
        <div class="flex items-center justify-between text-muted-foreground">
          <span class="text-xs font-medium">Default Dispatcher</span>
          <div class="size-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <ShieldCheck class="size-4" />
          </div>
        </div>
        <div class="mt-3">
          <span class="text-base font-bold tracking-tight truncate block">
            {{ smtpStore.defaultConfig ? smtpStore.defaultConfig.name : 'None Selected' }}
          </span>
          <p class="text-xs text-muted-foreground mt-1 font-mono truncate">
            {{ smtpStore.defaultConfig ? `${smtpStore.defaultConfig.host}:${smtpStore.defaultConfig.port}` : 'No default set' }}
          </p>
        </div>
      </div>

      <!-- Card 4: Quick Ping Default -->
      <div class="p-5 rounded-2xl glass-panel border border-border/80 flex flex-col justify-between">
        <div class="flex items-center justify-between text-muted-foreground">
          <span class="text-xs font-medium">Quick Connection Test</span>
          <div class="size-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
            <Zap class="size-4" />
          </div>
        </div>
        <div class="mt-3">
          <button
            @click="triggerPingDefault"
            :disabled="!smtpStore.defaultConfig"
            class="w-full py-2 px-3 rounded-xl bg-background border border-border/80 hover:bg-muted/60 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all disabled:opacity-40"
          >
            <Activity class="size-3.5 text-primary" />
            <span>Test Default SMTP</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Active Configurations & Dispatch History Section -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left 2 Cols: Active SMTP Profiles List -->
      <div class="lg:col-span-2 flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-base tracking-tight">Configured SMTP Accounts</h3>
            <p class="text-xs text-muted-foreground">Active mail server connections registered in the database.</p>
          </div>
        </div>

        <div v-if="smtpStore.isLoading" class="p-8 text-center text-xs text-muted-foreground">
          Loading configurations...
        </div>

        <div v-else-if="smtpStore.configs.length === 0" class="p-8 rounded-2xl glass-panel text-center flex flex-col items-center gap-3">
          <div class="size-12 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
            <Server class="size-6" />
          </div>
          <div>
            <p class="font-semibold text-sm">No SMTP profiles registered</p>
            <p class="text-xs text-muted-foreground mt-0.5">Register your first SMTP account to start dispatching emails.</p>
          </div>
          <button
            @click="isAddModalOpen = true"
            class="px-4 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 mt-1"
          >
            Register Account
          </button>
        </div>

        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div
            v-for="cfg in smtpStore.configs"
            :key="cfg.id"
            class="p-4 rounded-2xl glass-panel border border-border/80 flex flex-col justify-between gap-3 transition-all hover:border-primary/40 group"
          >
            <div>
              <div class="flex items-start justify-between gap-2">
                <span class="font-bold text-sm text-foreground truncate block">
                  {{ cfg.name }}
                </span>
                <span
                  v-if="cfg.is_default"
                  class="shrink-0 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25"
                >
                  Default
                </span>
              </div>
              <p class="text-xs font-mono text-muted-foreground mt-1 truncate">
                {{ cfg.host }}:{{ cfg.port }}
              </p>
              <p class="text-xs text-muted-foreground mt-0.5 truncate">
                From: {{ cfg.from_email }}
              </p>
            </div>

            <div class="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
              <span class="text-[11px] font-mono px-2 py-0.5 rounded bg-muted/60 text-muted-foreground">
                {{ cfg.encryption }}
              </span>
              <button
                @click="selectedConfigForPing = cfg; isPingModalOpen = true"
                class="px-2.5 py-1 rounded-lg border border-border/60 hover:bg-muted/80 text-[11px] font-medium flex items-center gap-1 transition-colors"
              >
                <Activity class="size-3 text-indigo-400" />
                <span>Ping</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Right 1 Col: Recent Dispatch History -->
      <div class="flex flex-col gap-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="font-bold text-base tracking-tight">Dispatch History</h3>
            <p class="text-xs text-muted-foreground">Local session email activity log.</p>
          </div>
          <button
            v-if="emailStore.history.length > 0"
            @click="emailStore.clearHistory()"
            class="text-[11px] text-muted-foreground hover:text-destructive flex items-center gap-1"
            title="Clear history"
          >
            <Trash2 class="size-3" />
            <span>Clear</span>
          </button>
        </div>

        <div
          v-if="emailStore.history.length === 0"
          class="p-8 rounded-2xl glass-panel text-center flex flex-col items-center gap-2 text-muted-foreground"
        >
          <Mail class="size-8 opacity-40" />
          <p class="text-xs">No emails dispatched in this session yet.</p>
        </div>

        <div v-else class="flex flex-col gap-2 max-h-[420px] overflow-y-auto pr-1">
          <div
            v-for="item in emailStore.history"
            :key="item.id"
            class="p-3 rounded-xl bg-card/60 border border-border/60 text-xs flex flex-col gap-1.5"
          >
            <div class="flex items-center justify-between">
              <span
                class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
                :class="[
                  item.status === 'SUCCESS'
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/25'
                ]"
              >
                {{ item.status }}
              </span>
              <span class="text-[10px] text-muted-foreground font-mono">
                {{ formatRelativeTime(item.timestamp) }}
              </span>
            </div>

            <p class="font-semibold text-foreground truncate">
              {{ item.subject }}
            </p>

            <div class="text-[11px] text-muted-foreground truncate font-mono">
              To: {{ item.recipients.join(', ') }}
            </div>

            <p v-if="item.error" class="text-[10px] text-rose-400 font-mono mt-0.5 truncate">
              Error: {{ item.error }}
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- Modals -->
    <SmtpFormModal
      :is-open="isAddModalOpen"
      @close="isAddModalOpen = false"
      @saved="smtpStore.fetchConfigs()"
    />
    <SmtpTestPingModal
      :is-open="isPingModalOpen"
      :config="selectedConfigForPing"
      @close="isPingModalOpen = false"
    />
  </div>
</template>
