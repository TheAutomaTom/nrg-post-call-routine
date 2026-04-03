export interface TenantUpdateRecord {
  tenantId: string;      // References TenantCredential.id
  tenantName: string;    // Denormalized for display
  updatedAt: string | null;
  notesPending: number;
  tasksPending: number;
}
