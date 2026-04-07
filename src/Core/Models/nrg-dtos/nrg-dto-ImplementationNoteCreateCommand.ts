// ============ Implementation Notes Commands ============

export interface ImplementationNoteCreateCommand {
  $type: 'ImplementationNoteCreateCommand';
  Id: string;       // Client-generated UUID for this note
  Body: string;     // HTML content of the note
}

// ============ Command Results ============

export interface CommandResult {
  RedirectUrl: string | null;
  Data: unknown;
  ErrorView: string | null;
  IsSuccess: boolean;
  Messages: CommandMessage[];
  OutcomeType: number;
  OutcomeDescription: string | null;
  KeyMessages: string[];
}

export interface CommandMessage {
  Message: string;
  Type: number;
}

// ============ Factory Functions ============

export function createImplementationNoteCommand(
  body: string,
  id: string,
): ImplementationNoteCreateCommand {
  return {
    $type: 'ImplementationNoteCreateCommand',
    Id: id,
    Body: body,
  };
}

/**
 * Generate a UUID that does not collide with any existing note IDs.
 */
export function generateUniqueNoteId(existingIds: Set<string>): string {
  let id = crypto.randomUUID();
  while (existingIds.has(id)) {
    id = crypto.randomUUID();
  }
  return id;
}
