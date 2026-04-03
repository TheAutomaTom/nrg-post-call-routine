import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useAppState } from "@/Core/States/app-state";
import { NrgVintageAuth } from "@/Data/Clients/NrgVintageAuth";
import type { SessionStateResponse } from "@/Core/Models/vintage-auth/nrg-dto-responses";
import { VintageAuthCache, type VintageAuthCredentials } from "@/Data/Caches/App/Vintage/VintageAuthCache";

export const useVintageAuthState = defineStore("VintageAuthState", () => {
  const app$ = useAppState();

  // Client instance
  const client = new NrgVintageAuth();

  // State
  const environment = ref<string | null>(null);
  const sessionInfo = ref<SessionStateResponse | null>(null);
  const lastLoginSuccess = ref<number | null>(null);
  const loginLoading = ref(false);
  const loginError = ref<string | null>(null);
  const rememberMe = ref(VintageAuthCache.hasCache());

  // Computed
  const isLoggedIn = computed(() => !!sessionInfo.value);
  const tenantName = computed(() => sessionInfo.value?.tenant?.companyName ?? null);
  const userEmail = computed(() => sessionInfo.value?.user?.loginEmail ?? null);
  const savedCredentials = computed(() => VintageAuthCache.load());

  // Actions
  const loadSavedCredentials = (): VintageAuthCredentials | null => {
    return VintageAuthCache.load();
  };

  const saveCredentials = (email: string, password: string): void => {
    VintageAuthCache.save({ email, password });
    rememberMe.value = true;
  };

  const clearSavedCredentials = (): void => {
    VintageAuthCache.clear();
    rememberMe.value = false;
  };

  const getEnvironmentForUser = async (email: string): Promise<string> => {
    const envResponse = await client.getEnvironmentForUser(email);
    environment.value = envResponse.Environment;
    return envResponse.Environment;
  };

  const login = async (email: string, password: string): Promise<void> => {
    loginLoading.value = true;
    loginError.value = null;
    app$.setActiveFeature('your-new-feature');

    try {
      // Step 1: Get environment for user
      await getEnvironmentForUser(email);

      // Step 2: Login
      const authResult = await client.login(email, password);
      if (authResult.ResultType !== 0) {
        throw new Error(authResult.OutcomeDescription || 'Login failed');
      }

      // Step 3: Get app profile / session
      const profile = await client.getAppProfile();
      sessionInfo.value = profile;
      lastLoginSuccess.value = Date.now();

      app$.setActiveFeature('your-new-feature');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      loginError.value = message;
      sessionInfo.value = null;
      throw error;
    } finally {
      loginLoading.value = false;
    }
  };

  const logout = () => {
    environment.value = null;
    sessionInfo.value = null;
    lastLoginSuccess.value = null;
    loginError.value = null;
    app$.setActiveFeature(null);
  };

  const runQuery = async <T>(query: { $type: string; [key: string]: unknown }): Promise<T> => {
    return await client.runQuery<T>(query);
  };

  return {
    // Client (exposed for advanced usage)
    client,

    // State
    environment,
    sessionInfo,
    lastLoginSuccess,
    loginLoading,
    loginError,
    rememberMe,

    // Computed
    isLoggedIn,
    tenantName,
    userEmail,
    savedCredentials,

    // Actions
    getEnvironmentForUser,
    login,
    logout,
    runQuery,
    loadSavedCredentials,
    saveCredentials,
    clearSavedCredentials,
  };
});
