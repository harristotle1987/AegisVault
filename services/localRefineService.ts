
/**
 * @deprecated Use VaultRefiner class instead.
 * Provided for backward compatibility during the transition to the Sovereign-grade architecture.
 */
export const LocalRefineService = {
  refine: (markdown: string) => markdown,
  suggestFilename: (markdown: string) => "vault-export",
  applySmartTypography: (text: string) => text
};
