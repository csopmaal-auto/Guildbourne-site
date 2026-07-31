/** Dot-path get/set for the declarative editors ("hero.primaryCta.label"). */

export function getPath(obj: unknown, path: string): unknown {
  return path
    .split(".")
    .reduce<unknown>(
      (acc, key) =>
        acc && typeof acc === "object"
          ? (acc as Record<string, unknown>)[key]
          : undefined,
      obj,
    );
}

/** Immutable set — returns a new object with the value at path replaced. */
export function setPath<T>(obj: T, path: string, value: unknown): T {
  const keys = path.split(".");
  const clone = (node: unknown, depth: number): unknown => {
    if (depth === keys.length) return value;
    const key = keys[depth];
    if (Array.isArray(node)) {
      const copy = [...node];
      copy[Number(key)] = clone(node[Number(key)], depth + 1);
      return copy;
    }
    const record =
      node && typeof node === "object" ? (node as Record<string, unknown>) : {};
    return { ...record, [key]: clone(record[key], depth + 1) };
  };
  return clone(obj, 0) as T;
}
