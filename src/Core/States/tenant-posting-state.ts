import { defineStore } from "pinia";
import { ref } from "vue";
import { useTenantAuthState } from "@/Core/States/tenant-auth-state";
import { NrgVintageCalls } from "@/Data/Clients/NrgVintageCalls";

export interface PostingResult {
  tenantId: string;
  success: boolean;
  message: string;
}

export const useTenantPostingState = defineStore("TenantPostingState", () => {
  const tenantAuth$ = useTenantAuthState();

  // State
  const isPosting = ref(false);
  const lastResult = ref<PostingResult | null>(null);

  // Actions
  const postNote = async (tenantId: string, html: string): Promise<PostingResult> => {
    isPosting.value = true;
    lastResult.value = null;

    try {
      // Get credentials for this tenant
      const cred = tenantAuth$.getById(tenantId);
      if (!cred) {
        const result: PostingResult = {
          tenantId,
          success: false,
          message: 'Tenant credentials not found',
        };
        lastResult.value = result;
        return result;
      }

      // Create a fresh client for this tenant's session
      const client = new NrgVintageCalls();

      // Step 1: Get environment for tenant login
      await client.getEnvironmentForTenant(cred.name);

      // Step 2: Login to tenant portal
      const loginResult = await client.loginToTenant(cred.name, cred.password);
      if (loginResult.ResultType !== 0) {
        const result: PostingResult = {
          tenantId,
          success: false,
          message: loginResult.OutcomeDescription ?? `Login failed (ResultType: ${loginResult.ResultType})`,
        };
        lastResult.value = result;
        return result;
      }

      // Step 3: Post the note
      const commandResult = await client.createImplementationNote(tenantId, html);
      if (!commandResult.IsSuccess) {
        const errorMsg = commandResult.KeyMessages?.join(', ')
          || commandResult.OutcomeDescription
          || 'Failed to create note';
        const result: PostingResult = {
          tenantId,
          success: false,
          message: errorMsg,
        };
        lastResult.value = result;
        return result;
      }

      const result: PostingResult = {
        tenantId,
        success: true,
        message: 'Note posted successfully',
      };
      lastResult.value = result;
      return result;

    } catch (error) {
      const result: PostingResult = {
        tenantId,
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
      };
      lastResult.value = result;
      return result;
    } finally {
      isPosting.value = false;
    }
  };

  const reset = () => {
    isPosting.value = false;
    lastResult.value = null;
  };

  return {
    // State
    isPosting,
    lastResult,

    // Actions
    postNote,
    reset,
  };
});
