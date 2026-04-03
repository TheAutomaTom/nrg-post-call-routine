<template>
<div class="page">

    <n-divider title-placement="left">Local App State</n-divider>

    <n-space vertical justify="start">
      <n-button type="tertiary" class="feature-button" :class="{ 'highlight-active': activeAction === 'newGame' }"
        @focus="activeAction = 'newGame'" @click="handleNewGame">
        ✦ New Game
      </n-button>
      <n-button type="tertiary" class="feature-button" :class="{ 'highlight-active': activeAction === 'save' }"
        @focus="activeAction = 'save'" @click="activeAction = 'save'; exportData();">
        ▼ Save Game
      </n-button>
    </n-space>

    <input ref="fileInput" class="hidden-input" type="file" accept="application/json" @change="handleFileChange" />
    <n-space justify="start">

      <template v-if="selectedFile">
        <n-button type="primary" class="feature-button highlight-active-2"
          :class="{ 'highlight-active-2': activeAction === 'load' }" @focus="activeAction = 'load'"
          @click="activeAction = 'load'; importData();">
          ▲ Load Game
        </n-button>
      </template>

      <n-button type="tertiary" :ghost="false" class="feature-button"
        :class="{ 'highlight-active': activeAction === 'choose' }" @focus="activeAction = 'choose'"
        @click="activeAction = 'choose'; triggerFileSelect();">
        {{ selectedFile?.name || '▲ Load Game' }}
      </n-button>
    </n-space>

    <n-divider title-placement="left">Current Snapshot Contents</n-divider>
    <ul class="summary">
      <li>Frontline Version: 260403-1227</li>
      <li>Server Version: {{ serverVersion || 'Not fetched' }}</li>
      <li>Tenant Auth: {{ tenantAuth$.count }} credential(s)</li>
    </ul>

  </div>

</template>

<script setup lang="ts">
import { ref,  onMounted } from 'vue';
import { useAppState } from '@/Core/States/app-state';
import { useModalState } from '@/Core/States/modal-state';
import { useTenantAuthState } from '@/Core/States/tenant-auth-state';
import { TenantInfoCache } from '@/Data/Caches/App/TenantInfoCache';
import { TenantAuthCache } from '@/Data/Caches/Features/TenantAuthCache';


const app$ = useAppState();
const modal$ = useModalState();
const tenantAuth$ = useTenantAuthState();

const fileInput = ref<HTMLInputElement | null>(null);
const selectedFile = ref<File | undefined>(undefined);
const serverVersion = ref<string | undefined>(undefined);
const activeAction = ref<'newGame' | 'save' | 'load' | 'choose' | null>(null);


const handleNewGame = () => {
  activeAction.value = 'newGame';
  app$.openModal('confirm', {
    title: 'Reset',
    message: 'Are you sure? This will clear all local data.',
    confirmText: 'Yes, Reset',
    cancelText: 'Cancel',
    confirmType: 'warning',
    onConfirm: () => {
      // Clear TenantAuth
      tenantAuth$.reset();
      app$.setAppStatus('success', 'Local data reset.');
    },
  });
};

/**
 * Build a backup payload containing all cached data
 */
function buildBackupPayload() {
  const payload = {
    version: 2,
    exportedAt: new Date().toISOString(),
    data: {
      tenantInfo: TenantInfoCache.load(),
      tenantAuthCredentials: TenantAuthCache.load(),
    },
    stores: {
      app: {
        ActiveFeature: app$.ActiveFeature,
        AppStatus: app$.AppStatus,
        AppStatusHistory: app$.AppStatusHistory,
      },
      modal: {
        IsActive: modal$.IsActive,
      },
      tenantAuth: {
        credentials: tenantAuth$.credentials,
      },
    },
  };
  return payload;
}

/**
 * Export all cached data to a JSON file
 */
const exportData = () => {
  const payload = buildBackupPayload();
  const jsonStr = JSON.stringify(payload);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  link.href = url;
  link.download = `nrg-frontline-backup-${timestamp}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Trigger the file input dialog
 */
function triggerFileSelect() {
  fileInput.value?.click();
}

/**
 * Handle file selection
 */
function handleFileChange(ev: Event) {
  const target = ev.target as HTMLInputElement;
  const files = target.files;
  if (files && files.length > 0) {
    selectedFile.value = files[0];
  }
}

/**
 * Import backup data and restore all caches
 */
async function importData() {
  if (!selectedFile.value) {
    console.warn('[DataBackup] No file selected');
    return;
  }

  try {
    const fileContent = await selectedFile.value.text();
    const backup = JSON.parse(fileContent);

    if (backup.version !== 1) {
      throw new Error(`Unsupported backup version: ${backup.version}`);
    }

    // Restore all caches
    if (backup.data.tenantInfo) {
      TenantInfoCache.save(backup.data.tenantInfo);
    }

    // Restore Pinia stores (versioned)
    const stores = backup.stores ?? backup.data?.stores;
    if (stores) {
      // Support both old (userConfig) and new (ApiUserConfig) property names
      const apiConfig = stores.ApiUserConfig ?? stores.userConfig;


      if (stores.app) {
        app$.ActiveFeature = stores.app.ActiveFeature ?? null;
        app$.AppStatus = stores.app.AppStatus ?? app$.AppStatus;
        app$.AppStatusHistory = stores.app.AppStatusHistory ?? app$.AppStatusHistory;
      }

      if (stores.modal) {
        if (!stores.modal.IsActive) {
          modal$.Hide();
        }
      }

      // Restore TenantAuth state
      if (stores.tenantAuth?.credentials) {
        tenantAuth$.credentials = stores.tenantAuth.credentials;
        TenantAuthCache.save(stores.tenantAuth.credentials);
      }

    }

    console.log('[DataBackup] Successfully restored backup data');
    selectedFile.value = undefined;
    activeAction.value = null;

    // Clear file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : 'Failed to import backup';
    console.error('[DataBackup] Import failed:', errorMsg);
  }
}

onMounted(() => {
  // serverVersion.value = instance$.TestedServerVersion ?? undefined;
});
</script>


<style scoped>
.page {
  display: grid;
  gap: 12px;
}

.summary {
  margin: 0;
  padding-left: 1.25rem;
}

.hidden-input {
  position: absolute;
  opacity: 0;
  width: 1px;
  height: 1px;
  overflow: hidden;
  pointer-events: none;
}


</style>
