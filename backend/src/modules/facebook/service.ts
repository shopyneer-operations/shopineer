import { IModuleService, Logger } from "@medusajs/framework/types";
import { MedusaService } from "@medusajs/framework/utils";
import { EntityManager } from "@mikro-orm/core";
import axios from "axios";

interface FacebookConfig {
  accessToken: string;
  catalogId: string;
  businessId: string;
  pixelId?: string;
  apiVersion?: string;
}

interface FacebookProduct {
  name: string;
  description: string;
  price: number;
  currency: string;
  image_url: string;
  url: string;
  brand?: string;
  category?: string;
  availability?: "in stock" | "out of stock";
  condition?: "new" | "refurbished" | "used";
}

type InjectedDependencies = {
  logger: Logger;
  manager: EntityManager;
};

class FacebookModuleService extends MedusaService({}) {
  protected readonly config: FacebookConfig = {
    accessToken: process.env.FACEBOOK_ACCESS_TOKEN || "",
    catalogId: process.env.FACEBOOK_CATALOG_ID || "",
    businessId: process.env.FACEBOOK_BUSINESS_ID || "",
    pixelId: process.env.FACEBOOK_PIXEL_ID,
    apiVersion: process.env.FACEBOOK_API_VERSION || "v18.0",
  };

  protected readonly baseUrl: string = `https://graph.facebook.com/${this.config.apiVersion}`;

  async addProductToCatalog(product: FacebookProduct): Promise<any> {
    try {
      const response = await axios.post(
        `${this.baseUrl}/${this.config.catalogId}/products`,
        {
          name: product.name,
          description: product.description,
          price: `${product.currency} ${product.price}`,
          image_url: product.image_url,
          url: product.url,
          brand: product.brand,
          category: product.category,
          availability: product.availability,
          condition: product.condition,
        },
        {
          params: {
            access_token: this.config.accessToken,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(`Failed to add product to Facebook catalog: ${error.message}`);
    }
  }

  async validateAccessToken(): Promise<boolean> {
    try {
      const response = await axios.get(`${this.baseUrl}/me/businesses`, {
        params: {
          access_token: this.config.accessToken,
        },
      });

      // Check if the business ID exists in the response
      const businessExists = response.data.data.some((business: any) => business.id === this.config.businessId);

      return businessExists;
    } catch (error) {
      throw new Error(`Failed to validate Facebook access token: ${error.message}`);
    }
  }
}

export default FacebookModuleService;
