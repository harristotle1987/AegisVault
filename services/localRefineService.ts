
// Fix: Use uppercase VaultRefiner to match the canonical filename and resolve casing conflicts.
import { VaultRefiner } from './VaultRefiner';

/**
 * @deprecated Use VaultRefiner class instead.
 * Provided for backward compatibility during the transition to the Sovereign-grade architecture.
 */
export const LocalRefineService = {
  refine: (markdown: string) => VaultRefiner.refine(markdown),
  suggestFilename: (markdown: string) => VaultRefiner.suggestFilename(markdown),
  applySmartTypography: (text: string) => VaultRefiner.refine(text)
};
