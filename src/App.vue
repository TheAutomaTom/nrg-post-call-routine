<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <n-modal-provider>
        <n-layout :class="['app-layout', { 'is-loading': app$.IsLoading }]">
        <n-layout-content class="app-content">

          <n-modal v-model:show="app$.IsModalOpen" preset="card" :title="modalTitle" size="small" :style="modalStyle"
            @close="app$.closeModal()">

            <AppModal v-if="app$.ModalName === 'status'" />

            <div v-else-if="app$.ModalName === 'confirm'">
              <n-space vertical :size="12">
                <div v-html="confirmMessage"></div>
                <n-space justify="end" :size="8">
                  <n-button tertiary @click="app$.closeModal()">{{ cancelText }}</n-button>
                  <n-button :type="confirmType" @click="handleConfirm">{{ confirmText }}</n-button>
                </n-space>
              </n-space>
            </div>

          </n-modal>

          <router-view />
          <AppLoading />
        </n-layout-content>

        <n-layout-footer bordered class="app-footer">
          <FooterBar />
        </n-layout-footer>
      </n-layout>
    </n-modal-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { darkTheme } from 'naive-ui';
import { themeOverrides } from './App/Styles/theme';
import { modalStyle } from './App/Styles/modal-styles';
import { onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAppState } from '@/Core/States/app-state';
import FooterBar from '@/App/Views/AppLayout/NavFooter.vue';
import AppModal from '@/App/Views/AppLayout/AppModal.vue';
import AppLoading from '@/App/Views/AppLayout/AppLoading.vue';
import type { ConfirmPayload } from '@/Core/Models/infra/ConfirmPayload';

const router = useRouter();
const app$ = useAppState();
const modalTitle = computed(() => {
  switch (app$.ModalName) {
    case 'status': return 'Status';
    case 'confirm': return (app$.ModalPayload as ConfirmPayload | null)?.title ?? 'Confirm';
    default: return 'Info';
  }
});

const confirmMessage = computed(() => (app$.ModalPayload as ConfirmPayload | null)?.message ?? 'Are you sure?');
const confirmText = computed(() => (app$.ModalPayload as ConfirmPayload | null)?.confirmText ?? 'Yes');
const cancelText = computed(() => (app$.ModalPayload as ConfirmPayload | null)?.cancelText ?? 'No');
const confirmType = computed(() => (app$.ModalPayload as ConfirmPayload | null)?.confirmType ?? 'primary');
const handleConfirm = () => {
  const payload = app$.ModalPayload as ConfirmPayload | null;
  try {
    if (payload?.onConfirm && typeof payload.onConfirm === 'function') {
      payload.onConfirm();
    }
  } finally {
    app$.closeModal();
  }
};
onMounted(async () => {
  // Reset active feature on app mount (page refresh)
  app$.setActiveFeature(null);
});
</script>

<style scoped>
.app-footer {
  padding: 0.25rem 0.5rem;
}
</style>
