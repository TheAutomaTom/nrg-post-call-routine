// ============ Implementation Notes Queries ============

export interface ImplementationNotesQuery {
  $type: 'ImplementationNotesQuery';
}

export interface ImplementationNote {
  id: string;
  body: string;
  isPinned: boolean;
  authorId: string;
  authorName: string;
  isCreatedByCurrentUser: boolean;
  created: string;
  edited: string | null;
  lastModified: string;
  entityId: string;
  parentId: string | null;
  reactions: unknown[];
}
