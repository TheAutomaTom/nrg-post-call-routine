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

    // Create client outside try so finally can call logout
    const client = new NrgVintageCalls();

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

      // Step 3: Get app profile (validates session is active)
      await client.getAppProfile();

      // Step 4: Post the note with a client-generated UUID
      const commandResult = await client.createImplementationNote(html);
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

      // Step 5: Verify note was posted by fetching all notes
      const notes = await client.getImplementationNotes();
      const recentNote = notes.find(n => n.body.includes(html.substring(0, 50)));

      const result: PostingResult = {
        tenantId,
        success: true,
        message: recentNote
          ? `Note posted and verified (${notes.length} total notes)`
          : `Note posted (${notes.length} total notes, verification inconclusive)`,
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
      await client.logout();
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
