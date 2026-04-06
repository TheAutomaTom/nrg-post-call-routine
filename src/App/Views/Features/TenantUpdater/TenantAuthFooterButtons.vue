<template>
  <div class="tenant-footer">
    <n-button
      class="footer-button"
      :class="{ 'highlight-active': isTenantAuthRoute }"
      size="small"
      @click="goToTenantAuth"
      aria-label="Tenant Auth">
      <span class="icon">🔐</span>
      <span class="label hide-on-mobile">Auth</span>
    </n-button>
    <n-button
      class="footer-button"
      :class="{ 'highlight-active': isTenantUpdateRoute }"
      size="small"
      @click="goToTenantUpdate"
      aria-label="Tenant Updater">
      <span class="icon">🔄</span>
      <span class="label hide-on-mobile">Updater</span>
    </n-button>
  </div>
</template>

<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';
import { computed } from 'vue';

const router = useRouter();
const route = useRoute();

const routeName = computed(() => route?.name as string | undefined);

const isTenantAuthRoute = computed(() => {
  return routeName.value === 'tenant-auth-main' || routeName.value?.startsWith('tenant-auth-');
});

const isTenantUpdateRoute = computed(() => {
  return routeName.value === 'tenant-update-main' || routeName.value?.startsWith('tenant-update-');
});

const goToTenantAuth = () => router.push({ name: 'tenant-auth-main' });
const goToTenantUpdate = () => router.push({ name: 'tenant-update-main' });
</script>

<style scoped>
.tenant-footer {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.footer-button {
  height: 32px;
}

.footer-button .icon {
  display: inline-block;
  font-size: 1rem;
  line-height: 1;
}

.footer-button .label {
  margin-left: 0.35rem;
  font-size: 0.9rem;
}
</style>
