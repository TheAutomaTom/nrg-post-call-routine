// ============ Implementation Notes Commands ============

export interface ImplementationNoteCreateCommand {
  $type: 'ImplementationNoteCreateCommand';
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
  body: string
): ImplementationNoteCreateCommand {
  return {
    $type: 'ImplementationNoteCreateCommand',
    Body: body,
  };
}
