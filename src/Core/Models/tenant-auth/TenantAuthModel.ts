export interface TenantCredential {
  id: string;
  name: string;
  password: string;
}

export interface TenantAuthState {
  credentials: TenantCredential[];
}
