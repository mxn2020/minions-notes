**MINIONS NOTES — IMPLEMENTATION SPEC**

You are tasked with creating the complete initial foundation for `minions-notes` — a structured notes and knowledge base system that serves as an "Obsidian-style linked notes" platform. This is part of the Minions ecosystem, a universal structured object system designed for building AI-native tools.

---

**PROJECT OVERVIEW**

`minions-notes` provides a powerful linked note-taking system with backlink tracking, full-text search, semantic clustering, and Markdown rendering with `[[wikilink]]` support. It allows developers and agents to build persistent knowledge bases with rich interconnections, detect knowledge gaps, and find emergent patterns.

The core concept: notes should be interconnected, searchable, and queryable — enabling both humans and AI agents to build and navigate complex knowledge graphs. Agents can maintain persistent memory, discover connections between ideas, and reason over their knowledge base.

---

**CONCEPT OVERVIEW**

This project is built on the Minions SDK (`minions-sdk`), which provides the foundational primitives: Minion (structured object instance), Minion Type (schema), and Relation (typed link between minions).

Notes are linked via `references` relations, forming backlink networks. Tags enable semantic grouping and clustering. Embeds allow one note to include another's content. Daily notes provide temporal scaffolding for journal-style workflows.

The system supports both TypeScript and Python SDKs with cross-language interoperability (both serialize to the same JSON format). All documentation includes dual-language code examples with tabbed interfaces.

---

**CORE PRIMITIVES**

This project defines the following Minion Types:

- `note` — A markdown note with content, title, tags, and backlink support
- `notebook` — A collection of related notes (organizational container)
- `tag` — A semantic tag that can be applied to multiple notes
- `backlink` — An explicit link from one note to another (via `references` relations)
- `embed` — A reference to embed another note's content within a note

---

**MINIONS SDK REFERENCE — REQUIRED DEPENDENCY**

This project depends on `minions-sdk`, a published package that provides the foundational primitives. The GH Agent building this project MUST install it from the public registries and use the APIs documented below — do NOT reimplement minions primitives from scratch.

**Installation:**
```bash
# TypeScript (npm)
npm install minions-sdk
# or: pnpm add minions-sdk

# Python (PyPI) — package name is minions-sdk, but you import as "minions"
pip install minions-sdk
```

**TypeScript SDK — Core Imports:**
```typescript
import {
  // Core types
  type Minion, type MinionType, type Relation,
  type FieldDefinition, type FieldValidation, type FieldType,
  type CreateMinionInput, type UpdateMinionInput, type CreateRelationInput,
  type MinionStatus, type MinionPriority, type RelationType,
  type ExecutionResult, type Executable,
  type ValidationError, type ValidationResult,

  // Validation
  validateField, validateFields,

  // Built-in Schemas (10 MinionType instances — reuse where applicable)
  noteType, linkType, fileType, contactType,
  agentType, teamType, thoughtType, promptTemplateType, testCaseType, taskType,
  builtinTypes,

  // Registry — stores and retrieves MinionTypes by id or slug
  TypeRegistry,

  // Relations — in-memory directed graph with traversal utilities
  RelationGraph,

  // Lifecycle — CRUD operations with validation
  createMinion, updateMinion, softDelete, hardDelete, restoreMinion,

  // Evolution — migrate minions when schemas change (preserves removed fields in _legacy)
  migrateMinion,

  // Utilities
  generateId, now, SPEC_VERSION,
} from 'minions-sdk';
```

**Python SDK — Core Imports:**
```python
from minions import (
    # Types
    Minion, MinionType, Relation, FieldDefinition, FieldValidation,
    CreateMinionInput, UpdateMinionInput, CreateRelationInput,
    ExecutionResult, Executable, ValidationError, ValidationResult,
    # Validation
    validate_field, validate_fields,
    # Built-in Schemas (10 types)
    note_type, link_type, file_type, contact_type,
    agent_type, team_type, thought_type, prompt_template_type,
    test_case_type, task_type, builtin_types,
    # Registry
    TypeRegistry,
    # Relations
    RelationGraph,
    # Lifecycle
    create_minion, update_minion, soft_delete, hard_delete, restore_minion,
    # Evolution
    migrate_minion,
    # Utilities
    generate_id, now, SPEC_VERSION,
)
```

**Key Concepts:**
- A `MinionType` defines a schema (list of `FieldDefinition`s) — each field has `name`, `type`, `label`, `required`, `defaultValue`, `options`, `validation`
- A `Minion` is an instance with `id`, `title`, `minionTypeId`, `fields` (dict), `status`, `tags`, timestamps
- A `Relation` is a typed directional link (12 types: `parent_of`, `depends_on`, `implements`, `relates_to`, `inspired_by`, `triggers`, `references`, `blocks`, `alternative_to`, `part_of`, `follows`, `integration_link`)
- Field types: `string`, `number`, `boolean`, `date`, `select`, `multi-select`, `url`, `email`, `textarea`, `tags`, `json`, `array`
- `TypeRegistry` auto-loads 10 built-in types; register custom types with `registry.register(myType)`
- `createMinion(input, type)` validates fields against the schema and returns `{ minion, validation }` (TS) or `(minion, validation)` tuple (Python)
- Both SDKs serialize to identical camelCase JSON; Python provides `to_dict()` / `from_dict()` for conversion

**IMPORTANT:** Do NOT recreate these primitives. Import them from `minions-sdk` (npm) / `minions` (PyPI). Build your domain-specific types and utilities ON TOP of the SDK.

---

**WHAT YOU NEED TO CREATE**

**1. THE SPECIFICATION** (`/spec`)

Write a complete markdown specification document covering:

- Motivation and goals — why linked notes matter for knowledge management and AI agents
- Glossary of terms specific to note-taking and knowledge graphs
- Core type definitions for all five minion types with full field schemas
- Wikilink syntax — `[[Note Title]]` and `[[Note Title|Display Text]]` formats
- Backlink semantics — how `references` relations form bidirectional link networks
- Embed syntax — `![[Note Title]]` for embedding note content
- Tag system — hierarchical tags with `#tag/subtag` support
- Search capabilities — full-text search with ranking algorithms
- Daily note scaffolding — automatic date-based note generation
- Graph traversal algorithms — finding orphans, clusters, and connection paths
- Best practices for knowledge base organization
- Conformance checklist for implementations

**2. THE CORE LIBRARY** (`/packages/core`)

A framework-agnostic TypeScript library built on `minions-sdk`. Must include:
- **Unified Client Architecture**:
  - A standalone `MinionsNotes` client class that wraps all primitives and utilities in a unified facade.
  - A `NotesPlugin` class that implements `MinionPlugin` for mounting onto the core `Minions` client (e.g. `minions.notes`).
  - Both modular (direct imports) and centralized (client instance) usage must be supported.

- Full TypeScript type definitions for all note-specific types
- `NoteGraph` class — traverse `references` relations to build knowledge graphs
  - `getBacklinks(noteId)` — returns all notes linking to this note
  - `getOutboundLinks(noteId)` — returns all notes this note links to
  - `getOrphans()` — finds notes with no inbound or outbound links
  - `getConnectionPath(noteIdA, noteIdB)` — finds shortest path between notes
  - `getClusters(tag?)` — groups notes by semantic similarity
  - `getRelatedNotes(noteId, depth)` — traverses graph to find related notes
- `NoteSearch` class — full-text search with ranking
  - `search(query)` — returns ranked list of matching notes
  - `searchByTag(tag)` — finds all notes with specific tag
  - `searchByDate(dateRange)` — finds notes created/updated in range
  - Ranking algorithm based on relevance, recency, and connection density
- `NoteRenderer` class — Markdown rendering with wikilink resolution
  - `render(noteId)` — converts Markdown to HTML with resolved wikilinks
  - `resolveWikilinks(content)` — replaces `[[Note Title]]` with actual note IDs
  - `renderEmbed(embedId)` — fetches and renders embedded note content
  - `extractLinks(content)` — parses content for `[[wikilinks]]` and creates relations
- `DailyNoteScaffolder` class — daily note automation
  - `getOrCreateDailyNote(date)` — returns existing or creates new daily note
  - `getTodaysNote()` — shorthand for today's daily note
  - `getDateRange(startDate, endDate)` — returns all daily notes in range
  - Template support for daily note structure
- `TagManager` class — tag organization and hierarchy
  - `getTagHierarchy()` — returns tree structure of all tags
  - `getNotesByTag(tag, includeSubtags)` — finds notes with tag or subtags
  - `renameTag(oldTag, newTag)` — updates all notes using tag
  - `mergeTag(sourceTag, targetTag)` — consolidates tags
- `ClusterAnalyzer` class — semantic grouping
  - `cluster(tag?)` — groups notes by tag similarity
  - `suggestTags(noteId)` — recommends tags based on related notes
  - `findSimilarNotes(noteId, threshold)` — finds notes with similar content/tags
- Clean public API with comprehensive JSDoc documentation
- Zero storage opinions — works with any backend

**3. THE PYTHON SDK** (`/packages/python`)

A complete Python port of the core library with identical functionality:
- **Unified Client Architecture**:
  - `MinionsNotes` standalone client class.
  - `NotesPlugin` class for mounting onto the core `Minions` client.

- Python type hints for all classes and methods
- `NoteGraph`, `NoteSearch`, `NoteRenderer`, `DailyNoteScaffolder`, `TagManager`, `ClusterAnalyzer` classes
- Same method signatures as TypeScript version (following Python naming conventions)
- Serializes to identical JSON format as TypeScript SDK (cross-language interoperability)
- Full docstrings compatible with Sphinx documentation generation
- Published to PyPI as `minions-notes`

**4. THE CLI** (`/packages/cli`)

A command-line tool called `notes` that provides:

```bash
notes new "Meeting with Acme"
# Interactively create a new note with Markdown content

notes today
# Get or create today's daily note

notes search "quantum computing"
# Full-text search across all notes with ranked results

notes backlinks <id>
# Show all notes linking to this note

notes orphans
# List all notes with no inbound or outbound links

notes graph --output graph.json
# Export knowledge graph structure as JSON

notes export <id> --format markdown
# Export note to Markdown file

notes tag list
# Show all tags with note counts

notes tag rename "old-tag" "new-tag"
# Rename tag across all notes

notes cluster --tag research
# Group notes by semantic similarity

notes related <id> --depth 2
# Find related notes within specified depth

notes embed <note-id> <target-id>
# Create embed relation from target note to source note

notes link <source-id> <target-id>
# Create explicit link between notes

notes path <id-a> <id-b>
# Find shortest connection path between two notes
```

Additional features:
- Interactive Markdown editor for note content
- Colored output for search results and backlinks
- JSON output mode for programmatic usage
- Config file support (`.notesrc.json`) for default settings
- Template system for daily notes and custom note types

**5. THE DOCUMENTATION SITE** (`/apps/docs`)

Built with Astro Starlight. Must include:

- Landing page — "Obsidian-style linked notes" positioning, emphasize AI agent knowledge base
- Getting started guide with both TypeScript and Python examples
- Core concepts:
  - What is a note vs. notebook
  - Wikilinks and backlinks
  - Tags and semantic clustering
  - Embeds and transclusion
  - Daily notes workflow
  - Knowledge graph traversal
- API reference for both TypeScript and Python
  - Dual-language code tabs for all examples
  - Auto-generated from JSDoc/docstrings where possible
- Guides:
  - Building a personal knowledge base
  - Wikilink syntax and best practices
  - Organizing notes with tags and notebooks
  - Finding orphan notes and knowledge gaps
  - Using daily notes effectively
  - Building agents that maintain knowledge bases
  - Graph traversal patterns
  - Full-text search optimization
- CLI reference with example commands
- Integration examples:
  - Importing from Obsidian
  - Exporting to Markdown
  - Agent memory persistence
  - Building a Zettelkasten
- Best practices for knowledge base organization
- Contributing guide

**6. OPTIONAL: THE WEB EDITOR** (`/apps/web`)

A visual note editor (optional but recommended):

- Markdown editor with live preview
- Wikilink autocomplete (`[[` triggers note search)
- Backlink panel showing inbound references
- Tag browser with hierarchical display
- Graph visualization (force-directed layout)
- Daily note calendar view
- Full-text search interface with filters
- Embed preview inline
- Built with Next.js or SvelteKit (your choice based on ecosystem consistency)

---

**PROJECT STRUCTURE**

Standard Minions ecosystem monorepo structure:

```
minions-notes/
  packages/
    core/                 # TypeScript core library
      src/
        types.ts          # Type definitions
        NoteGraph.ts
        NoteSearch.ts
        NoteRenderer.ts
        DailyNoteScaffolder.ts
        TagManager.ts
        ClusterAnalyzer.ts
        index.ts          # Public API surface
      test/
      package.json
    python/               # Python SDK
      minions_notes/
        __init__.py
        types.py
        note_graph.py
        note_search.py
        note_renderer.py
        daily_note_scaffolder.py
        tag_manager.py
        cluster_analyzer.py
      tests/
      pyproject.toml
    cli/                  # CLI tool
      src/
        commands/
          new.ts
          today.ts
          search.ts
          backlinks.ts
          orphans.ts
          graph.ts
          export.ts
          tag.ts
          cluster.ts
          related.ts
          embed.ts
          link.ts
          path.ts
        index.ts
      package.json
  apps/
    docs/                 # Astro Starlight documentation
      src/
        content/
          docs/
            index.md
            getting-started.md
            concepts/
            guides/
            api/
              typescript/
              python/
            cli/
      astro.config.mjs
      package.json
    web/                  # Optional editor
      src/
      package.json
  spec/
    v0.1.md              # Full specification
  examples/
    typescript/
      simple-note.ts
      daily-notes.ts
      knowledge-graph.ts
    python/
      simple_note.py
      daily_notes.py
      knowledge_graph.py
  .github/
    workflows/
      ci.yml             # Lint, test, build for both TS and Python
      publish.yml        # Publish to npm and PyPI
  README.md
  LICENSE                # AGPL-3.0
  package.json           # Workspace root
```

---

**BEYOND STANDARD PATTERN**

These utilities and classes are specific to `@minions-notes/sdk`:

**NoteGraph**
- Traverses `references` relations to build and query knowledge graphs
- Methods: `getBacklinks()`, `getOutboundLinks()`, `getOrphans()`, `getConnectionPath()`, `getClusters()`, `getRelatedNotes()`
- Detects orphan notes (isolated knowledge)
- Finds shortest connection paths between notes
- Clusters notes by semantic similarity

**NoteSearch**
- Full-text search using `searchableText` field with ranking
- Ranking algorithm considers: term frequency, recency, connection density
- Supports filtering by tags, date ranges, and notebooks
- Returns structured results with match context snippets

**NoteRenderer**
- Markdown to HTML conversion with wikilink resolution
- Parses `[[Note Title]]` and `[[Note Title|Display Text]]` syntax
- Resolves note titles to minion IDs via title lookup
- Handles embed syntax `![[Note Title]]` by fetching and inserting content
- Extracts links during parsing and creates/updates `references` relations

**DailyNoteScaffolder**
- Automatic daily note generation with consistent naming (e.g., `2026-02-19`)
- Template system for daily note structure (customizable sections)
- Quick access to today's note and date ranges
- Integration with calendar workflows

**TagManager**
- Hierarchical tag management with `#parent/child` syntax
- Tag renaming and merging operations
- Tag usage statistics and orphan tag detection
- Autocomplete suggestions based on existing tags

**ClusterAnalyzer**
- Semantic grouping using tag overlap and content similarity
- `cluster(tag?)` groups notes by similarity within tag scope
- `suggestTags(noteId)` recommends tags based on related notes
- `findSimilarNotes(noteId)` discovers connections based on content

**Wikilink Parser**
- Extracts all `[[wikilinks]]` from Markdown content
- Resolves note titles to IDs (handles ambiguity)
- Creates `references` relations automatically
- Supports both `[[Title]]` and `[[Title|Display]]` formats

---

**CLI COMMANDS**

All commands with detailed specifications:

**`notes new <title>`**
- Interactive Markdown editor or accepts `--content` flag
- Creates `note` minion with provided content
- Automatically parses and creates `references` relations for wikilinks
- Optionally adds to notebook via `--notebook` flag
- Returns created minion ID

**`notes today`**
- Gets or creates today's daily note
- Uses configured template if creating new note
- Opens in editor or displays content
- Returns note ID

**`notes search <query>`**
- Full-text search with ranking
- Displays results with context snippets
- Accepts `--tag`, `--notebook`, `--since`, `--until` filters
- Can output JSON with `--json` flag

**`notes backlinks <id>`**
- Shows all notes with `references` relations pointing to this note
- Displays note titles, excerpts, and link context
- Can output as graph with `--graph` flag

**`notes orphans`**
- Lists all notes with no inbound or outbound `references`
- Useful for finding isolated knowledge
- Suggests potential links based on content similarity

**`notes graph --output <file>`**
- Exports full knowledge graph structure
- Output formats: JSON, GraphML, DOT (Graphviz)
- Includes nodes (notes) and edges (references)

**`notes export <id> --format <markdown|html|json>`**
- Exports note to specified format
- Markdown: raw content with wikilinks
- HTML: rendered with resolved links
- JSON: full structured minion data

**`notes tag list`**
- Shows all tags with usage counts
- Displays hierarchical structure
- Can filter by pattern

**`notes tag rename <old> <new>`**
- Renames tag across all notes
- Updates tag hierarchy if nested
- Creates relation history for tracking

**`notes cluster [--tag <tag>]`**
- Groups notes by semantic similarity
- Optionally scopes to specific tag
- Displays clusters with representative notes

**`notes related <id> --depth <n>`**
- Traverses graph to find related notes
- Depth controls how many hops to explore
- Returns notes sorted by relevance score

**`notes embed <note-id> <target-id>`**
- Creates `embed` minion linking target to source
- When target is rendered, source content is included
- Maintains live updates if source changes

**`notes link <source-id> <target-id>`**
- Creates explicit `references` relation
- Useful for programmatic link creation
- Returns relation ID

**`notes path <id-a> <id-b>`**
- Finds shortest connection path between notes
- Displays intermediate notes and relations
- Helps understand knowledge structure

---

**DUAL SDK REQUIREMENTS**

Critical cross-language compatibility requirements:

**Serialization Parity**
- Both TypeScript and Python SDKs must serialize minions to identical JSON format
- Field names, types, and structure must match exactly
- Relation types and metadata must be interchangeable

**API Consistency**
- Same method names (adjusted for language conventions: TypeScript camelCase, Python snake_case)
- Same parameters and return types
- Same class hierarchies and interfaces

**Documentation Parity**
- Every code example in docs must have both TypeScript and Python versions
- Use Astro Starlight's code tabs: `<Tabs><TabItem label="TypeScript">...</TabItem><TabItem label="Python">...</TabItem></Tabs>`
- API reference must document both languages side by side

**Testing Parity**
- Shared test fixtures (JSON files) that both SDKs can consume
- Identical test case coverage
- Cross-language integration tests (TypeScript SDK creates note, Python SDK queries it)

---

**FIELD SCHEMAS**

Define these Minion Types with full JSON Schema definitions:

**`note`**
```typescript
{
  id: string;
  title: string;
  content: string;              // Markdown content with [[wikilinks]]
  description?: string;
  tags?: string[];              // Tags for semantic grouping
  notebookId?: string;          // Optional parent notebook
  metadata?: Record<string, any>;  // Custom fields
  searchableText: string;       // Auto-generated for search
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `references` → other `note` minions (for wikilinks)
Relations: `part_of` → `notebook` (if organized)

**`notebook`**
```typescript
{
  id: string;
  title: string;
  description?: string;
  color?: string;               // Visual organization
  icon?: string;
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `parent_of` → `note` minions

**`tag`**
```typescript
{
  id: string;
  title: string;                // Tag name (e.g., "research/quantum")
  description?: string;
  color?: string;
  usageCount?: number;          // How many notes use this tag
  parentTagId?: string;         // For hierarchical tags
  createdAt: Date;
  updatedAt: Date;
}
```

**`backlink`**
```typescript
{
  id: string;
  title: string;
  sourceNoteId: string;         // Note containing the link
  targetNoteId: string;         // Note being linked to
  context?: string;             // Surrounding text where link appears
  linkText?: string;            // Display text if using [[Title|Display]]
  createdAt: Date;
  updatedAt: Date;
}
```
Note: Backlinks are represented via `references` relations, but this type allows storing rich metadata.

**`embed`**
```typescript
{
  id: string;
  title: string;
  sourceNoteId: string;         // Note being embedded
  targetNoteId: string;         // Note containing the embed
  displayMode?: 'inline' | 'card' | 'link';
  createdAt: Date;
  updatedAt: Date;
}
```
Relations: `references` → `note` being embedded

---

**TONE AND POSITIONING**

This is a serious tool for knowledge management and AI agent memory. Position it as:

- **Obsidian-style linked notes** — familiar patterns for knowledge workers
- **Agent knowledge base** — persistent memory for AI agents
- **Graph-native** — designed around connections, not hierarchies
- **Production-ready** — not a prototype, built for real knowledge work

Avoid:
- Overselling "second brain" marketing tropes
- Complexity for complexity's sake
- Assuming familiarity with Zettelkasten jargon

The README should open with a concrete example: creating a note, linking it to another, searching, and finding orphans. Make it immediately tangible.

---

**INTEGRATION EXAMPLES**

Include working examples for:

**Agent Knowledge Base** (TypeScript)
```typescript
import { NoteGraph, NoteSearch, DailyNoteScaffolder } from '@minions-notes/sdk';

// Agent stores observations in daily note
const scaffolder = new DailyNoteScaffolder();
const todayNote = await scaffolder.getTodaysNote();
await todayNote.append(`
## Observation: User prefers concise responses
- Detected in conversation #42
- Related to [[Communication Style]]
`);

// Later, agent searches its memory
const search = new NoteSearch();
const results = await search.search('communication preferences');
// Agent finds relevant past observations
```

**Knowledge Graph Traversal** (Python)
```python
from minions_notes import NoteGraph, ClusterAnalyzer

# Find related notes within 2 hops
graph = NoteGraph()
related = graph.get_related_notes(note_id, depth=2)

# Detect knowledge gaps (orphans)
orphans = graph.get_orphans()
for orphan in orphans:
    print(f"Isolated note: {orphan.title}")

# Find semantic clusters
analyzer = ClusterAnalyzer()
clusters = analyzer.cluster(tag='research')
for cluster in clusters:
    print(f"Cluster: {[n.title for n in cluster]}")
```

**Daily Notes Workflow** (TypeScript)
```typescript
import { DailyNoteScaffolder, NoteRenderer } from '@minions-notes/sdk';

// Get today's note with template
const scaffolder = new DailyNoteScaffolder({
  template: `
# {{date}}

## Tasks
- [ ]

## Notes

## Reflections
`
});

const today = await scaffolder.getTodaysNote();
// Note is created with template if doesn't exist
```

---

**DELIVERABLES**

Produce all files necessary to bootstrap this project completely:

1. **Full specification** (`/spec/v0.1.md`) — complete enough to implement from
2. **TypeScript core library** (`/packages/core`) — fully functional, well-tested
3. **Python SDK** (`/packages/python`) — feature parity with TypeScript
4. **CLI tool** (`/packages/cli`) — all commands working with helpful output
5. **Documentation site** (`/apps/docs`) — complete with dual-language examples
6. **README** — compelling, clear, with concrete examples
7. **Examples** — working code in both TypeScript and Python
8. **CI/CD setup** — lint, test, and publish workflows for both languages

Every file should be production quality — not stubs, not placeholders. The spec should be complete. The core libraries should be fully functional. The docs should be ready to publish. The CLI should be ready to install and use.

---

**START SYSTEMATICALLY**

1. Write the specification first — nail down the field schemas and wikilink syntax
2. Implement TypeScript core library with full type definitions
3. Port to Python maintaining exact serialization compatibility
4. Build CLI using the core library
5. Write documentation with dual-language examples throughout
6. Create working examples demonstrating key workflows
7. Write the README with concrete use cases

This is a critical tool for agent memory persistence and knowledge management. Agents will use this to maintain context across sessions and discover emergent patterns in their knowledge. Get it right.
