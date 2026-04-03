import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { useTenantAuthState } from "@/Core/States/tenant-auth-state";
import type { TenantUpdateRecord } from "@/Core/Models/tenant-update/TenantUpdateModel";

export const useTenantUpdateState = defineStore("TenantUpdateState", () => {
  const tenantAuth$ = useTenantAuthState();

  // State - track update records per tenant
  const records = ref<Map<string, TenantUpdateRecord>>(new Map());

  // Computed - merge tenant credentials with update records
  const tableData = computed(() => {
    return tenantAuth$.credentials.map(cred => {
      const record = records.value.get(cred.id);
      return {
        tenantId: cred.id,
        tenantName: cred.name,
        updatedAt: record?.updatedAt ?? null,
        notesPending: record?.notesPending ?? 0,
        tasksPending: record?.tasksPending ?? 0,
        noteStatus: record?.noteStatus ?? 'neutral',
      } as TenantUpdateRecord;
    });
  });

  // Actions
  const addNote = (tenantId: string) => {
    const record = records.value.get(tenantId) ?? createEmptyRecord(tenantId);
    record.notesPending++;
    records.value.set(tenantId, record);
  };

  const addTask = (tenantId: string) => {
    const record = records.value.get(tenantId) ?? createEmptyRecord(tenantId);
    record.tasksPending++;
    records.value.set(tenantId, record);
  };

  const markUpdated = (tenantId: string) => {
    const record = records.value.get(tenantId) ?? createEmptyRecord(tenantId);
    record.updatedAt = new Date().toISOString();
    record.notesPending = 0;
    record.tasksPending = 0;
    records.value.set(tenantId, record);
  };

  const createEmptyRecord = (tenantId: string): TenantUpdateRecord => {
    const cred = tenantAuth$.credentials.find(c => c.id === tenantId);
    return {
      tenantId,
      tenantName: cred?.name ?? '',
      updatedAt: null,
      notesPending: 0,
      tasksPending: 0,
      noteStatus: 'neutral',
    };
  };

  const setNoteStatus = (tenantId: string, status: 'neutral' | 'verified' | 'failed') => {
    const record = records.value.get(tenantId) ?? createEmptyRecord(tenantId);
    record.noteStatus = status;
    records.value.set(tenantId, record);
  };

  const clearAllStatuses = () => {
    records.value.forEach((record) => {
      record.noteStatus = 'neutral';
    });
  };

  const reset = () => {
    records.value.clear();
  };

  return {
    // State
    records,

    // Computed
    tableData,

    // Actions
    addNote,
    addTask,
    markUpdated,
    setNoteStatus,
    clearAllStatuses,
    reset,
  };
});
