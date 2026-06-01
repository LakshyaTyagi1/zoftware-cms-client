import { useEffect, useMemo, useState, type CSSProperties } from "react";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  CompareIcon,
  FileIcon,
  SearchIcon,
  SparkIcon,
  TargetIcon,
} from "./icons";
import parentCategories from "../data/catalog/parentCategories.json";
import site from "../data/site/zoftware.json";
import {
  applyTheme,
  resolveTheme,
  storeThemeId,
  themes,
  type ThemeConfig,
} from "../lib/themeEngine";
import { storeSiteDraft } from "../lib/contentOverrides";

const ONBOARDING_STORAGE_KEY = "zoftware.vendorOnboarding";

type ServiceId = "smart-search" | "rfp-service" | "ai-chatbot" | "rag-knowledge-base";
type LayoutId = "strategy" | "marketplace" | "advisor";

type OnboardingState = {
  vendorName: string;
  website: string;
  logoUrl: string;
  logoFileName: string;
  market: string;
  audience: string;
  services: ServiceId[];
  categorySlugs: string[];
  brandName: string;
  subdomain: string;
  launchWindow: string;
  themeId: string;
  layoutId: LayoutId;
};

const initialState: OnboardingState = {
  vendorName: "",
  website: "",
  logoUrl: "",
  logoFileName: "",
  market: "MENA",
  audience: "Mid-market buyers",
  services: ["smart-search", "rfp-service"],
  categorySlugs: parentCategories.categories.slice(0, 2).map((category) => category.weburl),
  brandName: "",
  subdomain: "",
  launchWindow: "30 days",
  themeId: themes[0].id,
  layoutId: "strategy",
};

const serviceOptions = [
  {
    id: "smart-search",
    title: "Smart Search",
    description: "Guided software discovery with ranked vendor matches.",
    badge: "Discovery",
    icon: SearchIcon,
  },
  {
    id: "rfp-service",
    title: "RFP Service",
    description: "Buyer requirement capture and RFP generation workflow.",
    badge: "Planning",
    icon: FileIcon,
  },
  {
    id: "ai-chatbot",
    title: "AI Chatbot",
    description: "Conversational assistant for buyers and internal teams.",
    badge: "Assist",
    icon: SparkIcon,
  },
  {
    id: "rag-knowledge-base",
    title: "RAG Knowledge Base",
    description: "Answer engine grounded in uploaded vendor and category knowledge.",
    badge: "Knowledge",
    icon: TargetIcon,
  },
] as const;

const layoutOptions = [
  {
    id: "strategy",
    title: "Strategy-led",
    description: "Start with buyer goals, roadmap, and implementation fit.",
  },
  {
    id: "marketplace",
    title: "Marketplace",
    description: "Prioritize category browsing, product lists, and comparison.",
  },
  {
    id: "advisor",
    title: "Advisor desk",
    description: "Lead buyers toward expert calls and assisted shortlists.",
  },
] as const;

const recommendedThemeByLayout: Record<LayoutId, string> = {
  strategy: "zoftware",
  marketplace: "monochrome",
  advisor: "editorial",
};

const steps = [
  "Workspace",
  "Categories",
  "Services",
  "Brand",
  "Theme",
] as const;

export default function OnboardingGate() {
  const [ready, setReady] = useState(false);
  const [restartPromptOpen, setRestartPromptOpen] = useState(false);
  const [state, setState] = useState<OnboardingState>(initialState);

  useEffect(() => {
    try {
      const saved = JSON.parse(window.localStorage.getItem(ONBOARDING_STORAGE_KEY) ?? "null");
      if (saved?.completed) {
        setState((current) => ({
          ...current,
          ...saved,
          themeId: saved.themeId || current.themeId,
        }));
        setRestartPromptOpen(true);
      }
    } catch {
      setState(initialState);
    }

    applyTheme(themes[0]);
    setReady(true);
  }, []);

  if (!ready) {
    return <div className="onboarding-loading" aria-label="Loading setup" />;
  }

  return (
    <>
      <OnboardingFlow
        state={state}
        onChange={setState}
        onComplete={(finalState) => {
          const activeTheme = resolveTheme(finalState.themeId);
          const brandName = finalState.brandName || finalState.vendorName || site.brand.name;

          storeThemeId(activeTheme.id);
          applyTheme(activeTheme);
          storeSiteDraft({
            brand: {
              name: brandName,
              ...(finalState.logoUrl ? { logo: finalState.logoUrl } : {}),
              logoAlt: `${brandName} logo`,
            },
            hero: {
              headline: `Launch ${brandName} as a software buying hub. Ready for your customers.`,
            },
          });
          window.localStorage.setItem(
            ONBOARDING_STORAGE_KEY,
            JSON.stringify({ completed: true, completedAt: new Date().toISOString(), ...finalState }),
          );
          window.location.assign("/home");
        }}
      />
      {restartPromptOpen ? (
        <div className="onboarding-alert" role="alertdialog" aria-modal="true" aria-labelledby="onboarding-alert-title">
          <section className="onboarding-alert__panel">
            <h2 id="onboarding-alert-title">Onboarding already completed</h2>
            <p>You can restart setup from scratch or go back to the configured landing page.</p>
            <div>
              <button
                type="button"
                className="onboarding-button onboarding-button--secondary"
                onClick={() => {
                  window.localStorage.removeItem(ONBOARDING_STORAGE_KEY);
                  setState(initialState);
                  setRestartPromptOpen(false);
                  applyTheme(themes[0]);
                }}
              >
                Restart onboarding
              </button>
              <button
                type="button"
                className="onboarding-button onboarding-button--primary"
                onClick={() => window.location.assign("/home")}
              >
                Go back to home
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  );
}

function OnboardingFlow({
  state,
  onChange,
  onComplete,
}: {
  state: OnboardingState;
  onChange: (state: OnboardingState) => void;
  onComplete: (state: OnboardingState) => void;
}) {
  const [stepIndex, setStepIndex] = useState(0);
  const [fullPreviewOpen, setFullPreviewOpen] = useState(false);
  const activeTheme = useMemo(() => resolveTheme(state.themeId), [state.themeId]);
  const defaultTheme = themes[0];
  const canContinue =
    stepIndex === 1
      ? state.categorySlugs.length > 0
      : stepIndex === 2
        ? state.services.length > 0
        : true;

  function update(patch: Partial<OnboardingState>) {
    onChange({ ...state, ...patch });
  }

  function goNext() {
    if (stepIndex === steps.length - 1) {
      onComplete(state);
      return;
    }

    setStepIndex((current) => Math.min(current + 1, steps.length - 1));
  }

  return (
    <main className="onboarding-shell">
      <section className="onboarding-panel" aria-label="Vendor onboarding">
        <aside className="onboarding-sidebar">
          <a href="/" className="onboarding-brand" aria-label="Zoftware onboarding">
            <img src={defaultTheme.assets.miniLogo} alt="" />
            <span>White-label setup</span>
          </a>

          <div className="onboarding-progress">
            {steps.map((label, index) => (
              <button
                type="button"
                key={label}
                className={index === stepIndex ? "is-active" : index < stepIndex ? "is-complete" : ""}
                onClick={() => setStepIndex(index)}
              >
                <span>{index < stepIndex ? <CheckCircleIcon /> : index + 1}</span>
                {label}
              </button>
            ))}
          </div>

          <div className="onboarding-summary">
            <small>Current build</small>
            <strong>{state.brandName || state.vendorName || "New vendor hub"}</strong>
            <p>
              {state.services.length} services, {state.categorySlugs.length} parent categories
            </p>
          </div>
        </aside>

        <section className="onboarding-main">
          <div className="onboarding-step-header" key={`header-${stepIndex}`}>
            <p>Step {stepIndex + 1} of {steps.length}</p>
            <h1>{getStepTitle(stepIndex)}</h1>
          </div>

          <div className="onboarding-step-body" key={stepIndex}>
            {stepIndex === 0 && <WorkspaceStep state={state} update={update} />}
            {stepIndex === 1 && <CategoriesStep state={state} update={update} />}
            {stepIndex === 2 && <ServicesStep state={state} update={update} />}
            {stepIndex === 3 && <BrandStep state={state} update={update} />}
            {stepIndex === 4 && (
              <ThemeStep
                state={state}
                update={update}
                activeTheme={activeTheme}
                onOpenFullPreview={() => setFullPreviewOpen(true)}
              />
            )}
          </div>

          <footer className="onboarding-actions">
            <button
              type="button"
              className="onboarding-button onboarding-button--secondary"
              disabled={stepIndex === 0}
              onClick={() => setStepIndex((current) => Math.max(current - 1, 0))}
            >
              Back
            </button>
            <button
              type="button"
              className="onboarding-button onboarding-button--primary"
              disabled={!canContinue}
              onClick={goNext}
            >
              {stepIndex === steps.length - 1 ? "Finish setup" : "Continue"}
              <ArrowRightIcon />
            </button>
          </footer>
        </section>
      </section>

      {fullPreviewOpen ? (
        <div className="full-preview-modal" role="dialog" aria-modal="true" aria-label="Full landing page preview">
          <div className="full-preview-modal__panel">
            <div className="full-preview-modal__bar">
              <span>
                <b>{activeTheme.name}</b>
                Full landing preview
              </span>
              <button type="button" onClick={() => setFullPreviewOpen(false)}>
                Close
              </button>
            </div>
            <iframe
              src={`/home?previewTheme=${encodeURIComponent(state.themeId)}&previewLayout=${encodeURIComponent(state.layoutId)}`}
              title={`${activeTheme.name} ${state.layoutId} full landing preview`}
            />
          </div>
        </div>
      ) : null}
    </main>
  );
}

function WorkspaceStep({
  state,
  update,
}: {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div className="onboarding-grid onboarding-grid--two">
      <label className="onboarding-field">
        <span>Vendor name</span>
        <input
          value={state.vendorName}
          placeholder="Acme Advisory"
          onChange={(event) => update({ vendorName: event.target.value })}
        />
      </label>
      <label className="onboarding-field">
        <span>Website</span>
        <input
          value={state.website}
          placeholder="https://example.com"
          onChange={(event) => update({ website: event.target.value })}
        />
      </label>
      <div className="onboarding-field onboarding-field--wide">
        <span>Logo</span>
        <div className="logo-input-combo">
          <input
            value={state.logoUrl.startsWith("data:") ? "" : state.logoUrl}
            placeholder="https://example.com/logo.svg"
            onChange={(event) => update({ logoUrl: event.target.value, logoFileName: "" })}
          />
          <label className="logo-upload-action">
            {state.logoFileName || "or upload your logo"}
            <input
              type="file"
              accept="image/*"
              onChange={(event) => {
                const file = event.target.files?.[0];

                if (!file) {
                  return;
                }

                const reader = new FileReader();
                reader.onload = () => {
                  update({
                    logoUrl: typeof reader.result === "string" ? reader.result : "",
                    logoFileName: file.name,
                  });
                };
                reader.readAsDataURL(file);
              }}
            />
          </label>
        </div>
      </div>
      <label className="onboarding-field">
        <span>Primary market</span>
        <select value={state.market} onChange={(event) => update({ market: event.target.value })}>
          <option>MENA</option>
          <option>North America</option>
          <option>Europe</option>
          <option>India</option>
          <option>Global</option>
        </select>
      </label>
      <label className="onboarding-field">
        <span>Buyer audience</span>
        <select value={state.audience} onChange={(event) => update({ audience: event.target.value })}>
          <option>Mid-market buyers</option>
          <option>Enterprise procurement teams</option>
          <option>SMB founders</option>
          <option>Technology consultants</option>
        </select>
      </label>
    </div>
  );
}

function ServicesStep({
  state,
  update,
}: {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div className="option-grid">
      {serviceOptions.map((service) => {
        const Icon = service.icon;
        const selected = state.services.includes(service.id);
        return (
          <button
            type="button"
            key={service.id}
            className={`selection-card ${selected ? "is-selected" : ""}`}
            onClick={() =>
              update({
                services: selected
                  ? state.services.filter((id) => id !== service.id)
                  : [...state.services, service.id],
              })
            }
          >
            <span className="selection-card__icon">
              <Icon />
            </span>
            <span>
              <em>{service.badge}</em>
              <strong>{service.title}</strong>
              <small>{service.description}</small>
            </span>
            <i>{selected ? <CheckCircleIcon /> : null}</i>
          </button>
        );
      })}
    </div>
  );
}

function CategoriesStep({
  state,
  update,
}: {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div className="category-select-grid">
      {parentCategories.categories.map((category) => {
        const selected = state.categorySlugs.includes(category.weburl);
        return (
          <button
            type="button"
            key={category.weburl}
            className={`category-select-card ${selected ? "is-selected" : ""}`}
            onClick={() =>
              update({
                categorySlugs: selected
                  ? state.categorySlugs.filter((slug) => slug !== category.weburl)
                  : [...state.categorySlugs, category.weburl],
              })
            }
          >
            <span>
              <strong>{category.name}</strong>
              <small>{category.subcategory_count} subcategories</small>
            </span>
            {selected ? <i><CheckCircleIcon /></i> : null}
          </button>
        );
      })}
    </div>
  );
}

function BrandStep({
  state,
  update,
}: {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
}) {
  return (
    <div className="onboarding-grid onboarding-grid--two">
      <label className="onboarding-field">
        <span>White-label name</span>
        <input
          value={state.brandName}
          placeholder={state.vendorName || "Acme Software Hub"}
          onChange={(event) => update({ brandName: event.target.value })}
        />
      </label>
      <label className="onboarding-field">
        <span>Preferred subdomain</span>
        <input
          value={state.subdomain}
          placeholder="software.acme.com"
          onChange={(event) => update({ subdomain: event.target.value })}
        />
      </label>
      <label className="onboarding-field onboarding-field--wide">
        <span>Launch window</span>
        <select
          value={state.launchWindow}
          onChange={(event) => update({ launchWindow: event.target.value })}
        >
          <option>30 days</option>
          <option>60 days</option>
          <option>90 days</option>
          <option>Still evaluating</option>
        </select>
      </label>
      <div className="onboarding-note">
        <CompareIcon />
        <span>
          This draft stays in the browser for now. Finishing setup applies the name and selected theme to the local landing page.
        </span>
      </div>
    </div>
  );
}

function ThemeStep({
  state,
  update,
  activeTheme,
  onOpenFullPreview,
}: {
  state: OnboardingState;
  update: (patch: Partial<OnboardingState>) => void;
  activeTheme: ThemeConfig;
  onOpenFullPreview: () => void;
}) {
  const recommendedThemeId = recommendedThemeByLayout[state.layoutId] ?? themes[0].id;
  const recommendedTheme = resolveTheme(recommendedThemeId);

  return (
    <div className="theme-layout-grid">
      <section>
        <div className="theme-section-title">
          <h2>Theme</h2>
          <span>Suggested for {layoutOptions.find((layout) => layout.id === state.layoutId)?.title}: {recommendedTheme.name}</span>
        </div>
        <div className="theme-choice-list">
          {themes.map((theme) => (
            <button
              type="button"
              key={theme.id}
              className={`theme-card ${state.themeId === theme.id ? "is-selected" : ""}`}
              onClick={() => update({ themeId: theme.id })}
            >
              <span className="theme-card__top">
                <img src={theme.assets.logo} alt="" />
                <span>
                  <b>{theme.name}</b>
                  {theme.id === recommendedThemeId ? <em>Recommended</em> : null}
                </span>
              </span>
              <span className="theme-card__swatches">
                <i style={{ background: theme.colors.background }} />
                <i style={{ background: theme.colors.brand }} />
                <i style={{ background: theme.colors.brandDark }} />
                <i style={{ background: theme.colors.panelSoft }} />
              </span>
            </button>
          ))}
        </div>
      </section>

      <section>
        <h2>Layout direction</h2>
        <div className="layout-choice-list">
          {layoutOptions.map((layout) => (
            <button
              type="button"
              key={layout.id}
              className={`layout-choice ${state.layoutId === layout.id ? "is-selected" : ""}`}
              onClick={() => update({ layoutId: layout.id })}
            >
              <strong>{layout.title}</strong>
              <small>{layout.description}</small>
              <em>{resolveTheme(recommendedThemeByLayout[layout.id]).name} suggested</em>
            </button>
          ))}
        </div>
      </section>

      <section className="theme-hero-preview" style={themePreviewStyle(activeTheme)}>
        <div className="theme-hero-preview__top">
          <span>Preview</span>
          <button type="button" onClick={onOpenFullPreview}>
            Show full preview
          </button>
        </div>
        <div className="theme-hero-preview__hero">
          <div>
            <img src={activeTheme.assets.logo} alt="" />
            <h2>{state.brandName || state.vendorName || "New vendor hub"}</h2>
            <p>Choose the right software with a clear strategy. Ready to implement.</p>
            <div className="theme-hero-preview__actions">
              <span>Get strategy</span>
              <span>Talk to an expert</span>
            </div>
          </div>
          <aside>
            <small>Top match</small>
            <strong>92%</strong>
            <p>Best-fit shortlist ready</p>
          </aside>
        </div>
      </section>
    </div>
  );
}

function themePreviewStyle(theme: ThemeConfig) {
  return {
    "--preview-background": theme.colors.background,
    "--preview-text": theme.colors.text,
    "--preview-muted": theme.colors.mutedText,
    "--preview-soft": theme.colors.panelSoft,
    "--preview-panel": theme.colors.panel,
    "--preview-brand": theme.colors.brand,
    "--preview-brand-soft": theme.colors.brandSoft,
    "--preview-border": theme.colors.border,
    "--preview-heading": theme.typography.heading,
    "--preview-body": theme.typography.body,
    "--preview-radius": theme.layout.radius.card,
  } as CSSProperties;
}

function getStepTitle(stepIndex: number) {
  if (stepIndex === 0) {
    return "Create the vendor workspace.";
  }

  if (stepIndex === 1) {
    return "Choose parent software categories for the directory.";
  }

  if (stepIndex === 2) {
    return "Select the services this white-label solution should include.";
  }

  if (stepIndex === 3) {
    return "Set the launch identity.";
  }

  return "Choose the layout and theme.";
}
