<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useConfigStore } from '@/stores/config'
import { useAuthStore } from '@/stores/auth'
import { useTheme } from '@/composables/useTheme'
import {
  Server,
  Sun,
  Moon,
  RefreshCw,
  LogOut,
  LogIn
} from 'lucide-vue-next'

const router = useRouter()
const configStore = useConfigStore()
const authStore = useAuthStore()
const { theme, toggleTheme } = useTheme()

onMounted(() => {
  if (configStore.isHealthy === null) {
    configStore.checkHealth()
  }
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
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
    <div class="flex items-center gap-2 sm:gap-3">
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
        title="Click to re-ping backend server"
      >
        <span
          class="size-2 rounded-full"
          :class="[
            configStore.isHealthy === true ? 'bg-emerald-400 animate-pulse' :
            configStore.isHealthy === false ? 'bg-rose-400' : 'bg-muted-foreground'
          ]"
        />
        <span class="hidden sm:inline">
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

      <!-- Theme Switcher -->
      <button
        @click="toggleTheme"
        class="size-9 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
        aria-label="Toggle theme"
      >
        <Sun v-if="theme === 'dark'" class="size-4 text-amber-400" />
        <Moon v-else class="size-4 text-indigo-500" />
      </button>

      <!-- Auth User Pill or Sign In Button -->
      <template v-if="authStore.isAuthenticated && authStore.user">
        <div class="flex items-center gap-2 pl-1 border-l border-border/60">
          <div class="flex items-center gap-2 px-2.5 py-1 rounded-full bg-muted/50 border border-border/50 text-xs">
            <div class="size-6 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-[10px] flex items-center justify-center shadow-sm">
              {{ authStore.userInitials }}
            </div>
            <div class="hidden sm:block text-left leading-tight">
              <span class="font-semibold block text-foreground truncate max-w-[120px]">
                {{ authStore.user.name || authStore.user.username }}
              </span>
            </div>
          </div>

          <button
            @click="handleLogout"
            title="Sign Out"
            class="size-9 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-colors"
            aria-label="Sign Out"
          >
            <LogOut class="size-4" />
          </button>
        </div>
      </template>

      <template v-else>
        <RouterLink
          to="/login"
          class="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-xs shadow-sm transition"
        >
          <LogIn class="size-3.5" />
          <span>Sign In</span>
        </RouterLink>
      </template>
    </div>
  </header>
</template>

