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
      <li>Tenant Updates: {{ tenantUpdate$.records.size }} record(s)</li>
      <li>API Key: {{ ApiKeyStore.hasValid() ? 'Stored' : 'None' }}</li>
      <li>Vintage Auth: {{ VintageAuthCache.hasCache() ? 'Cached' : 'None' }}</li>
    </ul>

  </div>

</template>

<script setup lang="ts">
import { ref,  onMounted } from 'vue';
import { useAppState } from '@/Core/States/app-state';
import { useModalState } from '@/Core/States/modal-state';
import { useTenantAuthState } from '@/Core/States/tenant-auth-state';
import { useTenantUpdateState } from '@/Core/States/tenant-update-state';
import { TenantInfoCache } from '@/Data/Caches/App/TenantInfoCache';
import { TenantAuthCache } from '@/Data/Caches/Features/TenantAuthCache';
import { ApiKeyStore } from '@/Data/Caches/App/ApiKeyStore';
import { VintageAuthCache } from '@/Data/Caches/App/Vintage/VintageAuthCache';
import { StringEncryptor } from '@/Core/Features/StringEncryptor';


const app$ = useAppState();
const modal$ = useModalState();
const tenantAuth$ = useTenantAuthState();
const tenantUpdate$ = useTenantUpdateState();

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
  // Encrypt credentials for backup
  const encryptedCredentials = tenantAuth$.credentials.map(c => ({
    id: c.id,
    name: StringEncryptor.encrypt(c.name),
    password: StringEncryptor.encrypt(c.password),
  }));

  // Encrypt vintage credentials for backup
  const vintageAuth = VintageAuthCache.load();
  const encryptedVintage = vintageAuth
    ? { email: StringEncryptor.encrypt(vintageAuth.email), password: StringEncryptor.encrypt(vintageAuth.password) }
    : null;

  // Serialize tenant update records (Map → plain object)
  const updateRecords: Record<string, unknown> = {};
  tenantUpdate$.records.forEach((record, key) => {
    updateRecords[key] = record;
  });

  const payload = {
    version: 3,
    exportedAt: new Date().toISOString(),
    data: {
      tenantInfo: TenantInfoCache.load(),
      apiKey: ApiKeyStore.loadRaw(),
      vintageAuth: encryptedVintage,
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
        credentials: encryptedCredentials,
      },
      tenantUpdate: {
        records: updateRecords,
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

    if (![1, 2, 3].includes(backup.version)) {
      throw new Error(`Unsupported backup version: ${backup.version}`);
    }

    // Restore all caches
    if (backup.data.tenantInfo) {
      TenantInfoCache.save(backup.data.tenantInfo);
    }

    // Restore Pinia stores (versioned)
    const stores = backup.stores ?? backup.data?.stores;
    if (stores) {
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

      // Restore TenantAuth state (decrypt on import)
      if (stores.tenantAuth?.credentials) {
        const decryptedCredentials = stores.tenantAuth.credentials.map((c: { id: string; name: string; password: string }) => ({
          id: c.id,
          name: StringEncryptor.isEncrypted(c.name) ? StringEncryptor.decrypt(c.name) : c.name,
          password: StringEncryptor.isEncrypted(c.password) ? StringEncryptor.decrypt(c.password) : c.password,
        }));
        tenantAuth$.credentials = decryptedCredentials;
        TenantAuthCache.save(decryptedCredentials);
      }

      // Restore TenantUpdate records (v3+)
      if (stores.tenantUpdate?.records) {
        const restoredMap = new Map<string, import('@/Core/Models/tenant-update/TenantUpdateModel').TenantUpdateRecord>();
        for (const [key, value] of Object.entries(stores.tenantUpdate.records)) {
          restoredMap.set(key, value as import('@/Core/Models/tenant-update/TenantUpdateModel').TenantUpdateRecord);
        }
        tenantUpdate$.records = restoredMap;
      }
    }

    // Restore caches (v3+)
    if (backup.data.apiKey?.key) {
      const remaining = backup.data.apiKey.expiresAt - Date.now();
      if (remaining > 0) {
        ApiKeyStore.save(backup.data.apiKey.key, remaining);
      }
    }

    if (backup.data.vintageAuth) {
      const va = backup.data.vintageAuth;
      VintageAuthCache.save({
        email: StringEncryptor.isEncrypted(va.email) ? StringEncryptor.decrypt(va.email) : va.email,
        password: StringEncryptor.isEncrypted(va.password) ? StringEncryptor.decrypt(va.password) : va.password,
      });
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
