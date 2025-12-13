export const safeRandomId = (prefix = ""): string => {
  // --- UUID (new envs)
  if (
    globalThis.crypto !== undefined &&
    typeof globalThis.crypto === "object" &&
    typeof globalThis.crypto.randomUUID === "function"
  ) {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }

  // --- Web Crypto fallback
  if (
    globalThis.crypto !== undefined &&
    typeof globalThis.crypto.getRandomValues === "function"
  ) {
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);

    const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(
      "",
    );

    return `${prefix}_${hex}`;
  }

  // --- Ultimate fallback
  return `${prefix}_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`;
};
