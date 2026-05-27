import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowRightIcon,
  ChevronDownIcon,
  CloseIcon,
  CompareIcon,
  FileIcon,
  MenuIcon,
  SearchIcon,
  SparkIcon,
  TargetIcon,
} from "./icons";
import { getStoredThemeId, resolveTheme, THEME_CHANGE_EVENT, type ThemeConfig } from "../lib/themeEngine";
import { useCmsContent } from "../lib/useCmsContent";

type TopbarProps = {
  site: typeof import("../data/site/zoftware.json");
  theme: ThemeConfig;
  themes?: readonly ThemeConfig[];
};

type CategorySummary =
  TopbarProps["site"]["topbar"]["categoriesDropdown"]["fallbackCategories"][number];

const smartSuiteIcons = {
  "strategy-builder": SparkIcon,
  "system-fit-score": TargetIcon,
  "rfp-builder": FileIcon,
  "smart-compare": CompareIcon,
} as const;

export default function Topbar({ site, theme, themes = [theme] }: TopbarProps) {
  const content = useCmsContent(site);
  const [activeTheme, setActiveTheme] = useState(theme);
  const [scrolled, setScrolled] = useState(false);
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [partnersOpen, setPartnersOpen] = useState(false);
  const [smartSuiteOpen, setSmartSuiteOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [categories, setCategories] = useState<CategorySummary[]>(
    content.topbar.categoriesDropdown.fallbackCategories,
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const topbarRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setCategories(content.topbar.categoriesDropdown.fallbackCategories);
    setActiveIndex(0);
  }, [content.topbar.categoriesDropdown.fallbackCategories]);

  useEffect(() => {
    const syncTheme = () => {
      const storedTheme = themes.find((item) => item.id === getStoredThemeId());
      setActiveTheme(storedTheme ?? resolveTheme(getStoredThemeId()));
    };

    syncTheme();
    window.addEventListener("storage", syncTheme);
    window.addEventListener(THEME_CHANGE_EVENT, syncTheme);

    return () => {
      window.removeEventListener("storage", syncTheme);
      window.removeEventListener(THEME_CHANGE_EVENT, syncTheme);
    };
  }, [themes]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!topbarRef.current?.contains(event.target as Node)) {
        setCategoryOpen(false);
        setPartnersOpen(false);
        setSmartSuiteOpen(false);
      }
    };

    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  const activeCategory = categories[activeIndex] ?? categories[0];
  const topbar = content.topbar;
  const brandLogo = "logo" in content.brand && typeof content.brand.logo === "string"
    ? content.brand.logo
    : activeTheme.assets.logo;

  const mobileLinks = useMemo(
    () => [
      { label: topbar.items.softwareCategories, href: topbar.links.categories },
      { label: topbar.items.compare, href: topbar.links.compare },
      { label: topbar.items.blogs, href: topbar.links.blogs },
      { label: topbar.items.expert, href: topbar.links.expert },
      { label: topbar.items.login, href: topbar.links.login },
    ],
    [topbar],
  );

  return (
    <header
      ref={topbarRef}
      className={`topbar-shell ${scrolled ? "topbar-shell--scrolled" : ""}`}
    >
      <div className="topbar">
        <a href={topbar.links.home} className="topbar__logo-link" aria-label={content.brand.name}>
          <img src={brandLogo} alt={content.brand.logoAlt} className="topbar__logo" />
        </a>

        <button
          id="software-categories-trigger"
          type="button"
          className={`topbar__nav-button ${categoryOpen ? "is-active" : ""}`}
          onClick={() => {
            setCategoryOpen((open) => !open);
            setPartnersOpen(false);
            setSmartSuiteOpen(false);
          }}
          aria-expanded={categoryOpen}
        >
          {topbar.items.softwareCategories}
          <ChevronDownIcon className={categoryOpen ? "icon-rotated" : ""} />
        </button>

        <a className="topbar__nav-link" href={topbar.links.compare}>
          {topbar.items.compare}
        </a>

        <a className="topbar__nav-link topbar__blogs" href={topbar.links.blogs}>
          {topbar.items.blogs}
        </a>

        <div className="topbar__menu-wrap">
          <button
            type="button"
            className="topbar__nav-button"
            onClick={() => {
              setPartnersOpen((open) => !open);
              setCategoryOpen(false);
              setSmartSuiteOpen(false);
            }}
            aria-expanded={partnersOpen}
          >
            {topbar.items.partners}
            <ChevronDownIcon className={partnersOpen ? "icon-rotated" : ""} />
          </button>

          <div className={`partners-menu ${partnersOpen ? "is-open" : ""}`}>
            {topbar.partners.map((item) => (
              <a key={item.href} href={item.href}>
                {item.label}
              </a>
            ))}
          </div>
        </div>

        <div className="topbar__menu-wrap">
          <button
            type="button"
            className="smart-suite-trigger"
            onClick={() => {
              setSmartSuiteOpen((open) => !open);
              setCategoryOpen(false);
              setPartnersOpen(false);
            }}
            aria-expanded={smartSuiteOpen}
          >
            <span>
              <i />
              {topbar.smartSuite.label}
            </span>
            <ChevronDownIcon className={smartSuiteOpen ? "icon-rotated" : ""} />
          </button>

          <div className={`smart-suite-menu ${smartSuiteOpen ? "is-open" : ""}`}>
            <div className="smart-suite-menu__header">
              <p>{topbar.smartSuite.header}</p>
              <a href={topbar.smartSuite.viewAllHref}>
                {topbar.smartSuite.viewAllTools}
                <ArrowRightIcon />
              </a>
            </div>
            <div className="smart-suite-menu__grid">
              {topbar.smartSuite.items.map((item) => {
                const Icon = smartSuiteIcons[item.id as keyof typeof smartSuiteIcons] ?? SparkIcon;
                return (
                  <a key={item.id} href={item.href} className="smart-suite-card">
                    <span className="smart-suite-card__icon">
                      <Icon />
                    </span>
                    <span>
                      <strong>{item.title}</strong>
                      <small>{item.description}</small>
                      <em>{item.badge}</em>
                    </span>
                    <ArrowRightIcon className="smart-suite-card__arrow" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <span className="topbar__divider" />

        <a href={topbar.links.expert} className="topbar__nav-link">
          {topbar.items.expert}
        </a>

        <a href={topbar.links.search} className="topbar__search">
          <SearchIcon />
          <span>
            {topbar.items.smartSearchPrefix} {topbar.items.smartSearchSuffix}
          </span>
        </a>

        <button type="button" className="language-toggle" aria-label="Switch language">
          EN
          <ChevronDownIcon />
        </button>

        <a href={topbar.links.login} className="signin-button">
          {topbar.items.login}
        </a>
      </div>

      <div className="mobile-topbar">
        <a href={topbar.links.home} aria-label={content.brand.name}>
          <img src={brandLogo} alt={content.brand.logoAlt} />
        </a>
        <div className="mobile-topbar__actions">
          <a href={topbar.links.search} aria-label="Open smart search">
            <SearchIcon />
          </a>
          <button type="button" className="mobile-language" aria-label="Switch language">
            EN
            <ChevronDownIcon />
          </button>
          <button
            type="button"
            aria-label="Open menu"
            onClick={() => setMobileOpen(true)}
          >
            <MenuIcon />
          </button>
        </div>
      </div>

      {categoryOpen && (
        <CategoryDropdown
          activeCategory={activeCategory}
          categories={categories}
          onHoverCategory={(index) => setActiveIndex(index)}
          onClose={() => setCategoryOpen(false)}
          copy={topbar.categoriesDropdown}
          ratingStar={activeTheme.assets.ratingStar}
        />
      )}

      <div className={`mobile-drawer ${mobileOpen ? "is-open" : ""}`}>
        <button
          type="button"
          className="mobile-drawer__close"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        >
          <CloseIcon />
        </button>
        <img src={brandLogo} alt={content.brand.logoAlt} />
        <nav>
          {mobileLinks.map((link) => (
            <a key={link.href} href={link.href} onClick={() => setMobileOpen(false)}>
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}

type CategoryDropdownProps = {
  categories: CategorySummary[];
  activeCategory: CategorySummary;
  copy: TopbarProps["site"]["topbar"]["categoriesDropdown"];
  ratingStar: string;
  onHoverCategory: (index: number) => void;
  onClose: () => void;
};

function CategoryDropdown({
  categories,
  activeCategory,
  copy,
  ratingStar,
  onHoverCategory,
  onClose,
}: CategoryDropdownProps) {
  return (
    <div className="category-menu" id="category-dropdown">
      <div className="category-menu__main">
        <ul>
          {categories.map((category, index) => (
            <li key={category.weburl}>
              <a
                href={`/category/p/${category.weburl}`}
                className={activeCategory?.weburl === category.weburl ? "is-active" : ""}
                onMouseEnter={() => onHoverCategory(index)}
                onFocus={() => onHoverCategory(index)}
                onClick={onClose}
              >
                {category.name}
                {activeCategory?.weburl === category.weburl && <ChevronDownIcon />}
              </a>
            </li>
          ))}
        </ul>
        <a href="/categories" className="category-menu__all" onClick={onClose}>
          {copy.viewAllCategories}
        </a>
      </div>

      <div className="category-menu__side">
        <div className="category-menu__side-header">
          <a href={`/category/p/${activeCategory?.weburl ?? ""}`} onClick={onClose}>
            {activeCategory?.name}
          </a>
          <button type="button">{copy.filterByIndustry}</button>
        </div>
        <ul className="category-menu__subcats">
          {(activeCategory?.children ?? []).slice(0, 10).map((subcategory) => (
            <li key={subcategory.weburl}>
              <a href={`/category/${subcategory.weburl}`} onClick={onClose}>
                {subcategory.name}
              </a>
            </li>
          ))}
        </ul>
        {(activeCategory?.children?.length ?? 0) > 10 && (
          <a
            href={`/category/p/${activeCategory.weburl}`}
            className="category-menu__sub-all"
            onClick={onClose}
          >
            {copy.viewAllCategories}
          </a>
        )}
      </div>

      <div className="category-menu__products">
        {(activeCategory?.products ?? []).slice(0, 3).map((product) => (
          <a
            key={product.weburl}
            href={`/products/${product.weburl}/overview`}
            className="category-product"
            onClick={onClose}
          >
            <span className="category-product__logo">
              {product.logo_url ? (
                <ProductLogo src={product.logo_url} name={product.product_name} />
              ) : (
                product.product_name.slice(0, 1)
              )}
            </span>
            <strong>{product.product_name}</strong>
            {product.ratings?.overall_rating ? (
              <span className="category-product__rating">
                <img src={ratingStar} alt="" />
                <b>{product.ratings.overall_rating.toFixed(1)}</b>
                <small>out of 5</small>
              </span>
            ) : null}
          </a>
        ))}
      </div>
    </div>
  );
}

function ProductLogo({ src, name }: { src: string; name: string }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return <>{name.slice(0, 1)}</>;
  }

  return (
    <img
      src={src}
      alt={`${name} logo`}
      onError={() => setFailed(true)}
    />
  );
}
