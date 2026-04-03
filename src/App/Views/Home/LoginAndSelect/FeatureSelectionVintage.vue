<template>
  <n-divider title-placement="left">Feature Selection</n-divider>
  <n-space :size="10">

    <!-- Feature Select Buttons -->

    <n-button type="tertiary" :ghost="false" class="feature-button"
      :class="{ 'highlight-active': app$.ActiveFeature === 'tenant' }" @click="onLoadTenant">
      🛠️ Post Call Updater
    </n-button>
    <!--  -->

  </n-space>
</template>

<script setup lang="ts">
import { useAppState } from '@/Core/States/app-state';
import { useRouter } from 'vue-router';

const app$ = useAppState();
const router = useRouter();

const onLoadYourNewFeature = async () => {
  app$.setActiveFeature('your-new-feature');
  // router.push({ name: 'your-new-feature-route' });
};

const onLoadTenant = async () => {
  app$.setActiveFeature('tenant');
  router.push({ name: 'tenant-auth-main' });
};
</script>


<style scoped lang="scss"></style>
