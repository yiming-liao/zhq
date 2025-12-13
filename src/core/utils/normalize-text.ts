/* eslint-disable unicorn/number-literal-case */
/* eslint-disable unicorn/prefer-code-point */
/* eslint-disable unicorn/prefer-string-replace-all */
export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[\u3000]/g, " ") // full-width space
    .replace(/[？]/g, "?")
    .replace(/[！]/g, "!")
    .replace(/[，]/g, ",")
    .replace(/[。]/g, ".")
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, (c) =>
      String.fromCharCode(c.charCodeAt(0) - 0xfe_e0),
    );
};
