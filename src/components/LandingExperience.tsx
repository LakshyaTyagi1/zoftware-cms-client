import { useEffect, useMemo, useState } from "react";
import AdminFloatingButton from "./AdminFloatingButton";
import Hero from "./Hero";
import LandingSections from "./LandingSections";
import Topbar from "./Topbar";
import {
  ArrowRightIcon,
  CheckCircleIcon,
  FileIcon,
  SearchIcon,
  SparkIcon,
  TargetIcon,
} from "./icons";
import catalog from "../data/catalog/zoftware.json";
import parentCategories from "../data/catalog/parentCategories.json";
import layouts from "../data/site/layouts.json";
import site from "../data/site/zoftware.json";
import { themes } from "../lib/themeEngine";
import { useCmsContent } from "../lib/useCmsContent";

const ONBOARDING_STORAGE_KEY = "zoftware.vendorOnboarding";
const layoutIds = ["strategy", "marketplace", "advisor"] as const;

type LayoutId = (typeof layoutIds)[number];
type ParentCategory = (typeof parentCategories.categories)[number];
type Product = (typeof catalog.products)[number];

const stepIcons = {
  target: TargetIcon,
  spark: SparkIcon,
  file: FileIcon,
} as const;

export default function LandingExperience() {
  const [layoutId, setLayoutId] = useState<LayoutId>("strategy");

  useEffect(() => {
    setLayoutId(resolveLayoutId());
  }, []);

  return (
    <>
      <Topbar site={site} theme={themes[0]} themes={themes} />
      <main>
        {layoutId === "marketplace" ? (
          <MarketplaceHome />
        ) : layoutId === "advisor" ? (
          <AdvisorHome />
        ) : (
          <StrategyHome />
        )}
      </main>
      <AdminFloatingButton />
    </>
  );
}

function StrategyHome() {
  return (
    <>
      <Hero hero={site.hero} />
      <LandingSections sections={site.sections} />
    </>
  );
}

function MarketplaceHome() {
  const content = useCmsContent(layouts.marketplace, "layouts.marketplace");
  const categories = useMemo(() => getPriorityCategories(), []);
  const products = catalog.products;

  return (
    <div className="marketplace-home">
      <section className="marketplace-directory page">
        <header className="marketplace-directory__header">
          <div>
            <p className="layout-eyebrow">{content.hero.eyebrow}</p>
            <h1>{content.hero.headline}</h1>
            <p>{content.hero.description}</p>
          </div>
          <form className="marketplace-search" action="/search/form">
            <SearchIcon />
            <input aria-label={content.hero.searchLabel} placeholder={content.hero.searchPlaceholder} />
            <button type="submit">{content.hero.searchCta}</button>
          </form>
        </header>

        <div className="marketplace-directory__tabs" role="tablist" aria-label="Directory result views">
          {content.directory.tabs.map((tab, index) => (
            <button type="button" className={index === 0 ? "is-active" : ""} key={tab}>
              {tab}
            </button>
          ))}
        </div>

        <div className="marketplace-directory__grid">
          <aside className="marketplace-filter-panel" aria-label="Software categories">
            <div className="layout-section-heading">
              <p>{content.directory.categoryEyebrow}</p>
              <h2>{content.directory.categoryHeading}</h2>
            </div>
            <div className="marketplace-filter-list">
              {categories.map((category, index) => (
                <a className={index === 0 ? "is-active" : ""} href={`/categories/${category.weburl}`} key={category.weburl}>
                  <span>{category.name}</span>
                  <small>{category.subcategory_count} {content.directory.subCategoryLabel}</small>
                </a>
              ))}
            </div>
          </aside>

          <section className="marketplace-results" aria-label="Software results">
            <div className="marketplace-results__summary">
              <div className="layout-section-heading">
                <p>{content.directory.resultsEyebrow}</p>
                <h2>{content.directory.resultsHeading}</h2>
              </div>
              <div className="marketplace-hero__stats" aria-label="Directory stats">
                {content.stats.map((stat) => (
                  <span key={stat.label}>
                    <strong>{resolveStatValue(stat.value, products.length)}</strong>
                    {stat.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="marketplace-product-list">
              {products.map((product) => (
                <article className="marketplace-result-row" key={product.weburl}>
                  <ProductLogo product={product} />
                  <div>
                    <h3>{product.product_name}</h3>
                    <p>{product.overview}</p>
                    <div className="marketplace-product-card__meta">
                      <span>{product.ratings.total_reviews.toLocaleString()} {content.directory.reviewsLabel}</span>
                      <span>{product.ratings.overall_rating.toFixed(1)} {content.directory.ratingLabel}</span>
                    </div>
                  </div>
                  <a href={`/products/${product.weburl}`}>
                    {content.directory.actionLabel}
                    <ArrowRightIcon />
                  </a>
                </article>
              ))}
            </div>
          </section>
        </div>
      </section>

      <section className="marketplace-compare-strip page">
        <div>
          <p>{content.compareStrip.eyebrow}</p>
          <h2>{content.compareStrip.heading}</h2>
          <span>{content.compareStrip.description}</span>
        </div>
        <a href={content.compareStrip.href} className="button button--primary">
          {content.compareStrip.ctaLabel}
        </a>
      </section>
    </div>
  );
}

function AdvisorHome() {
  const brand = useCmsContent(site.brand, "brand");
  const content = useCmsContent(layouts.advisor, "layouts.advisor");
  const categories = useMemo(() => getPriorityCategories().slice(0, 6), []);
  const products = catalog.products;

  return (
    <div className="advisor-home">
      <section className="advisor-desk page">
        <div className="advisor-desk__copy">
          <p className="layout-eyebrow">{content.hero.eyebrow}</p>
          <h1>{content.hero.headline}</h1>
          <p>{content.hero.description}</p>
          <div className="advisor-hero__actions">
            <a href={content.hero.primaryHref} className="button button--primary">
              {content.hero.primaryCta}
            </a>
            <a href={content.hero.secondaryHref} className="button button--secondary">
              {content.hero.secondaryCta}
            </a>
          </div>
        </div>

        <aside className="advisor-profile-card" aria-label={content.profile.label}>
          <img src={content.hero.image} alt={content.hero.imageAlt} />
          <span>{content.profile.label}</span>
          <h2>{content.profile.name}</h2>
          <p>{content.profile.note}</p>
          <div>
            {content.profile.stats.map((stat) => (
              <small key={stat.label}>
                <strong>{stat.value}</strong>
                {stat.label}
              </small>
            ))}
          </div>
        </aside>
      </section>

      <section className="advisor-workbench page">
        <div className="advisor-process-panel">
          <div className="layout-section-heading">
            <p>{content.process.eyebrow}</p>
            <h2>{content.process.heading}</h2>
          </div>
          <div className="advisor-timeline">
            {content.process.steps.map((step, index) => {
              const Icon = stepIcons[step.icon as keyof typeof stepIcons] ?? TargetIcon;
              return (
                <div key={step.title}>
                  <i><Icon /></i>
                  <span>
                    <strong>{index + 1}. {step.title}</strong>
                    <small>{step.description}</small>
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="advisor-intake-panel">
          <div className="layout-section-heading">
            <p>{content.intake.eyebrow}</p>
            <h2>{content.intake.heading}</h2>
          </div>
          <div className="advisor-intake-list">
            {content.intake.fields.map((field) => (
              <span key={field}>
                <CheckCircleIcon />
                {field}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="advisor-section advisor-split page">
        <div>
          <div className="layout-section-heading">
            <p>{content.categories.eyebrow}</p>
            <h2>{content.categories.heading}</h2>
          </div>
          <div className="advisor-category-list">
            {categories.map((category) => (
              <a href={`/categories/${category.weburl}`} key={category.weburl}>
                <CheckCircleIcon />
                <span>{category.name}</span>
              </a>
            ))}
          </div>
        </div>
        <aside className="advisor-shortlist">
          <span>{content.shortlist.eyebrow}</span>
          {products.map((product) => (
            <a href={`/products/${product.weburl}`} key={product.weburl}>
              <ProductLogo product={product} />
              <span>
                <strong>{product.product_name}</strong>
                <small>{product.best_for}</small>
              </span>
              <em>{Math.round(product.ratings.overall_rating * 20)}% {content.shortlist.fitLabel}</em>
            </a>
          ))}
        </aside>
      </section>

      <section className="layout-cta page">
        <div>
          <p>{brand.name} {content.cta.eyebrow}</p>
          <h2>{content.cta.heading}</h2>
          <span>{content.cta.description}</span>
        </div>
        <a href={content.cta.href} className="button button--primary">
          {content.cta.ctaLabel}
        </a>
      </section>
    </div>
  );
}

function ProductLogo({ product }: { product: Product }) {
  if (product.logo_url) {
    return <img src={product.logo_url} alt="" />;
  }

  return <span className="product-logo-fallback">{product.product_name.slice(0, 1)}</span>;
}

function getPriorityCategories(): ParentCategory[] {
  return [...parentCategories.categories]
    .sort((a, b) => {
      if (a.trending !== b.trending) {
        return a.trending ? -1 : 1;
      }

      return b.subcategory_count - a.subcategory_count;
    })
    .slice(0, 12);
}

function resolveStatValue(value: string, productCount: number) {
  if (value === "categoryCount") {
    return parentCategories.categories.length.toString();
  }

  if (value === "productCount") {
    return productCount.toString();
  }

  return value;
}

function resolveLayoutId(): LayoutId {
  const previewLayout = new URLSearchParams(window.location.search).get("previewLayout");

  if (isLayoutId(previewLayout)) {
    return previewLayout;
  }

  try {
    const saved = JSON.parse(window.localStorage.getItem(ONBOARDING_STORAGE_KEY) ?? "null");

    if (isLayoutId(saved?.layoutId)) {
      return saved.layoutId;
    }
  } catch {
    return "strategy";
  }

  return "strategy";
}

function isLayoutId(value: unknown): value is LayoutId {
  return typeof value === "string" && layoutIds.includes(value as LayoutId);
}
