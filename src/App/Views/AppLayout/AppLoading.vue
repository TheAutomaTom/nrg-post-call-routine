<template>
  <transition name="app-loading-fade">
    <div v-if="app$.IsLoading" class="app-loading-overlay">
      <div class="spin-shell">
        <n-spin size="large">
          <template #description>Loading...</template>
        </n-spin>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { useAppState } from '@/Core/States/app-state';

const app$ = useAppState();
</script>

<style scoped>
.app-loading-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  z-index: 2100;
  backdrop-filter: blur(1px);
  pointer-events: all;
}

.spin-shell {
  padding: 24px 28px;
  background: rgba(22, 22, 28, 0.9);
  border-radius: 12px;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.35);
  color: #fff;
}

.app-loading-fade-enter-active,
.app-loading-fade-leave-active {
  transition: opacity 0.2s ease;
}

.app-loading-fade-enter-from,
.app-loading-fade-leave-to {
  opacity: 0;
}
</style>
