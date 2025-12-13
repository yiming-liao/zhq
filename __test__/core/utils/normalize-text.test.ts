import { describe, it, expect } from "vitest";
import { normalizeText } from "@/core/utils/normalize-text";

describe("normalizeText", () => {
  it("lowercases latin characters", () => {
    expect(normalizeText("Account LOGIN")).toBe("account login");
  });

  it("normalizes full-width spaces to half-width spaces", () => {
    expect(normalizeText("Hello　World")).toBe("hello world");
  });

  it("normalizes full-width punctuation to half-width punctuation", () => {
    expect(normalizeText("可以退款嗎？")).toBe("可以退款嗎?");
    expect(normalizeText("太貴了！")).toBe("太貴了!");
    expect(normalizeText("價格，是多少。")).toBe("價格,是多少.");
  });

  it("normalizes full-width latin letters and numbers", () => {
    expect(normalizeText("ＡＢＣ１２３")).toBe("abc123");
    expect(normalizeText("ａｂｃ４５６")).toBe("abc456");
  });

  it("handles mixed full-width and half-width input correctly", () => {
    expect(normalizeText("Ａccount　１２３？")).toBe("account 123?");
  });

  it("does not modify chinese characters", () => {
    expect(normalizeText("帳號可以在多個裝置登入嗎")).toBe(
      "帳號可以在多個裝置登入嗎",
    );
  });

  it("is idempotent (calling twice gives the same result)", () => {
    const input = "ＡＢＣ　１２３？";
    expect(normalizeText(normalizeText(input))).toBe(normalizeText(input));
  });
});
