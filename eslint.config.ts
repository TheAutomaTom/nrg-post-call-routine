import { globalIgnores } from "eslint/config";
import { defineConfigWithVueTs, vueTsConfigs } from "@vue/eslint-config-typescript";
import pluginVue from "eslint-plugin-vue";
import pluginVitest from "@vitest/eslint-plugin";
import skipFormatting from "@vue/eslint-config-prettier/skip-formatting";

// More info at https://github.com/vuejs/eslint-config-typescript/#advanced-setup

export default defineConfigWithVueTs(
  // Core presets first
  pluginVue.configs["flat/essential"],
  vueTsConfigs.recommended,

  // Test rules (scoped to tests)
  {
    ...pluginVitest.configs.recommended,
    files: ["src/**/__tests__/*"],
  },

  // Prettier-compat last among presets
  skipFormatting,

  // Global ignores
  globalIgnores(["**/dist/**", "**/dist-ssr/**", "**/coverage/**"]),

  // 👉 FINAL OVERRIDE (last wins): make unused-vars a warning
  {
    name: "app/files-to-lint",
    files: ["**/*.{ts,mts,tsx,vue}"],
    rules: {
      // disable base rule so it doesn’t conflict with the TS version
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",
    },
  },
);
