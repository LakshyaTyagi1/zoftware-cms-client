import editorialTheme from "../data/themes/editorial.json";
import monochromeTheme from "../data/themes/monochrome.json";
import zoftwareTheme from "../data/themes/zoftware.json";

export const THEME_STORAGE_KEY = "zoftware.activeThemeId";
export const THEME_CHANGE_EVENT = "zoftware:theme-change";

export const themes = [zoftwareTheme, editorialTheme, monochromeTheme] as const;

export type ThemeConfig = (typeof themes)[number];

export function resolveTheme(themeId?: string | null): ThemeConfig {
  return themes.find((theme) => theme.id === themeId) ?? themes[0];
}

export function getStoredThemeId() {
  if (typeof window === "undefined") {
    return themes[0].id;
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) ?? themes[0].id;
}

export function storeThemeId(themeId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, themeId);
  window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT, { detail: themeId }));
}

export function themeVariables(theme: ThemeConfig) {
  return {
    "--color-background": theme.colors.background,
    "--color-text": theme.colors.text,
    "--color-muted-text": theme.colors.mutedText,
    "--color-soft-text": theme.colors.softText,
    "--color-brand": theme.colors.brand,
    "--color-brand-dark": theme.colors.brandDark,
    "--color-brand-soft": theme.colors.brandSoft,
    "--color-border": theme.colors.border,
    "--color-panel": theme.colors.panel,
    "--color-panel-soft": theme.colors.panelSoft,
    "--color-hero-start": theme.colors.heroStart,
    "--color-accent": theme.colors.accent,
    "--color-success": theme.colors.success,
    "--font-body": theme.typography.body,
    "--font-heading": theme.typography.heading,
    "--layout-max-width": theme.layout.maxWidth,
    "--radius-pill": theme.layout.radius.pill,
    "--radius-panel": theme.layout.radius.panel,
    "--radius-card": theme.layout.radius.card,
  } as const;
}

export function themeStyle(theme: ThemeConfig) {
  return Object.entries(themeVariables(theme))
    .map(([key, value]) => `${key}: ${value}`)
    .join("; ");
}

export function applyTheme(theme: ThemeConfig) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  const variables = themeVariables(theme);

  Object.entries(variables).forEach(([key, value]) => {
    root.style.setProperty(key, value);
  });

  root.dataset.theme = theme.id;
  root.dataset.radiusMode = theme.layout.radius.mode;

  if (document.body) {
    document.body.dataset.theme = theme.id;
    document.body.dataset.radiusMode = theme.layout.radius.mode;
  }
}
