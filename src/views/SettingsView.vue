<script setup lang="ts">
import { ref } from 'vue'
import { useConfigStore } from '@/stores/config'
import {
  Key,
  Globe,
  CheckCircle2,
  ExternalLink,
  Server,
  RefreshCw,
  Save
} from 'lucide-vue-next'

const configStore = useConfigStore()

const inputUrl = ref(configStore.baseUrl)
const inputKey = ref(configStore.apiKey)
const showKey = ref(false)
const saveSuccess = ref(false)

function handleSave() {
  configStore.setBaseUrl(inputUrl.value)
  configStore.setApiKey(inputKey.value)
  saveSuccess.value = true
  configStore.checkHealth()
  setTimeout(() => {
    saveSuccess.value = false
  }, 3000)
}
</script>

<template>
  <div class="flex flex-col gap-6 max-w-4xl">
    <!-- Header -->
    <div>
      <h2 class="text-2xl font-bold tracking-tight">Connection Settings</h2>
      <p class="text-sm text-muted-foreground mt-0.5">
        Atur target endpoint REST API dan kredensial autentikasi API Key backend.
      </p>
    </div>

    <!-- Save Success Alert -->
    <div
      v-if="saveSuccess"
      class="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs flex items-center gap-2.5 transition-all"
    >
      <CheckCircle2 class="size-4 shrink-0" />
      <span>Pengaturan berhasil disimpan dan koneksi backend diperbarui!</span>
    </div>

    <!-- Settings Card -->
    <div class="p-6 rounded-2xl glass-panel border border-border/80 flex flex-col gap-6">
      <form @submit.prevent="handleSave" class="flex flex-col gap-5">
        <!-- Backend API Base URL -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-foreground flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <Globe class="size-3.5 text-muted-foreground" />
              Backend API Base URL
            </span>
            <span class="text-[11px] text-muted-foreground font-mono">Default: http://localhost:8082</span>
          </label>
          <input
            v-model="inputUrl"
            type="text"
            required
            placeholder="http://localhost:8082"
            class="h-10 px-3 rounded-xl bg-background border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
          <p class="text-[11px] text-muted-foreground">
            Alamat server backend Go. Jika backend berjalan di port lain atau container berbeda, sesuaikan di sini.
          </p>
        </div>

        <!-- API Key -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-foreground flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <Key class="size-3.5 text-muted-foreground" />
              API Key (Header X-API-Key)
            </span>
            <span class="text-[11px] text-muted-foreground">Opsional jika server bypass auth</span>
          </label>
          <div class="relative">
            <input
              v-model="inputKey"
              :type="showKey ? 'text' : 'password'"
              placeholder="Masukkan API Key yang sesuai dengan .env backend"
              class="w-full h-10 px-3 pr-20 rounded-xl bg-background border border-border text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button
              type="button"
              @click="showKey = !showKey"
              class="absolute right-3 top-2.5 text-xs text-muted-foreground hover:text-foreground font-medium"
            >
              {{ showKey ? 'Hide' : 'Show' }}
            </button>
          </div>
          <p class="text-[11px] text-muted-foreground">
            Jika variabel <code>API_KEY</code> di file <code>.env</code> backend diisi, masukkan nilai yang sama di sini agar request tidak 401 Unauthorized.
          </p>
        </div>

        <!-- Save button -->
        <div class="flex items-center justify-between pt-3 border-t border-border/60">
          <button
            type="button"
            @click="configStore.checkHealth()"
            :disabled="configStore.isCheckingHealth"
            class="px-4 py-2 rounded-xl text-xs font-medium border border-border/70 hover:bg-muted/50 transition-colors flex items-center gap-2"
          >
            <RefreshCw class="size-3.5" :class="{ 'animate-spin': configStore.isCheckingHealth }" />
            <span>Ping Backend (/health)</span>
          </button>

          <button
            type="submit"
            class="px-5 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm shadow-primary/25"
          >
            <Save class="size-4" />
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>

    <!-- Backend Architecture Info & Docs -->
    <div class="p-6 rounded-2xl glass-panel border border-border/80 flex flex-col gap-4">
      <h3 class="font-bold text-sm flex items-center gap-2">
        <Server class="size-4 text-indigo-400" />
        <span>Tentang SMTP Agent Backend</span>
      </h3>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <div class="p-3 rounded-xl bg-muted/30 border border-border/60 flex flex-col gap-1">
          <span class="text-muted-foreground font-medium">Swagger Documentation</span>
          <a
            :href="`${configStore.baseUrl}/documentation/index.html`"
            target="_blank"
            rel="noopener noreferrer"
            class="text-primary font-medium flex items-center gap-1 hover:underline mt-1"
          >
            <span>Buka /documentation/index.html</span>
            <ExternalLink class="size-3" />
          </a>
        </div>

        <div class="p-3 rounded-xl bg-muted/30 border border-border/60 flex flex-col gap-1">
          <span class="text-muted-foreground font-medium">Health Check Endpoint</span>
          <span class="font-mono text-foreground font-semibold mt-1">GET /health</span>
        </div>
      </div>
    </div>
  </div>
</template>
