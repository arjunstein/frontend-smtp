<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useSmtpStore } from '@/stores/smtp'
import {
  LayoutDashboard,
  ServerCog,
  SendHorizontal,
  Settings,
  ShieldCheck,
  AlertCircle
} from 'lucide-vue-next'

const route = useRoute()
const smtpStore = useSmtpStore()

const navItems = [
  {
    name: 'Dashboard',
    path: '/',
    icon: LayoutDashboard,
    badge: null
  },
  {
    name: 'SMTP Configs',
    path: '/configs',
    icon: ServerCog,
    badge: computed(() => (smtpStore.configCount ? `${smtpStore.configCount}` : null))
  },
  {
    name: 'Email Studio',
    path: '/send',
    icon: SendHorizontal,
    badge: null
  },
  {
    name: 'Settings',
    path: '/settings',
    icon: Settings,
    badge: null
  }
]
</script>

<template>
  <aside class="w-full lg:w-64 shrink-0 flex flex-col justify-between border-b lg:border-b-0 lg:border-r border-border/70 bg-card/40 p-4">
    <!-- Navigation List -->
    <nav class="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible pb-2 lg:pb-0">
      <RouterLink
        v-for="item in navItems"
        :key="item.path"
        :to="item.path"
        class="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group whitespace-nowrap"
        :class="[
          route.path === item.path
            ? 'bg-primary text-primary-foreground shadow-sm shadow-primary/20'
            : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
        ]"
      >
        <div class="flex items-center gap-3">
          <component
            :is="item.icon"
            class="size-4 shrink-0 transition-transform group-hover:scale-110"
          />
          <span>{{ item.name }}</span>
        </div>

        <span
          v-if="item.badge?.value"
          class="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full"
          :class="[
            route.path === item.path
              ? 'bg-primary-foreground/20 text-primary-foreground'
              : 'bg-muted text-muted-foreground'
          ]"
        >
          {{ item.badge.value }}
        </span>
      </RouterLink>
    </nav>

    <!-- Bottom Status Card: Default SMTP Summary -->
    <div class="hidden lg:block pt-4 mt-auto border-t border-border/60">
      <div class="p-3.5 rounded-xl bg-muted/40 border border-border/50 text-xs">
        <div class="flex items-center justify-between mb-2">
          <span class="text-muted-foreground font-medium flex items-center gap-1.5">
            <ShieldCheck class="size-3.5 text-indigo-400" />
            Default Mailer
          </span>
          <span
            v-if="smtpStore.defaultConfig"
            class="size-2 rounded-full bg-emerald-400 animate-pulse"
          />
        </div>

        <div v-if="smtpStore.defaultConfig">
          <p class="font-semibold text-foreground truncate">
            {{ smtpStore.defaultConfig.name }}
          </p>
          <p class="text-[11px] text-muted-foreground font-mono truncate">
            {{ smtpStore.defaultConfig.host }}:{{ smtpStore.defaultConfig.port }}
          </p>
        </div>
        <div v-else class="text-muted-foreground text-[11px] flex items-center gap-1">
          <AlertCircle class="size-3 text-amber-400" />
          <span>No default SMTP set</span>
        </div>
      </div>
    </div>
  </aside>
</template>
