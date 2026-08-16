/**
 * Backward-compatible re-export for the shared domain types.
 *
 * This file preserves older imports from the pre-refactor layout while the app now organizes
 * models in src/shared/types.ts. Keeping the shim avoids breaking server-side code and older
 * references during the transition to the simplified structure.
 */

export * from './shared/types';
