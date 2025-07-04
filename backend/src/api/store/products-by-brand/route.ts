import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import { ContainerRegistrationKeys } from "@medusajs/framework/utils";
import productBrand from "../../../links/product-brand";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);
  const { brand_id, limit, offset, fields, order } = req.query;

  if (!brand_id || typeof brand_id !== "string") {
    return res.status(400).json({
      message: "Brand ID is required",
    });
  }

  // Parse pagination parameters
  const take = limit ? parseInt(limit as string) : 50;
  const skip = offset ? parseInt(offset as string) : 0;

  // Parse order parameter
  let orderObj: Record<string, any> | undefined;
  if (order && typeof order === "string") {
    const orderParts = order.split(",");
    orderObj = {};
    orderParts.forEach((part) => {
      const trimmed = part.trim();
      if (trimmed.startsWith("-")) {
        orderObj![trimmed.substring(1)] = "DESC";
      } else {
        orderObj![trimmed] = "ASC";
      }
    });
  }

  // Parse fields or use defaults
  const defaultFields = [
    "product.id",
    "product.title",
    "product.handle",
    "product.thumbnail",
    "product.description",
    "product.status",
    "product.created_at",
    "product.updated_at",
    "product.variants.*",
    "product.variants.calculated_price",
    "product.variants.inventory_quantity",
    "brand.id",
    "brand.name",
  ];

  const queryFields = fields ? (fields as string).split(",") : defaultFields;

  try {
    const { data: products, metadata } = await query.graph({
      entity: productBrand.entryPoint,
      fields: queryFields,
      filters: {
        brand_id,
      },
      pagination: {
        take,
        skip,
        order: orderObj,
      },
    });

    // Extract products from the link records
    const extractedProducts = products.map((linkRecord: any) => linkRecord.product);

    res.json({
      products: extractedProducts,
      count: metadata?.count || extractedProducts.length,
      limit: metadata?.take || 50,
      offset: metadata?.skip || 0,
    });
  } catch (error) {
    console.error("Error fetching products by brand:", error);
    res.status(500).json({
      message: "Failed to fetch products by brand",
    });
  }
};
