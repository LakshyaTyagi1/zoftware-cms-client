export const SITE_DRAFT_STORAGE_KEY = "zoftware.siteDraft";
export const SITE_DRAFT_CHANGE_EVENT = "zoftware:site-draft-change";

type PlainObject = Record<string, unknown>;

export function readSiteDraft(): PlainObject {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    return JSON.parse(window.localStorage.getItem(SITE_DRAFT_STORAGE_KEY) ?? "{}");
  } catch {
    return {};
  }
}

export function storeSiteDraft(draft: PlainObject) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SITE_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  window.dispatchEvent(new CustomEvent(SITE_DRAFT_CHANGE_EVENT, { detail: draft }));
}

export function clearSiteDraft() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(SITE_DRAFT_STORAGE_KEY);
  window.dispatchEvent(new CustomEvent(SITE_DRAFT_CHANGE_EVENT, { detail: {} }));
}

export function mergeDeep<T>(base: T, override: unknown): T {
  if (Array.isArray(base) && Array.isArray(override)) {
    return base.map((item, index) => {
      const overrideItem = override[index];
      return overrideItem === undefined || overrideItem === null
        ? item
        : mergeDeep(item, overrideItem);
    }) as T;
  }

  if (!isPlainObject(base) || !isPlainObject(override)) {
    return override === undefined ? base : (override as T);
  }

  const merged: PlainObject = { ...base };

  Object.entries(override).forEach(([key, value]) => {
    merged[key] = mergeDeep((base as PlainObject)[key], value);
  });

  return merged as T;
}

export function getByPath(source: PlainObject, path: string) {
  if (!path) {
    return source;
  }

  return path.split(".").reduce<unknown>((value, key) => {
    if (!isContainer(value)) {
      return undefined;
    }

    return (value as PlainObject)[key];
  }, source);
}

export function setByPath(source: PlainObject, path: string, value: unknown) {
  const keys = path.split(".");
  const next = structuredClone(source);
  let cursor: PlainObject = next;

  keys.slice(0, -1).forEach((key, index) => {
    const current = cursor[key];
    if (!isContainer(current)) {
      cursor[key] = Number.isInteger(Number(keys[index + 1])) ? [] : {};
    }
    cursor = cursor[key] as PlainObject;
  });

  cursor[keys[keys.length - 1]] = value;
  return next;
}

function isPlainObject(value: unknown): value is PlainObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isContainer(value: unknown): value is PlainObject | unknown[] {
  return typeof value === "object" && value !== null;
}
