<script setup lang="ts">
import { ref } from 'vue'
import type { AttachmentDTO } from '@/types/api'
import { formatBytes } from '@/utils/formatters'
import { Paperclip, UploadCloud, X, FileText } from 'lucide-vue-next'

const props = defineProps<{
  modelValue: AttachmentDTO[]
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: AttachmentDTO[]): void
}>()

const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    processFiles(Array.from(target.files))
  }
}

function handleDrop(e: DragEvent) {
  isDragging.value = false
  if (e.dataTransfer?.files) {
    processFiles(Array.from(e.dataTransfer.files))
  }
}

function processFiles(files: File[]) {
  files.forEach((file) => {
    const reader = new FileReader()
    reader.onload = () => {
      const result = reader.result as string
      // Format is data:<contentType>;base64,<data>
      const match = result.match(/^data:(.*?);base64,(.*)$/)
      const contentType = match ? match[1] : file.type || 'application/octet-stream'
      const base64Data = match ? match[2] : result

      const attachment: AttachmentDTO = {
        filename: file.name,
        content_type: contentType,
        content_base64: base64Data,
        size: file.size
      }

      emit('update:modelValue', [...props.modelValue, attachment])
    }
    reader.readAsDataURL(file)
  })
}

function removeAttachment(index: number) {
  const updated = [...props.modelValue]
  updated.splice(index, 1)
  emit('update:modelValue', updated)
}
</script>

<template>
  <div class="flex flex-col gap-2">
    <div class="flex items-center justify-between">
      <label class="text-xs font-semibold text-foreground flex items-center gap-1.5">
        <Paperclip class="size-3.5 text-muted-foreground" />
        <span>File Attachments</span>
      </label>
      <span class="text-[10px] text-muted-foreground">Automatically encoded to Base64</span>
    </div>

    <!-- Drop Zone -->
    <div
      @dragover.prevent="isDragging = true"
      @dragleave.prevent="isDragging = false"
      @drop.prevent="handleDrop"
      @click="triggerFileInput"
      class="p-4 rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 text-center"
      :class="[
        isDragging
          ? 'border-primary bg-primary/10'
          : 'border-border/80 bg-background/50 hover:bg-muted/30 hover:border-primary/50'
      ]"
    >
      <input
        ref="fileInput"
        type="file"
        multiple
        class="hidden"
        @change="handleFileSelect"
      />
      <div class="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
        <UploadCloud class="size-4" />
      </div>
      <div>
        <p class="text-xs font-semibold text-foreground">
          Click to upload or drag & drop files here
        </p>
        <p class="text-[11px] text-muted-foreground mt-0.5">
          PDF, images, ZIP archives, documents, etc.
        </p>
      </div>
    </div>

    <!-- Attachment Cards List -->
    <div v-if="modelValue.length > 0" class="flex flex-col gap-1.5 mt-1">
      <div
        v-for="(att, idx) in modelValue"
        :key="att.filename + idx"
        class="flex items-center justify-between p-2 rounded-lg bg-muted/40 border border-border/60 text-xs"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <FileText class="size-4 text-primary shrink-0" />
          <div class="min-w-0">
            <p class="font-medium text-foreground truncate max-w-[250px] sm:max-w-md">
              {{ att.filename }}
            </p>
            <p class="text-[10px] text-muted-foreground font-mono">
              {{ att.content_type }} <span v-if="att.size">• {{ formatBytes(att.size) }}</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          @click.stop="removeAttachment(idx)"
          class="size-6 rounded-md hover:bg-destructive/10 hover:text-destructive flex items-center justify-center text-muted-foreground transition-colors"
          title="Remove attachment"
        >
          <X class="size-3.5" />
        </button>
      </div>
    </div>
  </div>
</template>
