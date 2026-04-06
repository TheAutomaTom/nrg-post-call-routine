<template>
  <n-scrollbar :x-scrollable="true" class="footer-scroll">
    <div class="footer-rail">
      <div class="footer-group">
        <!-- <n-button class="footer-button" size="small" @click="goTo('longin-and-select')" aria-label="Refresh"
          :class="{ 'highlight-active': routeName === 'longin-and-select' }">
          <span class="icon">☰</span>
          <span class="label hide-on-mobile">Home</span>
        </n-button> -->

        <template v-if="vintageApi$.isLoggedIn">
     <!-- <ContactImporterFooterButtons
            v-if="app$.ActiveFeature === 'contact-importer' || (app$.ActiveFeature === null && isContactImporter)" /> -->

        </template>

        <TenantFooterButtons
          v-if="app$.ActiveFeature === 'tenant' || (app$.ActiveFeature === null && isTenant)" />

        <!-- ==== Right Justified ======================================================================= -->
      </div>
      <n-button class="footer-button status-square" size="small" tertiary @click="goTo('data-backup')"
        aria-label="Backup" title="Go to Data Backup">
        <span class="status-indicator" :class="app$.AppStatus.kind">
          💾
        </span>
      </n-button>
      <n-button class="footer-button status-square" size="small" tertiary @click="showStatus"
        :aria-label="`Status: ${app$.AppStatus.kind}`" :title="app$.AppStatus.message">
        <span class="status-indicator" :class="app$.AppStatus.kind">
          {{ statusGlyph }}
        </span>
      </n-button>


    </div>
  </n-scrollbar>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { useAppState } from '@/Core/States/app-state';
import { useVintageAuthState } from '@/Core/States/nrg-vintage-auth';
import { computed } from 'vue';
import type { AppStatusKind } from '@/Core/Models/infra/AppStatus';
import { APP_STATUS_GLYPHS } from '@/Core/Models/infra/AppStatus';
import TenantFooterButtons from '../Features/TenantUpdater/TenantAuthFooterButtons.vue';

const app$ = useAppState();
const vintageApi$ = useVintageAuthState();
const router = useRouter();
const route = useRoute();

const routeName = computed(() => route?.name);

const isTenant = computed(() => {
  const name = routeName.value as string;
  return name === 'tenant-auth-main' || name?.startsWith('tenant-auth-') ||
         name === 'tenant-update-main' || name?.startsWith('tenant-update-');
});

// const isNewFeatureStub = computed(() => {
//   const name = routeName.value as string;
//   return (
//     name === 'stub'
//   );
// });


const goTo = (name: string) => {
  router.push({ name });
};

const statusGlyph = computed(() => APP_STATUS_GLYPHS[app$.AppStatus.kind as AppStatusKind]);

const showStatus = () => {
  app$.openModal('status', { statuses: app$.AppStatusHistory });
};
</script>

<style scoped>
.footer-scroll {
  width: 100%;
}

.footer-rail {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding-right: 0.25rem;
  /* ensure last button fully visible */
  box-sizing: border-box;
}

.footer-group {
  display: flex;
  gap: 0.5rem;
  align-items: center;
  flex: 1 1 auto;
  overflow-x: auto;
  padding-right: 2.25rem;
  /* space so last button not hidden behind status square */
  scrollbar-width: none;
}

.footer-group::-webkit-scrollbar {
  display: none;
}

/* removed stray brace */

.footer-button {
  height: 32px;
}

.status-square {
  width: 32px;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-shrink: 0;
}

/* status-indicator now in theme.scss */

.footer-button .icon {
  display: inline-block;
  font-size: 1rem;
  line-height: 1;
}

.footer-button .label {
  margin-left: 0.35rem;
  font-size: 0.9rem;
}

.highlight-active :deep(.n-button__border),
.highlight-active :deep(.n-button__state-border) {
  border-color: var(--color-highlight-vibrant) !important;
}

.highlight-active :deep(.n-button__content) {
  color: var(--color-highlight-vibrant) !important;
}

/* Mobile styles now in theme.scss */
</style>
