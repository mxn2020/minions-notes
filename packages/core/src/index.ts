/**
 * Minions Notes SDK
 *
 * Freeform annotations and observations attachable to any Minion
 *
 * @module @minions-notes/sdk
 */

export const VERSION = '0.1.0';

/**
 * Example: Create a client instance for Minions Notes.
 * Replace this with your actual SDK entry point.
 */
export function createClient(options = {}) {
    return {
        version: VERSION,
        ...options,
    };
}

export * from './schemas/index.js';
