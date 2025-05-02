import axios from "axios";

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
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  url: string;
  retailer_id: string;

  // Optional fields
  brand?: string;
  category?: string;
  availability?: "in stock" | "out of stock";
  condition?: "new" | "refurbished" | "used";
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
      name: product.title,
      description: product.description || product.subtitle || "",
      price: price.amount,
      currency: price.currency_code.toUpperCase(),
      image_url: imageUrl,
      url: `https://your-store.com/products/${product.handle}`,
      retailer_id: product.id,

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

  async addProductToCatalog(product: MedusaProduct): Promise<any> {
    console.log(`🔄 Adding product to Facebook catalog: ${product.title}`, JSON.stringify(product));

    try {
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

export default FacebookModuleService;
