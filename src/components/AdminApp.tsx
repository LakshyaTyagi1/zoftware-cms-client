import { useEffect, useMemo, useRef, useState } from "react";
import {
  clearSiteDraft,
  getByPath,
  mergeDeep,
  readSiteDraft,
  setByPath,
  storeSiteDraft,
} from "../lib/contentOverrides";
import {
  applyTheme,
  getStoredThemeId,
  resolveTheme,
  storeThemeId,
  type ThemeConfig,
} from "../lib/themeEngine";

type SiteContent = typeof import("../data/site/zoftware.json");

type AdminAppProps = {
  site: SiteContent;
  themes: readonly ThemeConfig[];
};

type EditorField = {
  label: string;
  path: string;
  help: string;
  multiline?: boolean;
  placeholder?: string;
};

const editorFields: EditorField[] = [
  {
    label: "Brand name",
    path: "brand.name",
    help: "The name visitors see for this version of the site.",
  },
  {
    label: "Logo image path",
    path: "brand.logo",
    help: "Paste the logo image link. Leave blank to use the theme logo.",
    placeholder: "/static/full_logo.svg",
  },
  {
    label: "Logo alt text",
    path: "brand.logoAlt",
    help: "Accessibility label for the logo image.",
  },
  {
    label: "Hero headline",
    path: "hero.headline",
    help: "Primary first-screen headline.",
    multiline: true,
  },
  {
    label: "Primary CTA",
    path: "hero.primaryCta",
    help: "Main hero button label.",
  },
  {
    label: "Secondary CTA",
    path: "hero.secondaryCta",
    help: "Secondary hero button label.",
  },
  {
    label: "Hero visual title",
    path: "hero.featureCards.0.title",
    help: "Title in the right-side hero report card.",
  },
  {
    label: "Hero visual subtitle",
    path: "hero.featureCards.0.subtitle",
    help: "Small line below the hero report title.",
  },
  {
    label: "Smart Suite heading",
    path: "sections.smartSuite.heading",
    help: "Heading for the first post-hero section.",
  },
  {
    label: "Smart Suite description",
    path: "sections.smartSuite.description",
    help: "Supporting copy below the Smart Suite heading.",
    multiline: true,
  },
  {
    label: "Impact section heading",
    path: "sections.decisionImpact.heading",
    help: "Heading above the metric cards.",
    multiline: true,
  },
  {
    label: "Trusted solutions heading",
    path: "sections.trustedSolutions.heading",
    help: "Heading above the industry chips.",
  },
];

export default function AdminApp({ site, themes }: AdminAppProps) {
  const [activePanel, setActivePanel] = useState<"theme" | "editor">("theme");
  const [activeThemeId, setActiveThemeId] = useState(themes[0].id);
  const [draft, setDraft] = useState<Record<string, unknown>>({});
  const previewRef = useRef<HTMLIFrameElement | null>(null);

  const activeTheme = useMemo(
    () => themes.find((theme) => theme.id === activeThemeId) ?? themes[0],
    [activeThemeId, themes],
  );
  const effectiveSite = useMemo(() => mergeDeep(site, draft), [draft, site]);

  useEffect(() => {
    const storedTheme = resolveTheme(getStoredThemeId());
    setActiveThemeId(storedTheme.id);
    setDraft(readSiteDraft());
    applyTheme(storedTheme);
  }, []);

  function updateTheme(theme: ThemeConfig) {
    setActiveThemeId(theme.id);
    storeThemeId(theme.id);
    applyTheme(theme);
    syncPreviewStorage(theme.id, draft);
  }

  function updateField(path: string, value: string) {
    const nextDraft = setByPath(draft, path, value);
    setDraft(nextDraft);
    storeSiteDraft(nextDraft);
    syncPreviewStorage(activeThemeId, nextDraft);
  }

  function resetEditor() {
    setDraft({});
    clearSiteDraft();
    syncPreviewStorage(activeThemeId, {});
  }

  function syncPreviewStorage(themeId: string, siteDraft: Record<string, unknown>) {
    const preview = previewRef.current?.contentWindow;

    if (!preview) {
      return;
    }

    preview.localStorage.setItem("zoftware.activeThemeId", themeId);
    preview.localStorage.setItem("zoftware.siteDraft", JSON.stringify(siteDraft));
    preview.dispatchEvent(new StorageEvent("storage", { key: "zoftware.activeThemeId" }));
    preview.dispatchEvent(new StorageEvent("storage", { key: "zoftware.siteDraft" }));
  }

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar" aria-label="Admin sections">
        <a href="/" className="admin-sidebar__brand">
          <img src={activeTheme.assets.miniLogo} alt="" />
          <span>White-label CMS</span>
        </a>
        <nav>
          <button
            type="button"
            className={activePanel === "theme" ? "is-active" : ""}
            onClick={() => setActivePanel("theme")}
          >
            <small>01</small>
            Theming
          </button>
          <button
            type="button"
            className={activePanel === "editor" ? "is-active" : ""}
            onClick={() => setActivePanel("editor")}
          >
            <small>02</small>
            Editor
          </button>
        </nav>
      </aside>

      <main className="admin-main">
        <section className="admin-panel">
          <div className="admin-panel__header">
            <p>{activePanel === "theme" ? "Step one" : "Step two"}</p>
            <h1>{activePanel === "theme" ? "Choose the client theme." : "Edit static landing content."}</h1>
            <span>
              {activePanel === "theme"
                ? "Pick the look and feel for this client site: colors, typography, logo style, and corner shape."
                : "Update the words and images that appear on the landing page."}
            </span>
          </div>

          {activePanel === "theme" ? (
            <div className="theme-grid">
              {themes.map((theme) => (
                <button
                  type="button"
                  className={`theme-card ${theme.id === activeThemeId ? "is-selected" : ""}`}
                  key={theme.id}
                  onClick={() => updateTheme(theme)}
                >
                  <span className="theme-card__top">
                    <img src={theme.assets.logo} alt="" />
                    <b>{theme.name}</b>
                  </span>
                  <span className="theme-card__swatches">
                    <i style={{ background: theme.colors.background }} />
                    <i style={{ background: theme.colors.brand }} />
                    <i style={{ background: theme.colors.brandDark }} />
                    <i style={{ background: theme.colors.panelSoft }} />
                  </span>
                  <span className="theme-card__meta">
                    {theme.typography.heading.includes("Lora") ? "Lora serif headings" : "Zoftware replica typography"}
                  </span>
                  <span className="theme-card__meta">
                    {theme.layout.radius.mode === "sharp" ? "Sharp corners" : "Rounded corners"}
                  </span>
                </button>
              ))}
            </div>
          ) : (
            <div className="editor-fields">
              {editorFields.map((field) => (
                <label className="editor-field" key={field.path}>
                  <span>
                    <b>{field.label}</b>
                    <small>{field.help}</small>
                  </span>
                  {field.multiline ? (
                    <textarea
                      value={String(getByPath(effectiveSite, field.path) ?? "")}
                      placeholder={field.placeholder}
                      rows={3}
                      onChange={(event) => updateField(field.path, event.target.value)}
                    />
                  ) : (
                    <input
                      value={String(getByPath(effectiveSite, field.path) ?? "")}
                      placeholder={field.placeholder}
                      onChange={(event) => updateField(field.path, event.target.value)}
                    />
                  )}
                </label>
              ))}
              <button type="button" className="admin-reset" onClick={resetEditor}>
                Reset edits
              </button>
            </div>
          )}
        </section>

        <aside className="admin-preview">
          <div className="admin-preview__bar">
            <span>
              <b>{activeTheme.name}</b>
              Live landing preview
            </span>
            <a href="/" target="_blank" rel="noreferrer">
              Open site
            </a>
          </div>
          <iframe
            ref={previewRef}
            src="/"
            title="Landing page preview"
            onLoad={() => syncPreviewStorage(activeThemeId, draft)}
          />
        </aside>
      </main>
    </div>
  );
}
