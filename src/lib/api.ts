const API_BASE_URL =
  import.meta.env.PUBLIC_ZOFTWARE_API_URL ?? "http://localhost:3001/api/v1";

export type ProductSummary = {
  product_name: string;
  weburl: string;
  logo_url?: string | null;
  ratings?: {
    overall_rating?: number;
  };
};

export type CategorySummary = {
  name: string;
  weburl: string;
  children: Array<{
    name: string;
    weburl: string;
  }>;
  products: ProductSummary[];
};

type ApiEnvelope<T> = {
  success: boolean;
  data: T;
};

async function fetchJson<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`Zoftware API failed: ${response.status} ${path}`);
  }

  return response.json() as Promise<T>;
}

export async function getCategoryMenuData(): Promise<CategorySummary[]> {
  const parentResponse = await fetchJson<
    ApiEnvelope<Array<{ name: string; weburl: string }>>
  >("/categories/parent");

  const parents = parentResponse.data.slice(0, 12);
  const categories = await Promise.all(
    parents.map(async (parent) => {
      const [subcategoriesResponse, productsResponse] = await Promise.all([
        fetchJson<
          ApiEnvelope<{
            subCategories: Array<{ name: string; weburl: string }>;
          }>
        >(`/categories/parent/${parent.weburl}/subcategories`),
        fetchJson<
          ApiEnvelope<{
            products: ProductSummary[];
          }>
        >(`/products/parent-category/${parent.weburl}?page=1&limit=3`),
      ]);

      return {
        name: parent.name,
        weburl: parent.weburl,
        children: subcategoriesResponse.data.subCategories ?? [],
        products: productsResponse.data.products ?? [],
      };
    }),
  );

  return categories;
}
