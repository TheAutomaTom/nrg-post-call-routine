<template>
  <div class="tenant-auth-container">
    <n-space justify="space-between" align="center" style="margin-bottom: 0.5rem;">
      <h3 style="margin: 0;">Tenant Auth</h3>
      <n-button size="small" type="primary" @click="openAddModal">
        + Add
      </n-button>
    </n-space>

    <n-data-table
      :columns="columns"
      :data="tenantAuth$.credentials"
      :bordered="true"
      size="small"
      :row-key="(row: TenantCredential) => row.id"
    />

    <!-- Add/Edit Modal -->
    <n-modal v-model:show="showModal" preset="card" style="max-width: 400px;" :title="editingId ? 'Edit' : 'Add'">
      <n-form size="small">
        <n-form-item label="Name" :show-feedback="false">
          <n-input v-model:value="formData.name" placeholder="Name" />
        </n-form-item>
        <n-form-item label="Password" :show-feedback="false">
          <n-input v-model:value="formData.password" type="password" show-password-on="click" placeholder="Password" />
        </n-form-item>
      </n-form>
      <template #footer>
        <n-space justify="end">
          <n-button size="small" @click="showModal = false">Cancel</n-button>
          <n-button size="small" type="primary" @click="handleSave">Save</n-button>
        </n-space>
      </template>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import { h, onMounted, ref, reactive } from 'vue';
import { NButton, NSpace, NInput } from 'naive-ui';
import { useAppState } from '@/Core/States/app-state';
import { useTenantAuthState } from '@/Core/States/tenant-auth-state';
import type { TenantCredential } from '@/Core/Models/tenant-auth/TenantAuthModel';
import type { DataTableColumns } from 'naive-ui';

const app$ = useAppState();
const tenantAuth$ = useTenantAuthState();

const showModal = ref(false);
const editingId = ref<string | null>(null);
const formData = reactive({ name: '', password: '' });

const columns: DataTableColumns<TenantCredential> = [
  {
    title: 'Name',
    key: 'name',
    sorter: (a, b) => a.name.localeCompare(b.name),
    ellipsis: { tooltip: true },
  },
  {
    title: 'Password',
    key: 'password',
    render(row) {
      return h(NInput, {
        value: row.password,
        type: 'password',
        showPasswordOn: 'click',
        size: 'small',
        onUpdateValue: (val: string) => tenantAuth$.update(row.id, row.name, val),
      });
    },
  },
  {
    title: '',
    key: 'actions',
    width: 80,
    render(row) {
      return h(NSpace, { size: 4, justify: 'end' }, () => [
        h(NButton, { size: 'tiny', quaternary: true, onClick: () => openEditModal(row) }, () => '✏️'),
        h(NButton, { size: 'tiny', quaternary: true, onClick: () => tenantAuth$.remove(row.id) }, () => '🗑️'),
      ]);
    },
  },
];

onMounted(() => {
  app$.setActiveFeature('tenant');
});

const openAddModal = () => {
  editingId.value = null;
  formData.name = '';
  formData.password = '';
  showModal.value = true;
};

const openEditModal = (row: TenantCredential) => {
  editingId.value = row.id;
  formData.name = row.name;
  formData.password = row.password;
  showModal.value = true;
};

const handleSave = () => {
  if (!formData.name.trim()) return;
  if (editingId.value) {
    tenantAuth$.update(editingId.value, formData.name, formData.password);
  } else {
    tenantAuth$.add(formData.name, formData.password);
  }
  showModal.value = false;
};
</script>

<style scoped lang="scss">
.tenant-auth-container {
  padding: 0.5rem;
}
</style>
