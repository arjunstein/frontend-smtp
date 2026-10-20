<script setup lang="ts">
import { onMounted } from 'vue'
import { useConfigStore } from '@/stores/config'
import { useTheme } from '@/composables/useTheme'
import {
  Server,
  Sun,
  Moon,
  RefreshCw,
  Sliders,
  ExternalLink
} from 'lucide-vue-next'

const configStore = useConfigStore()
const { theme, toggleTheme } = useTheme()

onMounted(() => {
  if (configStore.isHealthy === null) {
    configStore.checkHealth()
  }
})
</script>

<template>
  <header class="glass-nav sticky top-0 z-40 h-16 w-full flex items-center justify-between px-4 lg:px-8">
    <div class="flex items-center gap-3">
      <div class="size-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white font-bold text-lg tracking-wider">
        <Server class="size-5" />
      </div>
      <div>
        <div class="flex items-center gap-2">
          <h1 class="font-bold text-base tracking-tight">SMTP Agent</h1>
          <span class="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-primary/10 text-primary border border-primary/20">
            Console
          </span>
        </div>
        <p class="text-xs text-muted-foreground hidden sm:block">Centralized Email Dispatch Engine</p>
      </div>
    </div>

    <!-- Right Controls -->
    <div class="flex items-center gap-2 sm:gap-4">
      <!-- Health Check Badge -->
      <button
        @click="configStore.checkHealth()"
        :disabled="configStore.isCheckingHealth"
        class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
        :class="[
          configStore.isHealthy === true
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
            : configStore.isHealthy === false
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
            : 'bg-muted text-muted-foreground border-border hover:bg-muted/80'
        ]"
        title="Klik untuk ping ulang server backend"
      >
        <span
          class="size-2 rounded-full"
          :class="[
            configStore.isHealthy === true ? 'bg-emerald-400 animate-pulse' :
            configStore.isHealthy === false ? 'bg-rose-400' : 'bg-muted-foreground'
          ]"
        />
        <span>
          {{
            configStore.isCheckingHealth
              ? 'Checking...'
              : configStore.isHealthy === true
              ? `Online (${configStore.latencyMs}ms)`
              : configStore.isHealthy === false
              ? 'Offline'
              : 'Unknown'
          }}
        </span>
        <RefreshCw class="size-3" :class="{ 'animate-spin': configStore.isCheckingHealth }" />
      </button>

      <!-- Target API Indicator -->
      <RouterLink
        to="/settings"
        class="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 rounded-lg border border-border/60 hover:bg-muted/50 transition-colors"
      >
        <Sliders class="size-3.5 text-primary" />
        <span class="max-w-[150px] truncate">{{ configStore.baseUrl }}</span>
      </RouterLink>

      <!-- Swagger link -->
      <a
        :href="`${configStore.baseUrl}/documentation/index.html`"
        target="_blank"
        rel="noopener noreferrer"
        class="hidden lg:flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded transition-colors"
        title="Buka Swagger API Docs"
      >
        <span>Docs</span>
        <ExternalLink class="size-3" />
      </a>

      <!-- Theme Switcher -->
      <button
        @click="toggleTheme"
        class="size-9 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        aria-label="Toggle theme"
      >
        <Sun v-if="theme === 'dark'" class="size-4 text-amber-400" />
        <Moon v-else class="size-4 text-indigo-500" />
      </button>
    </div>
  </header>
</template>
