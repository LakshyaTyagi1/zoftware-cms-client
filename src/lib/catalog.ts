import catalog from "../data/catalog/zoftware.json";

export type Catalog = typeof catalog;
export type CatalogCategory = Catalog["categories"][number];
export type CatalogSubcategory = Catalog["subcategories"][number];
export type CatalogProduct = Catalog["products"][number];

export function getCatalog() {
  return catalog;
}

export function getParentCategory(slug: string) {
  return catalog.categories.find((category) => category.weburl === slug);
}

export function getSubcategory(slug: string) {
  return catalog.subcategories.find((category) => category.weburl === slug);
}

export function getProduct(slug: string) {
  return catalog.products.find((product) => product.weburl === slug);
}

export function getProducts(slugs: string[]) {
  return slugs
    .map((slug) => getProduct(slug))
    .filter((product): product is CatalogProduct => Boolean(product));
}

export function formatNumber(value?: number) {
  return new Intl.NumberFormat("en-US").format(value ?? 0);
}

export function getProductInitials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("");
}

export function getLocalProductLogo(product: CatalogProduct) {
  const logo = product.logo_url;
  return typeof logo === "string" && logo.startsWith("/") ? logo : "";
}

export function getRating(product: CatalogProduct) {
  return product.ratings?.overall_rating ?? 0;
}

export function getReviewCount(product: CatalogProduct) {
  return product.ratings?.total_reviews ?? 0;
}

export function getAllProductSlugs() {
  return catalog.products.map((product) => product.weburl);
}
