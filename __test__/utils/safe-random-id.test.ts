/* eslint-disable @typescript-eslint/no-explicit-any */
import { describe, it, expect, afterEach, vi } from "vitest";
import { safeRandomId } from "@/utils/safe-random-id";

const originalCrypto = globalThis.crypto;

function mockCrypto(value: any) {
  Object.defineProperty(globalThis, "crypto", {
    value,
    configurable: true,
  });
}

describe("safeRandomId", () => {
  afterEach(() => {
    Object.defineProperty(globalThis, "crypto", {
      value: originalCrypto,
      configurable: true,
    });
    vi.restoreAllMocks();
  });

  it("uses crypto.randomUUID when available", () => {
    const randomUUID = vi.fn(() => "uuid-1234");
    mockCrypto({ randomUUID });
    const id = safeRandomId("test");
    expect(randomUUID).toHaveBeenCalled();
    expect(id).toBe("test_uuid-1234");
  });

  it("falls back to crypto.getRandomValues when randomUUID is not available", () => {
    const getRandomValues = vi.fn((arr: Uint8Array) => {
      arr.fill(1);
      return arr;
    });
    mockCrypto({ getRandomValues });
    const id = safeRandomId("test");
    expect(getRandomValues).toHaveBeenCalled();
    expect(id.startsWith("test_")).toBe(true);
    expect(id.length).toBeGreaterThan("test_".length);
  });

  it("falls back to time + Math.random when crypto is not available", () => {
    // eslint-disable-next-line unicorn/no-useless-undefined
    mockCrypto(undefined);
    const id = safeRandomId("test");
    expect(id.startsWith("test_")).toBe(true);
    expect(typeof id).toBe("string");
  });
});
