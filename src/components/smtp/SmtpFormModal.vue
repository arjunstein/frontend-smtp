<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useSmtpStore } from '@/stores/smtp'
import type { SMTPConfig, EncryptionType } from '@/types/api'
import {
  X,
  Eye,
  EyeOff,
  Sparkles,
  AlertCircle
} from 'lucide-vue-next'

const props = defineProps<{
  isOpen: boolean
  editConfig?: SMTPConfig | null
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'saved', config: SMTPConfig): void
}>()

const smtpStore = useSmtpStore()

const isEditing = computed(() => !!props.editConfig)
const showPassword = ref(false)
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

// Form fields
const name = ref('')
const host = ref('')
const port = ref<number>(587)
const username = ref('')
const password = ref('')
const from_email = ref('')
const from_name = ref('')
const encryption = ref<EncryptionType>('STARTTLS')
const is_active = ref(true)
const is_default = ref(false)

// Presets
const presets = [
  { label: 'Gmail', host: 'smtp.gmail.com', port: 587, encryption: 'STARTTLS' as const },
  { label: 'Mailtrap', host: 'smtp.mailtrap.io', port: 2525, encryption: 'STARTTLS' as const },
  { label: 'SendGrid', host: 'smtp.sendgrid.net', port: 587, encryption: 'STARTTLS' as const },
  { label: 'Amazon SES', host: 'email-smtp.us-east-1.amazonaws.com', port: 587, encryption: 'STARTTLS' as const },
  { label: 'Local Dev (MailHog)', host: 'localhost', port: 1025, encryption: 'NONE' as const },
]

function applyPreset(p: typeof presets[0]) {
  host.value = p.host
  port.value = p.port
  encryption.value = p.encryption
  if (!name.value) {
    name.value = `${p.label} Service`
  }
}

watch(
  () => props.isOpen,
  (open) => {
    if (open) {
      errorMessage.value = null
      showPassword.value = false
      if (props.editConfig) {
        name.value = props.editConfig.name
        host.value = props.editConfig.host
        port.value = props.editConfig.port
        username.value = props.editConfig.username
        password.value = '' // Don't prefill password for security
        from_email.value = props.editConfig.from_email
        from_name.value = props.editConfig.from_name
        encryption.value = props.editConfig.encryption
        is_active.value = props.editConfig.is_active
        is_default.value = props.editConfig.is_default
      } else {
        // Reset defaults for Create
        name.value = ''
        host.value = ''
        port.value = 587
        username.value = ''
        password.value = ''
        from_email.value = ''
        from_name.value = ''
        encryption.value = 'STARTTLS'
        is_active.value = true
        is_default.value = smtpStore.configCount === 0
      }
    }
  }
)

async function handleSubmit() {
  errorMessage.value = null

  // Validation
  if (!name.value.trim()) {
    errorMessage.value = 'Nama konfigurasi wajib diisi'
    return
  }
  if (!host.value.trim()) {
    errorMessage.value = 'Host SMTP wajib diisi'
    return
  }
  if (!port.value || port.value <= 0 || port.value > 65535) {
    errorMessage.value = 'Port harus di antara 1 dan 65535'
    return
  }
  if (!username.value.trim()) {
    errorMessage.value = 'Username SMTP wajib diisi'
    return
  }
  if (!isEditing.value && !password.value.trim()) {
    errorMessage.value = 'Password SMTP wajib diisi'
    return
  }
  if (!from_email.value.trim()) {
    errorMessage.value = 'From Email wajib diisi'
    return
  }

  isSubmitting.value = true

  try {
    let result: SMTPConfig

    if (isEditing.value && props.editConfig) {
      const updatePayload: any = {
        name: name.value,
        host: host.value,
        port: port.value,
        username: username.value,
        from_email: from_email.value,
        from_name: from_name.value,
        encryption: encryption.value,
        is_active: is_active.value,
        is_default: is_default.value
      }
      if (password.value) {
        updatePayload.password = password.value
      }
      result = await smtpStore.updateConfig(props.editConfig.id, updatePayload)
    } else {
      result = await smtpStore.createConfig({
        name: name.value,
        host: host.value,
        port: port.value,
        username: username.value,
        password: password.value,
        from_email: from_email.value,
        from_name: from_name.value,
        encryption: encryption.value,
        is_active: is_active.value,
        is_default: is_default.value
      })
    }

    emit('saved', result)
    emit('close')
  } catch (err: any) {
    errorMessage.value = err.backendError || err.message || 'Gagal menyimpan konfigurasi'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
  >
    <div
      class="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl glass-panel shadow-2xl p-6 border border-border/80 flex flex-col gap-6"
    >
      <!-- Header -->
      <div class="flex items-center justify-between pb-4 border-b border-border/60">
        <div>
          <h2 class="text-lg font-bold tracking-tight">
            {{ isEditing ? 'Edit Konfigurasi SMTP' : 'Tambah Akun SMTP Baru' }}
          </h2>
          <p class="text-xs text-muted-foreground mt-0.5">
            {{ isEditing ? `Mengubah parameter untuk #${editConfig?.id} (${editConfig?.name})` : 'Daftarkan server SMTP untuk relay dispatch email.' }}
          </p>
        </div>
        <button
          @click="emit('close')"
          class="size-8 rounded-lg border border-border/60 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
        >
          <X class="size-4" />
        </button>
      </div>

      <!-- Presets bar (Create only) -->
      <div v-if="!isEditing" class="flex flex-col gap-2 p-3 rounded-xl bg-muted/40 border border-border/60">
        <span class="text-xs font-semibold text-muted-foreground flex items-center gap-1.5">
          <Sparkles class="size-3.5 text-indigo-400" />
          Quick Server Presets:
        </span>
        <div class="flex flex-wrap gap-2">
          <button
            v-for="p in presets"
            :key="p.label"
            type="button"
            @click="applyPreset(p)"
            class="text-xs px-2.5 py-1 rounded-lg bg-background hover:bg-primary/10 hover:text-primary hover:border-primary/40 border border-border/70 transition-all font-medium"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <!-- Error message banner -->
      <div
        v-if="errorMessage"
        class="p-3.5 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive text-xs flex items-start gap-2.5"
      >
        <AlertCircle class="size-4 shrink-0 mt-0.5" />
        <div>
          <p class="font-semibold">Validasi / Server Error</p>
          <p class="mt-0.5">{{ errorMessage }}</p>
        </div>
      </div>

      <!-- Form Inputs -->
      <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
        <!-- Name -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-semibold text-foreground">Nama Konfigurasi <span class="text-destructive">*</span></label>
          <input
            v-model="name"
            type="text"
            required
            placeholder="cth: Transactional Mailer (Gmail)"
            class="h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>

        <!-- Host & Port & Encryption -->
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div class="sm:col-span-1.5 flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-foreground">Host SMTP <span class="text-destructive">*</span></label>
            <input
              v-model="host"
              type="text"
              required
              placeholder="smtp.example.com"
              class="h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-foreground">Port <span class="text-destructive">*</span></label>
            <input
              v-model.number="port"
              type="number"
              required
              min="1"
              max="65535"
              placeholder="587"
              class="h-10 px-3 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-foreground">Encryption</label>
            <select
              v-model="encryption"
              class="h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
            >
              <option value="STARTTLS">STARTTLS (Port 587)</option>
              <option value="SSL">SSL (Port 465)</option>
              <option value="TLS">TLS</option>
              <option value="NONE">NONE (Port 25 / Local)</option>
            </select>
          </div>
        </div>

        <!-- Credentials -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-foreground">Username / User Auth <span class="text-destructive">*</span></label>
            <input
              v-model="username"
              type="text"
              required
              placeholder="no-reply@domain.com"
              class="h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <div class="flex items-center justify-between">
              <label class="text-xs font-semibold text-foreground">
                Password / App Token
                <span v-if="!isEditing" class="text-destructive">*</span>
              </label>
              <span v-if="isEditing" class="text-[10px] text-muted-foreground">(Kosongkan jika tidak diubah)</span>
            </div>
            <div class="relative">
              <input
                v-model="password"
                :type="showPassword ? 'text' : 'password'"
                :required="!isEditing"
                placeholder="••••••••••••"
                class="w-full h-10 px-3 pr-10 rounded-xl bg-background border border-border text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/40"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                <EyeOff v-if="showPassword" class="size-4" />
                <Eye v-else class="size-4" />
              </button>
            </div>
          </div>
        </div>

        <!-- Sender Details -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-foreground">From Email <span class="text-destructive">*</span></label>
            <input
              v-model="from_email"
              type="email"
              required
              placeholder="notification@domain.com"
              class="h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
          <div class="flex flex-col gap-1.5">
            <label class="text-xs font-semibold text-foreground">From Name (Display Name)</label>
            <input
              v-model="from_name"
              type="text"
              placeholder="cth: Customer Support"
              class="h-10 px-3 rounded-xl bg-background border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
          </div>
        </div>

        <!-- Toggles: is_active and is_default -->
        <div class="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label class="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              v-model="is_active"
              class="size-4 rounded border-border text-primary focus:ring-primary/40"
            />
            <div>
              <span class="text-xs font-semibold block">Status Aktif</span>
              <span class="text-[11px] text-muted-foreground">Izinkan pengiriman melalui profil ini</span>
            </div>
          </label>

          <label class="flex items-center gap-3 p-3 rounded-xl bg-muted/30 border border-border/50 cursor-pointer hover:bg-muted/50 transition-colors">
            <input
              type="checkbox"
              v-model="is_default"
              class="size-4 rounded border-border text-primary focus:ring-primary/40"
            />
            <div>
              <span class="text-xs font-semibold block">Jadikan Default Server</span>
              <span class="text-[11px] text-muted-foreground">Dipakai otomatis jika request email tanpa ID</span>
            </div>
          </label>
        </div>

        <!-- Footer Buttons -->
        <div class="flex items-center justify-end gap-3 pt-4 border-t border-border/60">
          <button
            type="button"
            @click="emit('close')"
            class="px-4 py-2 rounded-xl text-xs font-medium border border-border/70 hover:bg-muted/50 transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="px-5 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm shadow-primary/25 disabled:opacity-50"
          >
            <span v-if="isSubmitting">Menyimpan...</span>
            <span v-else>{{ isEditing ? 'Perbarui Konfigurasi' : 'Daftarkan SMTP' }}</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
