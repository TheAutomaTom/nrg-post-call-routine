<template>
  <n-flex vertical>
    <n-alert type="info" class="text-sm italic">
      Enter your Innergy credentials to log in. This provides access to the Contact Importer feature.
    </n-alert>

    <n-input v-model:value="email" type="text" placeholder="Email" required />
    <n-input v-model:value="password" type="password" show-password-on="click" placeholder="Password" required />

    <n-checkbox v-model:checked="rememberMe">Remember me</n-checkbox>

    <n-button type="tertiary" :ghost="false" class="feature-button"
      :class="{ 'highlight-active': app$.ActiveFeature === 'test-user-login' }"
      @click="handleLogin" :disabled="!canLogin">
      <template v-if="vintageApi$.loginLoading">
        <n-spin size="small" />
      </template>
      <template v-else>
        {{ vintageApi$.loginError ? 'Login Failed - Try Again' : 'Login' }}
      </template>
    </n-button>

    <n-alert v-if="vintageApi$.loginError" type="error" class="text-sm">
      {{ vintageApi$.loginError }}
    </n-alert>

    <ul class="info-list">
      <li>Environment: {{ vintageApi$.environment || 'Not loaded' }}</li>
      <li>Session: {{ vintageApi$.isLoggedIn ? 'Active' : 'Not logged in' }}</li>
      <li v-if="vintageApi$.sessionInfo">Company: {{ vintageApi$.tenantName || 'N/A' }}</li>
      <li v-if="vintageApi$.sessionInfo">User: {{ vintageApi$.userEmail || 'N/A' }}</li>
      <li v-if="vintageApi$.lastLoginSuccess">Logged in: {{ new Date(vintageApi$.lastLoginSuccess).toLocaleString() }}</li>
    </ul>

    <template v-if="vintageApi$.isLoggedIn">
      <n-divider />
      <n-text class="text-sm">Contact Importer features available after login.</n-text>
      <VintageFeatureSelection />
    </template>
  </n-flex>
</template>

<script setup lang="ts">
defineOptions({ name: "LoginByUser" });

import { computed, ref, onMounted } from "vue";
import { useAppState } from "@/Core/States/app-state";
import { useVintageAuthState } from "@/Core/States/nrg-vintage-auth";
import VintageFeatureSelection from "./FeatureSelectionVintage.vue";

const app$ = useAppState();
const vintageApi$ = useVintageAuthState();

// Form state
const email = ref("");
const password = ref("");
const rememberMe = ref(vintageApi$.rememberMe);

// Load saved credentials on mount
onMounted(() => {
  const saved = vintageApi$.loadSavedCredentials();
  if (saved) {
    email.value = saved.email;
    password.value = saved.password;
    rememberMe.value = true;
  }
});

const canLogin = computed(() => {
  return email.value.trim() !== "" && password.value.trim() !== "" && !vintageApi$.loginLoading;
});

const handleLogin = async () => {
  if (!canLogin.value) return;

  try {
    await vintageApi$.login(email.value, password.value);

    // Save or clear credentials based on remember me checkbox
    if (vintageApi$.isLoggedIn && rememberMe.value) {
      vintageApi$.saveCredentials(email.value, password.value);
    } else {
      vintageApi$.clearSavedCredentials();
    }
  } catch {
    // Error is already stored in vintageApi$.loginError
  }
};
</script>

<style scoped></style>
