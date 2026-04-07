<template>
  <div class="tenant-update-container">
    <n-space justify="space-between" align="center" style="margin-bottom: 0.5rem;">
      <h3 style="margin: 0;">Tenant Updater</h3>
      <n-button size="tiny" quaternary @click="tenantUpdate$.clearAllStatuses()" title="Clear all statuses">
        🔄 Clear Status
      </n-button>
    </n-space>

    <n-data-table
      :columns="columns"
      :data="tenantUpdate$.tableData"
      :bordered="true"
      size="small"
      :row-key="(row: TenantUpdateRecord) => row.tenantId"
    />

    <AddNoteModal
      v-model:show="showNoteModal"
      :tenant-id="selectedTenantId"
      :tenant-name="selectedTenantName"
      @save="handleNoteSave"
    />
  </div>
</template>

<script setup lang="ts">
import { h, ref, onMounted } from 'vue';
import { NButton, useMessage } from 'naive-ui';
import { useAppState } from '@/Core/States/app-state';
import { useTenantUpdateState } from '@/Core/States/tenant-update-state';
import { useTenantPostingState } from '@/Core/States/tenant-posting-state';
import type { TenantUpdateRecord } from '@/Core/Models/tenant-update/TenantUpdateModel';
import type { DataTableColumns } from 'naive-ui';
import AddNoteModal from './AddNoteModal.vue';

const app$ = useAppState();
const tenantUpdate$ = useTenantUpdateState();
const posting$ = useTenantPostingState();
const message = useMessage();

const showNoteModal = ref(false);
const selectedTenantId = ref('');
const selectedTenantName = ref('');

const openNoteModal = (row: TenantUpdateRecord) => {
  selectedTenantId.value = row.tenantId;
  selectedTenantName.value = row.tenantName;
  showNoteModal.value = true;
};

const handleNoteSave = async (tenantId: string, html: string) => {
  const result = await posting$.postNote(tenantId, html);
  if (result.success) {
    message.success(result.message);
    tenantUpdate$.addNote(tenantId);
    tenantUpdate$.setNoteStatus(tenantId, result.message.includes('verified') ? 'verified' : 'neutral');
  } else {
    message.error(result.message);
    tenantUpdate$.setNoteStatus(tenantId, 'failed');
  }
};

const formatDate = (dateStr: string | null) => {
  if (!dateStr) return '—';
  return new Date(dateStr).toLocaleDateString();
};

const statusEmoji = (status: string) => {
  switch (status) {
    case 'verified': return '✅';
    case 'failed': return '❌';
    default: return '—';
  }
};

const columns: DataTableColumns<TenantUpdateRecord> = [
  {
    title: 'Client',
    key: 'tenantName',
    sorter: (a, b) => a.tenantName.localeCompare(b.tenantName),
    ellipsis: { tooltip: true },
    width: 100,
  },
  {
    title: 'Note',
    key: 'addNote',
    width: 80,
    align: 'center',
    sorter: (a, b) => (a.updatedAt ?? '').localeCompare(b.updatedAt ?? ''),
    render(row) {
      return h(NButton, {
        size: 'tiny',
        quaternary: true,
        onClick: () => openNoteModal(row),
        title: 'Add Note',
      }, () => formatDate(row.updatedAt));
    },
  },
  {
    title: '✓',
    key: 'noteStatus',
    width: 40,
    align: 'center',
    render: (row) => statusEmoji(row.noteStatus),
  },
  {
    title: 'Task',
    key: 'addTask',
    width: 50,
    align: 'center',
    render(row) {
      return h(NButton, {
        size: 'tiny',
        quaternary: true,
        onClick: () => tenantUpdate$.addTask(row.tenantId),
        title: 'Add Task',
      }, () => '+');
    },
  },
  {
    title: '#',
    key: 'tasksPending',
    width: 40,
    align: 'center',
    sorter: (a, b) => a.tasksPending - b.tasksPending,
    render: (row) => row.tasksPending || '—',
  },
  {
    title: '',
    key: 'update',
    width: 60,
    align: 'center',
    render(row) {
      return h(NButton, {
        size: 'tiny',
        type: 'primary',
        onClick: () => tenantUpdate$.markUpdated(row.tenantId),
        title: 'Mark Updated',
      }, () => '🔄');
    },
  },
];

onMounted(() => {
  app$.setActiveFeature('tenant');
});
</script>

<style scoped lang="scss">
.tenant-update-container {
  padding: 0.5rem;
}
</style>
