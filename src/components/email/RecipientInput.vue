<script setup lang="ts">
import { ref } from 'vue'
import { X, Mail, AlertCircle } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: string[]
  placeholder?: string
  label?: string
  required?: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: string[]): void
}>()

const currentInput = ref('')
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function addEmail(emailStr: string) {
  const trimmed = emailStr.trim().replace(/[,;]$/, '')
  if (!trimmed) return

  // Split multiple if pasted
  const splitEmails = trimmed.split(/[,;\s]+/).filter(Boolean)
  const newSet = new Set([...props.modelValue, ...splitEmails])
  emit('update:modelValue', Array.from(newSet))
  currentInput.value = ''
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Enter' || e.key === ',' || e.key === ' ') {
    e.preventDefault()
    addEmail(currentInput.value)
  } else if (e.key === 'Backspace' && !currentInput.value && props.modelValue.length > 0) {
    removeEmail(props.modelValue.length - 1)
  }
}

function removeEmail(index: number) {
  const updated = [...props.modelValue]
  updated.splice(index, 1)
  emit('update:modelValue', updated)
}

function isValidEmail(email: string): boolean {
  return emailRegex.test(email)
}
</script>

<template>
  <div class="flex flex-col gap-1.5">
    <div v-if="label" class="flex items-center justify-between">
      <label class="text-xs font-semibold text-foreground">
        {{ label }} <span v-if="required" class="text-destructive">*</span>
      </label>
      <span class="text-[10px] text-muted-foreground">Press Enter or comma to add</span>
    </div>

    <div
      class="min-h-11 p-1.5 rounded-xl bg-background border border-border flex flex-wrap items-center gap-1.5 focus-within:ring-2 focus-within:ring-primary/40 focus-within:border-primary transition-all"
    >
      <!-- Email Chips -->
      <span
        v-for="(email, idx) in modelValue"
        :key="email"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-all"
        :class="[
          isValidEmail(email)
            ? 'bg-primary/10 text-primary border border-primary/25'
            : 'bg-destructive/10 text-destructive border border-destructive/30'
        ]"
      >
        <AlertCircle v-if="!isValidEmail(email)" class="size-3 text-destructive" />
        <Mail v-else class="size-3 text-primary/70" />
        <span>{{ email }}</span>
        <button
          type="button"
          @click="removeEmail(idx)"
          class="size-3.5 rounded hover:bg-black/10 dark:hover:bg-white/10 flex items-center justify-center ml-0.5"
        >
          <X class="size-2.5" />
        </button>
      </span>

      <!-- Input box -->
      <input
        v-model="currentInput"
        type="text"
        :placeholder="modelValue.length === 0 ? (placeholder || 'name@example.com') : ''"
        @keydown="handleKeyDown"
        @blur="addEmail(currentInput)"
        class="flex-1 min-w-[140px] h-8 bg-transparent px-2 text-xs text-foreground focus:outline-none font-mono"
      />
    </div>
  </div>
</template>
