import { describe, it, expect, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createPinia, setActivePinia } from "pinia";
import LoginAndSelect from "@/App/Views/Home/LoginAndSelect.vue";

describe("LoginAndSelect.vue", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
    vi.clearAllMocks();
  });

  const mountComponent = () =>
    mount(LoginAndSelect, {
      global: {
        stubs: {
          "n-card": { template: '<div class="n-card"><slot /></div>' },
          "n-flex": { template: "<div><slot /></div>" },
          "n-button": { template: "<button><slot /></button>" },
          "n-text": { template: "<span><slot /></span>" },
          "n-space": { template: "<div><slot /></div>" },
          "n-divider": { template: "<div><slot /></div>" },
          "n-input": { template: '<input type="text" />' },
        },
      },
    });

  it("renders workflow and route buttons", () => {
    const wrapper = mountComponent();
    const buttons = wrapper.findAll("button");
    const buttonTexts = buttons.map((b) => b.text());
    expect(buttonTexts).toContain("Planned Labor Importer");
  });

  it("renders at least one card container", () => {
    const wrapper = mountComponent();
    const cards = wrapper.findAll(".n-card");
    expect(cards.length).toBeGreaterThanOrEqual(1);
  });
});
