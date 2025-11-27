/**
 * Legacy barrel export file
 *
 * @deprecated Import from '@/lib/utils' barrel instead of '@/lib/utils.ts'
 *
 * This file re-exports everything from the utils/index.ts barrel for backward
 * compatibility with existing imports from '@/lib/utils'.
 *
 * Both '@/lib/utils' and '@/lib/utils.ts' resolve to the same exports,
 * but the utils/index.ts barrel is the canonical source.
 */

export * from './utils/index';
