import { defineStore } from "pinia";
import { ref, computed, watch } from "vue";
import { TenantAuthCache } from "@/Data/Caches/Features/TenantAuthCache";
import type { TenantCredential } from "@/Core/Models/tenant-auth/TenantAuthModel";

export const useTenantAuthState = defineStore("TenantAuthState", () => {
  // Hydrate from cache on init
  const credentials = ref<TenantCredential[]>(TenantAuthCache.load());

  // Auto-persist on change
  watch(credentials, (newCreds) => {
    TenantAuthCache.save(newCreds);
  }, { deep: true });

  // Computed
  const count = computed(() => credentials.value.length);

  // CRUD Actions
  const add = (name: string, password: string): TenantCredential => {
    const newCred: TenantCredential = {
      id: crypto.randomUUID(),
      name,
      password,
    };
    credentials.value.push(newCred);
    return newCred;
  };

  const update = (id: string, name: string, password: string): boolean => {
    const idx = credentials.value.findIndex(c => c.id === id);
    if (idx === -1) return false;
    credentials.value[idx] = { id, name, password };
    return true;
  };

  const remove = (id: string): boolean => {
    const idx = credentials.value.findIndex(c => c.id === id);
    if (idx === -1) return false;
    credentials.value.splice(idx, 1);
    return true;
  };

  const getById = (id: string): TenantCredential | undefined => {
    return credentials.value.find(c => c.id === id);
  };

  const reset = () => {
    credentials.value = [];
    TenantAuthCache.clear();
  };

  return {
    // State
    credentials,

    // Computed
    count,

    // Actions
    add,
    update,
    remove,
    getById,
    reset,
  };
});
