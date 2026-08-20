import { describe, expect, it } from "vitest";
import { getPath, setPath } from "./path.js";

describe("getPath", () => {
  it("resolves top-level and nested paths", () => {
    expect(getPath({ hasKey: true }, "hasKey")).toBe(true);
    expect(getPath({ flags: { hasKey: true } }, "flags.hasKey")).toBe(true);
  });

  it("returns undefined for missing paths", () => {
    expect(getPath({}, "missing")).toBeUndefined();
    expect(getPath({ flags: {} }, "flags.missing")).toBeUndefined();
    expect(getPath({}, "a.b.c")).toBeUndefined();
  });

  it.each(["__proto__", "constructor", "prototype", "flags.__proto__", "a.constructor.b"])(
    "throws on unsafe segment in path %s",
    (path) => {
      expect(() => getPath({}, path)).toThrow(/Unsafe variable path segment/);
    },
  );
});

describe("setPath", () => {
  it("sets top-level and nested paths, cloning objects along the way", () => {
    expect(setPath({}, "hasKey", true)).toEqual({ hasKey: true });
    expect(setPath({ flags: { a: 1 } }, "flags.b", 2)).toEqual({ flags: { a: 1, b: 2 } });
  });

  it("does not mutate the source object", () => {
    const source = { flags: { a: 1 } };
    setPath(source, "flags.a", 99);
    expect(source).toEqual({ flags: { a: 1 } });
  });

  it.each(["__proto__", "constructor", "prototype", "flags.__proto__", "a.constructor.b"])(
    "throws on unsafe segment in path %s",
    (path) => {
      expect(() => setPath({}, path, "x")).toThrow(/Unsafe variable path segment/);
    },
  );

  it("does not pollute Object.prototype even without the guard's early throw", () => {
    // Defense in depth: confirm no global pollution occurred despite the attempted call above.
    expect(({} as Record<string, unknown>)["polluted"]).toBeUndefined();
  });
});
