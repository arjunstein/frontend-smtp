<script setup lang="ts">
import AppNavbar from '@/components/layout/AppNavbar.vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
</script>

<template>
  <div class="min-h-screen bg-background text-foreground flex flex-col font-sans selection:bg-primary/20 selection:text-primary">
    <!-- Navbar -->
    <AppNavbar />

    <!-- Main App Body -->
    <div class="flex-1 flex flex-col lg:flex-row">
      <!-- Sidebar -->
      <AppSidebar />

      <!-- Content Area -->
      <main class="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
        <RouterView v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </RouterView>
      </main>
    </div>
  </div>
</template>

<style>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
