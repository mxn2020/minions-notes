#!/usr/bin/env node

/**
 * @minions-notes/cli — CLI for Minions notes
 *
 * Uses minions-sdk's JsonFileStorageAdapter for sharded, atomic file storage:
 *   <rootDir>/<id[0..1]>/<id[2..3]>/<id>.json
 */

import { Command } from 'commander';
import chalk from 'chalk';
import {
    createMinion,
    updateMinion,
    softDelete,
    TypeRegistry,
} from 'minions-sdk';
import type { Minion } from 'minions-sdk';
import { JsonFileStorageAdapter } from 'minions-sdk/node';
import { customTypes } from '@minions-notes/sdk';

const program = new Command();
const STORE_DIR = process.env.MINIONS_STORE || '.minions';

const registry = new TypeRegistry();
for (const t of customTypes) { registry.register(t); }

let _storage: any | null = null;
async function getStorage() {
    if (!_storage) { _storage = await JsonFileStorageAdapter.create(STORE_DIR); }
    return _storage;
}

function findType(slug: string) {
    const type = registry.getBySlug(slug);
    if (!type) { console.error(chalk.red(`Unknown type: ${slug}`)); console.error(chalk.dim(`Available: ${customTypes.map(t => t.slug).join(', ')}`)); process.exit(1); }
    return type;
}

program.name('notes').description('Freeform annotations and observations attachable to any Minion').version('0.1.0');

program.command('info').description('Show project info').action(() => {
    console.log(chalk.bold('Minions notes'));
    console.log(chalk.dim('Freeform annotations and observations attachable to any Minion'));
    console.log('');
    console.log(`  SDK:    ${chalk.cyan('@minions-notes/sdk')}`);
    console.log(`  CLI:    ${chalk.cyan('@minions-notes/cli')}`);
    console.log(`  Python: ${chalk.cyan('minions_notes')}`);
    console.log(`  Store:  ${chalk.cyan(STORE_DIR)}`);
    console.log(`  Types:  ${chalk.cyan(String(customTypes.length))}`);
});

const types = program.command('types').description('Manage MinionType schemas');
types.command('list').alias('ls').description('List all available MinionTypes').action(() => {
    console.log(chalk.bold(`\n  ${customTypes.length} MinionTypes available:\n`));
    for (const type of customTypes) {
        console.log(`  ${type.icon}  ${chalk.bold(type.name)} ${chalk.dim(`(${type.slug})`)}`);
        console.log(`     ${chalk.dim(type.description || '')}`);
        console.log(`     ${chalk.dim(`${type.schema.length} fields: ${type.schema.map(f => f.name).join(', ')}`)}`);
        console.log('');
    }
});
types.command('show <slug>').description('Show detailed schema for a MinionType').action((slug: string) => {
    const type = findType(slug);
    console.log(`\n  ${type.icon}  ${chalk.bold(type.name)}`);
    console.log(`  ${chalk.dim(type.description || '')}`);
    console.log(`  ${chalk.dim(`ID: ${type.id}  Slug: ${type.slug}`)}\n`);
    console.log(chalk.bold('  Fields:\n'));
    for (const field of type.schema) {
        const c = field.type === 'string' ? 'green' : field.type === 'number' ? 'yellow' : field.type === 'boolean' ? 'blue' : 'magenta';
        console.log(`    ${field.required ? chalk.red('*') : ' '} ${chalk.bold(field.name)}  ${(chalk as any)[c](field.type)}`);
    }
    console.log('');
});

program.command('create <type>').description('Create a new Minion').option('-d, --data <json>', 'Field data as JSON').option('-f, --file <path>', 'Read from file').option('-t, --title <title>', 'Title').option('-s, --status <status>', 'Status').option('-p, --priority <priority>', 'Priority').option('--tags <tags>', 'Tags (comma-separated)').action(async (typeSlug: string, opts: any) => {
    const type = findType(typeSlug); const storage = await getStorage();
    let fields: Record<string, unknown> = {};
    if (opts.file) { const { readFileSync } = await import('fs'); fields = JSON.parse(readFileSync(opts.file, 'utf-8')); }
    else if (opts.data) { fields = JSON.parse(opts.data); }
    const title = opts.title || (fields as any).title || (fields as any).name || type.name;
    const tags = opts.tags ? opts.tags.split(',').map((t: string) => t.trim()) : undefined;
    const { minion } = createMinion({ title, fields, status: opts.status || 'active', priority: opts.priority, tags, createdBy: 'cli' }, type);
    await storage.set(minion);
    const hex = minion.id.replace(/-/g, '');
    console.log(chalk.green(`\n  ✔ Created ${type.icon} ${type.name}`));
    console.log(`  ${chalk.dim('ID:')}    ${minion.id}`);
    console.log(`  ${chalk.dim('Title:')} ${minion.title}`);
    console.log(`  ${chalk.dim('Path:')}  ${STORE_DIR}/${hex.slice(0, 2)}/${hex.slice(2, 4)}/${minion.id}.json\n`);
});

program.command('list [type]').alias('ls').description('List Minions').option('--status <status>', 'Filter by status').option('--json', 'JSON output').option('-n, --limit <n>', 'Max results', parseInt).action(async (typeSlug: string | undefined, opts: any) => {
    const storage = await getStorage(); const filter: any = {};
    if (typeSlug) { filter.minionTypeId = findType(typeSlug).id; }
    if (opts.status) filter.status = opts.status; if (opts.limit) filter.limit = opts.limit;
    const minions = await storage.list(filter);
    if (opts.json) { console.log(JSON.stringify(minions, null, 2)); return; }
    if (minions.length === 0) { console.log(chalk.dim('\n  No Minions found.\n')); return; }
    console.log(chalk.bold(`\n  ${minions.length} Minion(s):\n`));
    for (const m of minions) { const t = registry.getById(m.minionTypeId) || registry.getBySlug(m.minionTypeId); console.log(`  ${t?.icon || '?'}  ${chalk.bold(m.title)} ${m.status ? chalk.dim(`[${m.status}]`) : ''}`); console.log(`     ${chalk.dim(m.id)} ${chalk.dim(t?.slug || m.minionTypeId)}`); }
    console.log('');
});

program.command('show <id>').description('Show a Minion by ID').option('--json', 'JSON output').action(async (id: string, opts: any) => {
    const storage = await getStorage(); const minion = await storage.get(id);
    if (!minion) { console.error(chalk.red(`\n  Minion not found: ${id}\n`)); process.exit(1); }
    if (opts.json) { console.log(JSON.stringify(minion, null, 2)); return; }
    const type = registry.getById(minion.minionTypeId) || registry.getBySlug(minion.minionTypeId);
    console.log(`\n  ${type?.icon || '?'}  ${chalk.bold(minion.title)}`);
    console.log(`  ${chalk.dim(`Type: ${type?.slug || minion.minionTypeId}  ID: ${minion.id}`)}`);
    console.log(`  ${chalk.dim(`Status: ${minion.status || '-'}  Priority: ${minion.priority || '-'}`)}`);
    console.log(`  ${chalk.dim(`Created: ${minion.createdAt}  Updated: ${minion.updatedAt}`)}`);
    if (minion.tags?.length) console.log(`  ${chalk.dim(`Tags: ${minion.tags.join(', ')}`)}`);
    console.log(chalk.bold('\n  Fields:\n'));
    for (const [k, v] of Object.entries(minion.fields || {})) { console.log(`    ${chalk.dim('•')} ${chalk.bold(k)}: ${v}`); }
    console.log('');
});

program.command('update <id>').description('Update a Minion').option('-d, --data <json>', 'Fields JSON').option('-s, --status <status>').option('-p, --priority <priority>').option('-t, --title <title>').option('--tags <tags>').action(async (id: string, opts: any) => {
    const storage = await getStorage(); const existing = await storage.get(id);
    if (!existing) { console.error(chalk.red(`\n  Minion not found: ${id}\n`)); process.exit(1); }
    const updates: any = {};
    if (opts.data) updates.fields = { ...existing.fields, ...JSON.parse(opts.data) };
    if (opts.status) updates.status = opts.status; if (opts.priority) updates.priority = opts.priority;
    if (opts.title) updates.title = opts.title; if (opts.tags) updates.tags = opts.tags.split(',').map((t: string) => t.trim());
    const updatedObj = updateMinion(existing, { ...updates, updatedBy: 'cli' }, registry.getById(existing.minionTypeId) || registry.getBySlug(existing.minionTypeId)!);
    const updated = updatedObj.minion;
    await storage.set(updated);
    const type = registry.getById(updated.minionTypeId) || registry.getBySlug(updated.minionTypeId);
    console.log(chalk.green(`\n  ✔ Updated ${type?.icon || '?'} ${updated.title}\n`));
});

program.command('delete <id>').description('Soft-delete a Minion').option('--hard', 'Permanently remove').action(async (id: string, opts: any) => {
    const storage = await getStorage(); const existing = await storage.get(id);
    if (!existing) { console.error(chalk.red(`\n  Minion not found: ${id}\n`)); process.exit(1); }
    if (opts.hard) { await storage.delete(id); console.log(chalk.yellow(`\n  🗑  Permanently deleted ${id}\n`)); }
    else { const deleted = softDelete(existing, 'cli'); await storage.set(deleted); console.log(chalk.yellow(`\n  ✔ Soft-deleted ${existing.title}\n  Use --hard to permanently remove\n`)); }
});

program.command('search <query>').description('Full-text search').option('--json', 'JSON output').action(async (query: string, opts: any) => {
    const storage = await getStorage(); const results = await storage.search(query);
    if (opts.json) { console.log(JSON.stringify(results, null, 2)); return; }
    if (results.length === 0) { console.log(chalk.dim(`\n  No results for "${query}".\n`)); return; }
    console.log(chalk.bold(`\n  ${results.length} result(s) for "${query}":\n`));
    for (const m of results) { const t = registry.getById(m.minionTypeId) || registry.getBySlug(m.minionTypeId); console.log(`  ${t?.icon || '?'}  ${chalk.bold(m.title)} ${m.status ? chalk.dim(`[${m.status}]`) : ''}`); console.log(`     ${chalk.dim(m.id)} ${chalk.dim(t?.slug || m.minionTypeId)}`); }
    console.log('');
});

program.command('validate <file>').description('Validate against schema').action(async (file: string) => {
    const { readFileSync } = await import('fs'); const { validateFields } = await import('minions-sdk');
    const data = JSON.parse(readFileSync(file, 'utf-8')) as Minion;
    const type = registry.getById(data.minionTypeId) || registry.getBySlug(data.minionTypeId);
    if (!type) { console.error(chalk.red(`\n  Unknown type: ${data.minionTypeId}\n`)); process.exit(1); }
    const result = validateFields(data.fields, type.schema);
    if (result.valid) { console.log(chalk.green(`\n  ✔ Valid ${type.icon} ${type.name}\n`)); }
    else { console.log(chalk.red(`\n  ✘ ${result.errors.length} error(s):\n`)); for (const e of result.errors) console.log(`    ${chalk.red('•')} ${e.field}: ${e.message}`); console.log(''); process.exit(1); }
});

program.command('stats').description('Storage statistics').action(async () => {
    const storage = await getStorage(); console.log(chalk.bold('\n  Minion Statistics:\n'));
    let total = 0;
    for (const type of customTypes) { const ms = await storage.list({ minionTypeId: type.id }); total += ms.length; const bar = ms.length > 0 ? chalk.cyan('█'.repeat(Math.min(ms.length, 30))) : chalk.dim('0'); console.log(`  ${type.icon}  ${(type.name || '').padEnd(22)} ${String(ms.length).padStart(4)}  ${bar}`); }
    console.log(`\n  ${chalk.bold('Total:')} ${total} Minion(s)`);
    console.log(`  ${chalk.dim(`Store: ${STORE_DIR}`)}\n`);
});

program.parse();
