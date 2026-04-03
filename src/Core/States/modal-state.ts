import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useModalState = defineStore("modal", () => {
  const IsActive = ref(false);
  const Title = ref<string | undefined>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const Content = ref<Record<string, any> | undefined>();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function Show(t: string, c?: Record<string, any>) {
    IsActive.value = true;
    Title.value = t;
    Content.value = c;
  }

  function Hide() {
    if (!IsActive.value) return;
    IsActive.value = false;
    Title.value = undefined;
    Content.value = undefined;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function Toggle(t: string, c?: Record<string, any>) {
    if (IsActive.value && Title.value === t) {
      Hide();
    } else {
      Show(t, c);
    }
  }

  function Reset() {
    Hide();
  }

  return {
    IsActive,
    Show,
    Hide,
    Toggle,
    Reset,
  };
});
