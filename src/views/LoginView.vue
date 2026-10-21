<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useConfigStore } from '@/stores/config'
import { useTheme } from '@/composables/useTheme'
import {
  Lock,
  User as UserIcon,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  Server,
  Sun,
  Moon,
  KeyRound
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const configStore = useConfigStore()
const { theme, toggleTheme } = useTheme()

// Form state
const loginForm = reactive({
  username_or_email: '',
  password: ''
})

const showPassword = ref(false)
const errorMessage = ref<string | null>(null)

onMounted(() => {
  if (configStore.isHealthy === null) {
    configStore.checkHealth()
  }
})

function fillDefaultCredentials() {
  loginForm.username_or_email = 'admin'
  loginForm.password = 'password123'
  errorMessage.value = null
}

async function handleLogin() {
  if (!loginForm.username_or_email || !loginForm.password) {
    errorMessage.value = 'Please provide both username/email and password.'
    return
  }

  errorMessage.value = null
  try {
    await authStore.login({
      username_or_email: loginForm.username_or_email.trim(),
      password: loginForm.password
    })
    const redirectPath = (route.query.redirect as string) || '/'
    router.push(redirectPath)
  } catch (err: any) {
    errorMessage.value = err.message || 'Invalid username/email or password.'
  }
}
</script>

<template>
  <div class="w-full flex items-center justify-center p-4">
    <!-- Background subtle glow -->
    <div class="w-full max-w-md relative">
      <div class="absolute -top-10 -left-10 size-48 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div class="absolute -bottom-10 -right-10 size-48 bg-violet-500/20 rounded-full blur-3xl pointer-events-none" />

      <!-- Card Container -->
      <div class="relative glass-card rounded-2xl border border-border/80 shadow-2xl p-6 sm:p-8 backdrop-blur-xl">
        <!-- Floating Theme Switcher -->
        <div class="absolute top-4 right-4">
          <button
            type="button"
            @click="toggleTheme"
            class="size-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-colors"
            title="Toggle Theme"
          >
            <Sun v-if="theme === 'dark'" class="size-3.5 text-amber-400" />
            <Moon v-else class="size-3.5 text-indigo-500" />
          </button>
        </div>

        <!-- Header -->
        <div class="flex flex-col items-center text-center mb-6">
          <div class="size-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 text-white mb-3">
            <Server class="size-7" />
          </div>
          <h2 class="text-2xl font-bold tracking-tight text-foreground">
            Sign In
          </h2>
          <p class="text-sm text-muted-foreground mt-1">
            Access your SMTP Agent dispatch console
          </p>
        </div>

        <!-- Feedback Alert Messages -->
        <div
          v-if="errorMessage"
          class="mb-5 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2.5 animate-in fade-in"
        >
          <AlertCircle class="size-4 shrink-0 mt-0.5" />
          <span class="flex-1 leading-relaxed">{{ errorMessage }}</span>
        </div>

        <!-- Sign In Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="block text-xs font-medium text-foreground mb-1.5">
              Username or Email
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <UserIcon class="size-4" />
              </div>
              <input
                v-model="loginForm.username_or_email"
                type="text"
                required
                autocomplete="username"
                placeholder="admin or user@example.com"
                class="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-medium text-foreground mb-1.5">
              Password
            </label>
            <div class="relative">
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground">
                <Lock class="size-4" />
              </div>
              <input
                v-model="loginForm.password"
                :type="showPassword ? 'text' : 'password'"
                required
                autocomplete="current-password"
                placeholder="••••••••"
                class="w-full pl-9 pr-10 py-2 text-sm rounded-lg bg-background border border-input focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition"
              >
                <EyeOff v-if="showPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
          </div>

          <!-- Quick Fill Credentials Button -->
          <button
            type="button"
            @click="fillDefaultCredentials"
            class="w-full py-1.5 px-3 rounded-lg border border-dashed border-border/80 text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-muted/30 text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
          >
            <KeyRound class="size-3.5 text-primary" />
            <span>Fill Default Admin Credentials (<span class="font-mono text-foreground font-medium">admin</span>)</span>
          </button>

          <button
            type="submit"
            :disabled="authStore.isLoading"
            class="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold text-sm shadow-md shadow-primary/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            <span
              v-if="authStore.isLoading"
              class="size-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin"
            />
            <LogIn v-else class="size-4" />
            <span>{{ authStore.isLoading ? 'Signing In...' : 'Sign In' }}</span>
          </button>
        </form>

        <!-- Footer Info -->
        <div class="mt-6 pt-4 border-t border-border/50 flex items-center justify-between text-xs text-muted-foreground">
          <span>Backend Server:</span>
          <div class="flex items-center gap-1.5 font-mono">
            <span
              class="size-2 rounded-full"
              :class="[
                configStore.isHealthy === true ? 'bg-emerald-400 animate-pulse' :
                configStore.isHealthy === false ? 'bg-rose-400' : 'bg-muted-foreground'
              ]"
            />
            <span class="text-foreground">{{ configStore.baseUrl }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
