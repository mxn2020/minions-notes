"""
Minions Notes SDK — Type Schemas
Custom MinionType schemas for Minions Notes.
"""

from minions.types import FieldDefinition, FieldValidation, MinionType

note_type = MinionType(
    id="notes-note",
    name="Note",
    slug="note",
    description="A freeform annotation attached to any Minion.",
    icon="📝",
    schema=[
        FieldDefinition(name="title", type="string", label="title"),
        FieldDefinition(name="body", type="string", label="body"),
        FieldDefinition(name="authorId", type="string", label="authorId"),
        FieldDefinition(name="authorType", type="select", label="authorType"),
        FieldDefinition(name="createdAt", type="string", label="createdAt"),
        FieldDefinition(name="updatedAt", type="string", label="updatedAt"),
        FieldDefinition(name="contextRefType", type="string", label="contextRefType"),
        FieldDefinition(name="contextRefId", type="string", label="contextRefId"),
        FieldDefinition(name="tags", type="string", label="tags"),
        FieldDefinition(name="pinned", type="boolean", label="pinned"),
    ],
)

note_revision_type = MinionType(
    id="notes-note-revision",
    name="Note revision",
    slug="note-revision",
    description="A saved previous version of a note body.",
    icon="📜",
    schema=[
        FieldDefinition(name="noteId", type="string", label="noteId"),
        FieldDefinition(name="body", type="string", label="body"),
        FieldDefinition(name="savedAt", type="string", label="savedAt"),
        FieldDefinition(name="savedBy", type="string", label="savedBy"),
    ],
)

note_link_type = MinionType(
    id="notes-note-link",
    name="Note link",
    slug="note-link",
    description="A named connection between two notes.",
    icon="🔗",
    schema=[
        FieldDefinition(name="fromNoteId", type="string", label="fromNoteId"),
        FieldDefinition(name="toNoteId", type="string", label="toNoteId"),
        FieldDefinition(name="relation", type="string", label="relation"),
    ],
)

custom_types: list[MinionType] = [
    note_type,
    note_revision_type,
    note_link_type,
]

