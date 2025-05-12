import axios from "axios";
import _ from "lodash";
import { FacebookProductItem } from "./types";
import { STORE_URL } from "../../lib/constants";

interface FacebookConfig {
  accessToken: string;
  catalogId: string;
  businessId: string;
  apiVersion?: string;
}

interface MedusaProduct {
  id: string;
  title: string;
  handle: string;
  subtitle?: string;
  description?: string;
  is_giftcard: boolean;
  status: string;
  thumbnail?: string;
  weight?: number;
  length?: number;
  height?: number;
  width?: number;
  origin_country?: string;
  hs_code?: string;
  mid_code?: string;
  material?: string;
  discountable: boolean;
  external_id?: string;
  metadata?: Record<string, any>;
  type_id?: string;
  type?: {
    id: string;
    value: string;
  };
  collection_id?: string;
  collection?: {
    id: string;
    title: string;
  };
  variants?: Array<{
    id: string;
    title: string;
    sku?: string;
    barcode?: string;
    ean?: string;
    upc?: string;
    allow_backorder: boolean;
    manage_inventory: boolean;
    hs_code?: string;
    origin_country?: string;
    mid_code?: string;
    material?: string;
    weight?: number;
    length?: number;
    height?: number;
    width?: number;
    metadata?: Record<string, any>;
    variant_rank: number;
    product_id: string;
    price_set?: {
      id: string;
      prices: Array<{
        id: string;
        currency_code: string;
        amount: number;
        raw_amount: {
          value: string;
          precision: number;
        };
      }>;
    };
  }>;
  images?: Array<{
    id: string;
    url: string;
  }>;
}

interface FacebookProduct {
  // Required fields
  id: string;
  title: string;
  name: string;
  description: string;
  availability: "in stock" | "out of stock";
  condition: "new" | "refurbished" | "used";
  price: number;
  currency: string;
  image_url: string;
  brand: string;
  url: string;
  retailer_id: string;
  quantity_to_sell_on_facebook: number;

  // Optional fields
  category?: string;
  additional_image_urls?: string[];
  color?: string;
  size?: string;
  gender?: string;
  material?: string;
  pattern?: string;
  shipping_weight?: {
    value: number;
    unit: string;
  };
  custom_label_0?: string;
  custom_label_1?: string;
  custom_label_2?: string;
  custom_label_3?: string;
  custom_label_4?: string;
  google_product_category?: string;
  gtin?: string;
  mpn?: string;
  product_type?: string;
  sale_price?: number;
  sale_price_effective_date?: string;
  shipping?: {
    price: number;
    currency: string;
    country: string;
  };
  tax?: number;
  weight?: {
    value: number;
    unit: string;
  };
}

class FacebookModuleService {
  protected readonly config: FacebookConfig = {
    accessToken:
      process.env.FACEBOOK_ACCESS_TOKEN ||
      "EAAI9qlfJRjkBO0VFA8iSQiMRq2lMDqBReBwirCF34d1Qs3tHXPEbXob4ZBFU7yv2WiaxLMTNIRxQDuemGMtcKZCbyuPf8bW2FzmupxZCjcpPeXYmxPRlpQD6eqOzQ9lnG6X3Jyl5vmV3Ou2WV5DrhGPEiZCyimMwaf4XYMK1xZAxWJEyG74Sgg7dDgEk4mwe0d9poHodT",
    catalogId: process.env.FACEBOOK_CATALOG_ID || "1639315959947505",
    businessId: process.env.FACEBOOK_BUSINESS_ID || "904603731715180",
    apiVersion: process.env.FACEBOOK_API_VERSION || "v18.0",
  };

  protected readonly baseUrl: string = `https://graph.facebook.com/${this.config.apiVersion}`;

  private mapToFacebookProduct(product: MedusaProduct): FacebookProduct {
    const firstVariant = product.variants?.[0];
    const price = {
      amount: firstVariant?.price_set?.prices?.[0]?.amount || 0,
      currency_code: firstVariant?.price_set?.prices?.[0]?.currency_code || "EGP",
    };

    // Use development image URL only in development environment
    const imageUrl =
      process.env.NODE_ENV === "development"
        ? "https://i.pinimg.com/736x/6b/12/ec/6b12ec0aa1a7e9c2d20617a03de5d38f.jpg"
        : product.thumbnail || product.images?.[0]?.url;

    if (!imageUrl) {
      throw new Error("Product must have at least one image to be synced to Facebook catalog");
    }

    return {
      // Required fields
      id: product.id,
      title: product.title,
      name: product.title,
      description: product.description || product.subtitle || "",
      price: price.amount,
      currency: price.currency_code.toUpperCase(),
      image_url: imageUrl,
      url: `${STORE_URL}/products/${product.handle}`,
      retailer_id: product.id,
      quantity_to_sell_on_facebook: _.sumBy(product.variants, "inventory_quantity"),

      // Optional fields
      brand: product.metadata?.brand || "Your Brand",
      category: product.type?.value || product.collection?.title || "Default Category",
      availability: product.status === "published" ? "in stock" : "out of stock",
      condition: "new",

      // Additional optional fields
      additional_image_urls:
        process.env.NODE_ENV === "development" ? [imageUrl] : product.images?.map((img) => img.url) || [],
      material: product.material || product.metadata?.material || "",
      shipping_weight: {
        value: product.weight || product.metadata?.weight || 0,
        unit: product.metadata?.weight_unit || "kg",
      },
      custom_label_0: product.metadata?.custom_label_0 || "",
      custom_label_1: product.metadata?.custom_label_1 || "",
      custom_label_2: product.metadata?.custom_label_2 || "",
      custom_label_3: product.metadata?.custom_label_3 || "",
      custom_label_4: product.metadata?.custom_label_4 || "",
      google_product_category: product.metadata?.google_product_category || "",
      gtin: product.metadata?.gtin || firstVariant?.ean || "",
      mpn: product.metadata?.mpn || firstVariant?.sku || "",
      product_type: product.type?.value || "",
      shipping: {
        price: product.metadata?.shipping_price || 0,
        currency: price.currency_code,
        country: product.origin_country || "EG",
      },
      tax: product.metadata?.tax || null,
      weight: {
        value: product.weight || product.metadata?.weight || 0,
        unit: product.metadata?.weight_unit || "kg",
      },
    };
  }

  private mapToFacebookProductItems(product: MedusaProduct): FacebookProductItem[] {
    const STORE_URL = process.env.STORE_URL || "https://your-store.com";

    return (product.variants || []).map((variant) => {
      const price = {
        amount: variant.price_set?.prices?.[0]?.amount || 0,
        currency_code: variant.price_set?.prices?.[0]?.currency_code.toUpperCase() || "EGP",
      };

      // Use development image URL only in development environment
      const imageUrl =
        process.env.NODE_ENV === "development"
          ? "https://i.pinimg.com/736x/6b/12/ec/6b12ec0aa1a7e9c2d20617a03de5d38f.jpg"
          : product.thumbnail || product.images?.[0]?.url;

      if (!imageUrl) {
        throw new Error("Product must have at least one image to be synced to Facebook catalog");
      }

      return {
        // Required fields
        name: `${product.title} - ${variant.title}`,
        image_url: imageUrl,
        price: price.amount,
        retailer_id: variant.id,
        retailer_product_group_id: product.id,
        custom_data: {
          variant_id: variant.id,
          sku: variant.sku || "",
        },

        // Optional fields
        description: product.description || product.subtitle || "",
        url: `${STORE_URL}/products/${product.handle}`,
        checkout_url: `${STORE_URL}/products/${product.handle}`,
        availability: product.status === "published" ? "in stock" : "out of stock",
        condition: "new",
        brand: product.metadata?.brand || "Your Brand",
        category: product.type?.value || product.collection?.title || "Default Category",
        currency: price.currency_code.toUpperCase(),

        // Additional optional fields
        additional_image_urls:
          process.env.NODE_ENV === "development" ? [imageUrl] : product.images?.map((img) => img.url) || [],
        material: product.material || product.metadata?.material || "",
        gtin: product.metadata?.gtin || variant.ean || "",
        mpn: product.metadata?.mpn || variant.sku || "",
        product_type: product.type?.value || "",
        size: variant.metadata?.size || "",
        color: variant.metadata?.color || "",
        weight: {
          value: variant.weight || product.weight || product.metadata?.weight || 0,
          unit: product.metadata?.weight_unit || "kg",
        },
        shipping: {
          price: product.metadata?.shipping_price || 0,
          currency: price.currency_code,
          country: variant.origin_country || product.origin_country || "EG",
        },
        tax: product.metadata?.tax || null,
        custom_label_0: product.metadata?.custom_label_0 || "",
        custom_label_1: product.metadata?.custom_label_1 || "",
        custom_label_2: product.metadata?.custom_label_2 || "",
        custom_label_3: product.metadata?.custom_label_3 || "",
        custom_label_4: product.metadata?.custom_label_4 || "",
      };
    });
  }

  async addProductToCatalog(product: MedusaProduct): Promise<any> {
    console.log(`🔄 Adding product to Facebook catalog: ${product.title}`);

    try {
      // If product has no variants, submit the product itself
      if (!product.variants?.length) {
        const facebookProduct = this.mapToFacebookProduct(product);

        console.log(`📦 Product details:
          Name: ${facebookProduct.name}
          Price: ${facebookProduct.currency} ${facebookProduct.price}
          URL: ${facebookProduct.url}
          Image: ${facebookProduct.image_url}
          Brand: ${facebookProduct.brand}
          Category: ${facebookProduct.category}
          Availability: ${facebookProduct.availability}
          Condition: ${facebookProduct.condition}
        `);

        console.log(`📤 Sending request to Facebook:
          URL: ${this.baseUrl}/${this.config.catalogId}/products
          Data: ${JSON.stringify(facebookProduct, null, 2)}
        `);

        const response = await axios.post(`${this.baseUrl}/${this.config.catalogId}/products`, facebookProduct, {
          params: {
            access_token: this.config.accessToken,
          },
        });

        console.log(`✅ Successfully added product to Facebook catalog:
          Response: ${JSON.stringify(response.data, null, 2)}
        `);

        return response.data;
      }

      // If product has variants, submit each variant
      const facebookProductItems = this.mapToFacebookProductItems(product);
      const results = [];

      for (const item of facebookProductItems) {
        console.log(`📦 Variant details:
          Name: ${item.name}
          Price: ${item.currency} ${item.price}
          URL: ${item.url}
          Image: ${item.image_url}
          Brand: ${item.brand}
          Category: ${item.category}
          Availability: ${item.availability}
          Condition: ${item.condition}
        `);

        console.log(`📤 Sending request to Facebook:
          URL: ${this.baseUrl}/${this.config.catalogId}/products
          Data: ${JSON.stringify(item, null, 2)}
        `);

        const response = await axios.post(`${this.baseUrl}/${this.config.catalogId}/products`, item, {
          params: {
            access_token: this.config.accessToken,
          },
        });

        console.log(`✅ Successfully added variant to Facebook catalog:
          Response: ${JSON.stringify(response.data, null, 2)}
        `);

        results.push(response.data);
      }

      return results;
    } catch (error) {
      console.error(`❌ Failed to add product to Facebook catalog:
        Error: ${error.message}
        ${error.response?.data ? `Response: ${JSON.stringify(error.response.data, null, 2)}` : ""}
        ${error.response?.config ? `Request: ${JSON.stringify(error.response.config.data, null, 2)}` : ""}
      `);
      throw new Error(`Failed to add product to Facebook catalog: ${error.message}`);
    }
  }

  async validateAccessToken(): Promise<boolean> {
    console.log("🔄 Validating Facebook access token");

    try {
      console.log(`Checking business ID: ${this.config.businessId}`);

      const response = await axios.get(`${this.baseUrl}/me/businesses`, {
        params: {
          access_token: this.config.accessToken,
        },
      });

      const businessExists = response.data.data.some((business: any) => business.id === this.config.businessId);

      if (businessExists) {
        console.log("✅ Access token is valid and has access to the business");
      } else {
        console.error("❌ Business ID not found in accessible businesses");
      }

      return businessExists;
    } catch (error) {
      console.error(`❌ Failed to validate Facebook access token:
        Error: ${error.message}
        ${error.response?.data ? `Response: ${JSON.stringify(error.response.data, null, 2)}` : ""}
      `);
      throw new Error(`Failed to validate Facebook access token: ${error.message}`);
    }
  }
}

/**
 * Formats price according to Facebook's requirements:
 * - Number followed by space and 3-letter ISO 4217 currency code
 * - Uses period (.) as decimal point
 * - No currency symbols
 * @param amount - The price amount
 * @param currencyCode - The currency code (will be converted to uppercase)
 * @returns Formatted price string (e.g. "10.99 USD")
 */
export function formatPriceForFacebook(amount: number, currencyCode: string): string {
  // Convert to string with 2 decimal places, using period as decimal point
  const formattedAmount = amount.toFixed(2);
  return `${formattedAmount} ${currencyCode.toUpperCase()}`;
}

export default FacebookModuleService;
