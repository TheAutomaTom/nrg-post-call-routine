<template>
  <div class="tenant-auth-footer">
    <n-button
      class="footer-button"
      :class="{ 'highlight-active': isTenantAuthRoute }"
      size="small"
      @click="goToTenantAuth"
      aria-label="Tenant Auth">
      <span class="icon">🔐</span>
      <span class="label hide-on-mobile">Tenant Auth</span>
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

const goToTenantAuth = () => router.push({ name: 'tenant-auth-main' });
</script>

<style scoped>
.tenant-auth-footer {
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
