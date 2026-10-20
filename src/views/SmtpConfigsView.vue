<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSmtpStore } from '@/stores/smtp'
import type { SMTPConfig } from '@/types/api'
import SmtpFormModal from '@/components/smtp/SmtpFormModal.vue'
import SmtpTestPingModal from '@/components/smtp/SmtpTestPingModal.vue'
import {
  Plus,
  Search,
  Server,
  Activity,
  Edit2,
  Trash2,
  Star,
  AlertCircle,
  RefreshCw,
  ShieldCheck
} from 'lucide-vue-next'

const smtpStore = useSmtpStore()

const searchQuery = ref('')
const filterStatus = ref<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL')

// Modals
const isFormModalOpen = ref(false)
const editingConfig = ref<SMTPConfig | null>(null)
const isPingModalOpen = ref(false)
const testingConfig = ref<SMTPConfig | null>(null)

// Delete confirm dialog
const deletingConfig = ref<SMTPConfig | null>(null)
const isDeleting = ref(false)

onMounted(() => {
  smtpStore.fetchConfigs()
})

const filteredConfigs = computed(() => {
  return smtpStore.configs.filter((cfg) => {
    // Filter status
    if (filterStatus.value === 'ACTIVE' && !cfg.is_active) return false
    if (filterStatus.value === 'INACTIVE' && cfg.is_active) return false

    // Search query
    if (!searchQuery.value.trim()) return true
    const q = searchQuery.value.toLowerCase()
    return (
      cfg.name.toLowerCase().includes(q) ||
      cfg.host.toLowerCase().includes(q) ||
      cfg.username.toLowerCase().includes(q) ||
      cfg.from_email.toLowerCase().includes(q)
    )
  })
})

function openCreateModal() {
  editingConfig.value = null
  isFormModalOpen.value = true
}

function openEditModal(cfg: SMTPConfig) {
  editingConfig.value = cfg
  isFormModalOpen.value = true
}

function openPingModal(cfg: SMTPConfig) {
  testingConfig.value = cfg
  isPingModalOpen.value = true
}

async function handleSetDefault(cfg: SMTPConfig) {
  if (cfg.is_default) return
  try {
    await smtpStore.setDefaultConfig(cfg.id)
  } catch (e: any) {
    alert(e.message || 'Failed to update default SMTP')
  }
}

async function confirmDelete() {
  if (!deletingConfig.value) return
  isDeleting.value = true
  try {
    await smtpStore.deleteConfig(deletingConfig.value.id)
    deletingConfig.value = null
  } catch (e: any) {
    alert(e.message || 'Failed to delete configuration')
  } finally {
    isDeleting.value = false
  }
}
</script>

<template>
  <div class="flex flex-col gap-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 class="text-2xl font-bold tracking-tight">SMTP Configurations</h2>
        <p class="text-sm text-muted-foreground mt-0.5">
          Manage integrated SMTP credentials and mail server endpoints.
        </p>
      </div>

      <div class="flex items-center gap-2.5">
        <button
          @click="smtpStore.fetchConfigs()"
          :disabled="smtpStore.isLoading"
          class="size-9 rounded-xl border border-border/80 flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-colors"
          title="Refresh data"
        >
          <RefreshCw class="size-4" :class="{ 'animate-spin': smtpStore.isLoading }" />
        </button>
        <button
          @click="openCreateModal"
          class="px-4 py-2 rounded-xl text-xs font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all flex items-center gap-2 shadow-sm shadow-primary/25"
        >
          <Plus class="size-4" />
          <span>Add New Account</span>
        </button>
      </div>
    </div>

    <!-- Filter and Search Bar -->
    <div class="flex flex-col sm:flex-row gap-3 items-center justify-between">
      <!-- Search Input -->
      <div class="relative w-full sm:w-80">
        <Search class="size-4 text-muted-foreground absolute left-3 top-3" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Search name, host, email..."
          class="w-full h-10 pl-9 pr-3 rounded-xl bg-background border border-border text-xs focus:outline-none focus:ring-2 focus:ring-primary/40 font-mono"
        />
      </div>

      <!-- Status Tabs -->
      <div class="flex items-center gap-1.5 p-1 rounded-xl bg-muted/40 border border-border/60 self-start sm:self-auto">
        <button
          type="button"
          @click="filterStatus = 'ALL'"
          class="px-3 py-1 rounded-lg text-xs font-medium transition-all"
          :class="[
            filterStatus === 'ALL'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          All ({{ smtpStore.configs.length }})
        </button>
        <button
          type="button"
          @click="filterStatus = 'ACTIVE'"
          class="px-3 py-1 rounded-lg text-xs font-medium transition-all"
          :class="[
            filterStatus === 'ACTIVE'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          Active
        </button>
        <button
          type="button"
          @click="filterStatus = 'INACTIVE'"
          class="px-3 py-1 rounded-lg text-xs font-medium transition-all"
          :class="[
            filterStatus === 'INACTIVE'
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          ]"
        >
          Inactive
        </button>
      </div>
    </div>

    <!-- Empty State -->
    <div
      v-if="!smtpStore.isLoading && filteredConfigs.length === 0"
      class="p-12 rounded-2xl glass-panel text-center flex flex-col items-center justify-center gap-3"
    >
      <div class="size-12 rounded-xl bg-muted/60 flex items-center justify-center text-muted-foreground">
        <Server class="size-6" />
      </div>
      <div>
        <p class="font-semibold text-sm">No configurations found</p>
        <p class="text-xs text-muted-foreground mt-0.5">
          {{ searchQuery ? 'No results matched your search query.' : 'No SMTP accounts registered in the database yet.' }}
        </p>
      </div>
      <button
        v-if="!searchQuery"
        @click="openCreateModal"
        class="px-4 py-2 rounded-xl text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 mt-2"
      >
        Add Now
      </button>
    </div>

    <!-- Configurations Table -->
    <div v-else class="overflow-x-auto rounded-2xl glass-panel border border-border/80 shadow-sm">
      <table class="w-full text-left border-collapse text-xs">
        <thead>
          <tr class="border-b border-border/70 bg-muted/30 text-muted-foreground font-semibold">
            <th class="py-3.5 px-4">Name & Provider</th>
            <th class="py-3.5 px-4 font-mono">Host & Port</th>
            <th class="py-3.5 px-4 font-mono">Username</th>
            <th class="py-3.5 px-4">Sender (From)</th>
            <th class="py-3.5 px-4">Encryption</th>
            <th class="py-3.5 px-4 text-center">Status</th>
            <th class="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-border/60">
          <tr
            v-for="cfg in filteredConfigs"
            :key="cfg.id"
            class="hover:bg-muted/30 transition-colors group"
          >
            <!-- Name & Default Badge -->
            <td class="py-3.5 px-4">
              <div class="flex items-center gap-2">
                <span class="font-bold text-sm text-foreground">{{ cfg.name }}</span>
                <span
                  v-if="cfg.is_default"
                  class="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 flex items-center gap-1"
                >
                  <ShieldCheck class="size-3" />
                  Default
                </span>
              </div>
              <p class="text-[10px] text-muted-foreground font-mono mt-0.5">ID: #{{ cfg.id }}</p>
            </td>

            <!-- Host & Port -->
            <td class="py-3.5 px-4 font-mono text-foreground font-medium">
              {{ cfg.host }}:{{ cfg.port }}
            </td>

            <!-- Username -->
            <td class="py-3.5 px-4 font-mono text-muted-foreground truncate max-w-[180px]">
              {{ cfg.username }}
            </td>

            <!-- From Email & Name -->
            <td class="py-3.5 px-4">
              <p class="font-medium text-foreground truncate max-w-[180px]">{{ cfg.from_name || '-' }}</p>
              <p class="text-[11px] font-mono text-muted-foreground truncate max-w-[180px]">{{ cfg.from_email }}</p>
            </td>

            <!-- Encryption -->
            <td class="py-3.5 px-4">
              <span class="font-mono text-[11px] px-2 py-0.5 rounded bg-muted/60 text-muted-foreground border border-border/50">
                {{ cfg.encryption }}
              </span>
            </td>

            <!-- Status -->
            <td class="py-3.5 px-4 text-center">
              <span
                class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium"
                :class="[
                  cfg.is_active
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    : 'bg-muted text-muted-foreground border border-border/60'
                ]"
              >
                <span
                  class="size-1.5 rounded-full"
                  :class="cfg.is_active ? 'bg-emerald-400' : 'bg-muted-foreground'"
                />
                {{ cfg.is_active ? 'Active' : 'Inactive' }}
              </span>
            </td>

            <!-- Action Buttons -->
            <td class="py-3.5 px-4 text-right">
              <div class="flex items-center justify-end gap-1.5">
                <!-- Ping Connection Button -->
                <button
                  @click="openPingModal(cfg)"
                  class="px-2.5 py-1 rounded-lg border border-border/70 hover:bg-indigo-500/10 hover:text-indigo-400 hover:border-indigo-500/30 text-[11px] font-medium transition-colors flex items-center gap-1"
                  title="Test SMTP connection"
                >
                  <Activity class="size-3 text-indigo-400" />
                  <span>Test</span>
                </button>

                <!-- Set Default Button -->
                <button
                  v-if="!cfg.is_default"
                  @click="handleSetDefault(cfg)"
                  class="p-1.5 rounded-lg border border-border/70 hover:bg-muted/80 text-muted-foreground hover:text-amber-400 transition-colors"
                  title="Set as default SMTP"
                >
                  <Star class="size-3.5" />
                </button>

                <!-- Edit Button -->
                <button
                  @click="openEditModal(cfg)"
                  class="p-1.5 rounded-lg border border-border/70 hover:bg-muted/80 text-muted-foreground hover:text-foreground transition-colors"
                  title="Edit configuration"
                >
                  <Edit2 class="size-3.5" />
                </button>

                <!-- Delete Button -->
                <button
                  @click="deletingConfig = cfg"
                  class="p-1.5 rounded-lg border border-border/70 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                  title="Delete configuration"
                >
                  <Trash2 class="size-3.5" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modals -->
    <SmtpFormModal
      :is-open="isFormModalOpen"
      :edit-config="editingConfig"
      @close="isFormModalOpen = false"
      @saved="smtpStore.fetchConfigs()"
    />

    <SmtpTestPingModal
      :is-open="isPingModalOpen"
      :config="testingConfig"
      @close="isPingModalOpen = false"
    />

    <!-- Delete Confirmation Modal -->
    <div
      v-if="deletingConfig"
      class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm"
    >
      <div class="w-full max-w-md rounded-2xl glass-panel shadow-2xl p-6 border border-border/80 flex flex-col gap-4">
        <div class="flex items-center gap-3 text-destructive">
          <div class="size-10 rounded-xl bg-destructive/10 flex items-center justify-center">
            <AlertCircle class="size-5" />
          </div>
          <div>
            <h3 class="font-bold text-base">Delete SMTP Configuration?</h3>
            <p class="text-xs text-muted-foreground">This action cannot be undone.</p>
          </div>
        </div>

        <p class="text-xs text-foreground/90 leading-relaxed">
          Are you sure you want to delete <b>{{ deletingConfig.name }}</b> (<code class="font-mono text-muted-foreground">{{ deletingConfig.host }}:{{ deletingConfig.port }}</code>)?
        </p>

        <div class="flex items-center justify-end gap-2.5 pt-2 border-t border-border/60">
          <button
            @click="deletingConfig = null"
            class="px-4 py-2 rounded-xl text-xs font-medium border border-border/70 hover:bg-muted/50"
          >
            Cancel
          </button>
          <button
            @click="confirmDelete"
            :disabled="isDeleting"
            class="px-4 py-2 rounded-xl text-xs font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
          >
            {{ isDeleting ? 'Deleting...' : 'Yes, Delete' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
