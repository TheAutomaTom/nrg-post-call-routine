<template>
  <div>
    <n-card title="Login & Feature Selection">
      <template #header-extra>
        <n-space>
          <!-- <n-text><a class="periwinkle-link" href="/help/planned-labor-import" target="_blank"
              rel="noopener noreferrer">Help
              Page</a></n-text> -->
        </n-space>
      </template>

      <n-tabs v-model:value="activeTab" type="line">

        <!-- <n-tab-pane name="api-key" tab="Innergy Api">
        </n-tab-pane> -->

        <n-tab-pane name="login-vintage" tab="Vintage Funcs">
          <login-by-user />
        </n-tab-pane>
      </n-tabs>
    </n-card>
  </div>
</template>

<script setup lang="ts">
defineOptions({ name: "RefreshPanel" });

import { ref } from "vue";
// import LoginByApiKey from "./LoginAndSelect/LoginByApiKey.vue";
import LoginByUser from "./LoginAndSelect/LoginVintage.vue";

const activeTab = ref("login-vintage");
</script>

<style scoped lang-="scss"></style>
