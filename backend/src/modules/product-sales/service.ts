import { InjectManager, MedusaContext, MedusaService } from "@medusajs/framework/utils";
import { ProductSales } from "./models/product-sales";
import { Context } from "@medusajs/framework/types";
import { EntityManager } from "@mikro-orm/knex";

class ProductSalesModuleService extends MedusaService({ ProductSales }) {
  @InjectManager()
  async incrementProductSales(productId: string, @MedusaContext() sharedContext?: Context<EntityManager>) {
    const result = await sharedContext.manager.execute(
      `INSERT INTO product_sales (product_id, order_count)
       VALUES (?, 1)
       ON CONFLICT (product_id)
       DO UPDATE SET order_count = product_sales.order_count + 1;`
    );
  }
}

export default ProductSalesModuleService;
