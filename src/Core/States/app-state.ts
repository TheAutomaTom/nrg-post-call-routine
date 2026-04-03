import { defineStore } from "pinia";
import { ref, computed } from "vue";
import {
  createAppStatus,
  type AppStatus,
  type AppStatusKind,
} from "@/Core/Models/infra/AppStatus";
import type { ModalPayload } from "@/Core/Models/infra/ConfirmPayload";

// Add at the top, after imports
export const useAppState = defineStore("AppState", () => {
  const loadingCount = ref(0);
  const IsLoading = computed(() => loadingCount.value > 0);
  const AppStatusRef = ref<AppStatus>(createAppStatus());
  const AppStatusHistory = ref<AppStatus[]>([createAppStatus("idle", "Ready")]);
  const showLoading = () => {
    loadingCount.value++;
  };
  const hideLoading = () => {
    if (loadingCount.value > 0) {
      loadingCount.value--;
    }
  };

  // Global modal state
  const IsModalOpen = ref(false);
  const ModalName = ref<string | null>(null);
  const ModalPayload = ref<ModalPayload>(null);

  const setAppStatus = (kind: AppStatusKind, message: string) => {
    const newStatus = createAppStatus(kind, message);
    AppStatusRef.value = newStatus;
    AppStatusHistory.value.unshift(newStatus);
    if (AppStatusHistory.value.length > 5) {
      AppStatusHistory.value.length = 5;
    }
  };

  const openModal = (name: string, payload?: unknown) => {
    ModalName.value = name;
    ModalPayload.value = payload ?? null;
    IsModalOpen.value = true;
  };

  const closeModal = () => {
    IsModalOpen.value = false;
    ModalPayload.value = null;
    ModalName.value = null;
  };

  const toggleModal = (name?: string, payload?: unknown) => {
    if (IsModalOpen.value) {
      closeModal();
    } else if (name) {
      openModal(name, payload);
    }
  };

  // Active feature tracking
  const ActiveFeature = ref<
    | "your-new-feature"
    | "tenant"
    | null
  >(null);

  const setActiveFeature = (
    feature:
      | "your-new-feature"
      | "tenant"
      | null,
  ) => {
    ActiveFeature.value = feature;
  };



  //============================================================//

  return {
    IsLoading,
    AppStatus: AppStatusRef,
    AppStatusHistory,
    setAppStatus,
    showLoading,
    hideLoading,
    IsModalOpen,
    ModalName,
    ModalPayload,
    openModal,
    closeModal,
    toggleModal,
    ActiveFeature,
    setActiveFeature
  };
});
