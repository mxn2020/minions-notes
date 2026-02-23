/**
 * @module @minions-notes/sdk/schemas
 * Custom MinionType schemas for Minions Notes.
 */

import type { MinionType } from 'minions-sdk';

export const noteType: MinionType = {
  id: 'notes-note',
  name: 'Note',
  slug: 'note',
  description: 'A freeform annotation attached to any Minion.',
  icon: '📝',
  schema: [
    { name: 'title', type: 'string', label: 'title' },
    { name: 'body', type: 'string', label: 'body' },
    { name: 'authorId', type: 'string', label: 'authorId' },
    { name: 'authorType', type: 'select', label: 'authorType' },
    { name: 'createdAt', type: 'string', label: 'createdAt' },
    { name: 'updatedAt', type: 'string', label: 'updatedAt' },
    { name: 'contextRefType', type: 'string', label: 'contextRefType' },
    { name: 'contextRefId', type: 'string', label: 'contextRefId' },
    { name: 'tags', type: 'string', label: 'tags' },
    { name: 'pinned', type: 'boolean', label: 'pinned' },
  ],
};

export const noterevisionType: MinionType = {
  id: 'notes-note-revision',
  name: 'Note revision',
  slug: 'note-revision',
  description: 'A saved previous version of a note body.',
  icon: '📜',
  schema: [
    { name: 'noteId', type: 'string', label: 'noteId' },
    { name: 'body', type: 'string', label: 'body' },
    { name: 'savedAt', type: 'string', label: 'savedAt' },
    { name: 'savedBy', type: 'string', label: 'savedBy' },
  ],
};

export const notelinkType: MinionType = {
  id: 'notes-note-link',
  name: 'Note link',
  slug: 'note-link',
  description: 'A named connection between two notes.',
  icon: '🔗',
  schema: [
    { name: 'fromNoteId', type: 'string', label: 'fromNoteId' },
    { name: 'toNoteId', type: 'string', label: 'toNoteId' },
    { name: 'relation', type: 'string', label: 'relation' },
  ],
};

export const customTypes: MinionType[] = [
  noteType,
  noterevisionType,
  notelinkType,
];

