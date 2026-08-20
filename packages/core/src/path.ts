const UNSAFE_SEGMENTS = new Set(["__proto__", "prototype", "constructor"]);

function assertSafePath(segments: string[], path: string): void {
  for (const segment of segments) {
    if (UNSAFE_SEGMENTS.has(segment)) {
      throw new Error(`Unsafe variable path segment "${segment}" in path "${path}"`);
    }
  }
}

export function getPath(source: Record<string, unknown>, path: string): unknown {
  const segments = path.split(".");
  assertSafePath(segments, path);

  let current: unknown = source;
  for (const segment of segments) {
    if (current === null || typeof current !== "object") {
      return undefined;
    }
    current = (current as Record<string, unknown>)[segment];
  }
  return current;
}

/** Returns a new object with `path` set to `value`, cloning only the objects along the path. */
export function setPath(
  source: Record<string, unknown>,
  path: string,
  value: unknown,
): Record<string, unknown> {
  const segments = path.split(".");
  assertSafePath(segments, path);
  return setPathSegments(source, segments, value);
}

function setPathSegments(
  source: Record<string, unknown>,
  segments: string[],
  value: unknown,
): Record<string, unknown> {
  const [head, ...rest] = segments;
  if (head === undefined) return source;

  if (rest.length === 0) {
    return { ...source, [head]: value };
  }

  const child = source[head];
  const childObject = child !== null && typeof child === "object" ? (child as Record<string, unknown>) : {};
  return { ...source, [head]: setPathSegments(childObject, rest, value) };
}
