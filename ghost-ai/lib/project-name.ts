const LETTER_OR_NUMBER = new RegExp("[\\p{L}\\p{N}]", "u");

export function normalizeProjectName(value: string): string | null {
  const name = value.trim();
  return LETTER_OR_NUMBER.test(name) ? name : null;
}
