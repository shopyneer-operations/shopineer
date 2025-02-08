import { InjectManager, InjectTransactionManager, MedusaContext, MedusaService } from "@medusajs/framework/utils";
import { Sales } from "./models/sales";
import { Context } from "@medusajs/framework/types";
import { EntityManager } from "@mikro-orm/knex";

class SalesModuleService extends MedusaService({ Sales }) {
  @InjectManager()
  async incrementProductSales(productId: string, count = 1, @MedusaContext() sharedContext?: Context<EntityManager>) {
    const result = await sharedContext.manager.execute(`
      WITH existing_sales AS (
        SELECT s.id
        FROM sales s
        JOIN product_product_sales_sales ps ON s.id = ps.sales_id
        WHERE ps.product_id = '${productId}'
        LIMIT 1
      ),
      inserted_sales AS (
        INSERT INTO sales (id, sales)
        VALUES (
          COALESCE((SELECT id FROM existing_sales)::uuid, gen_random_uuid()), 
          ${count}
        )
        ON CONFLICT (id)
        DO UPDATE SET sales = sales.sales + EXCLUDED.sales
        RETURNING id
      ),
      final_insert AS (
        INSERT INTO product_product_sales_sales (id, product_id, sales_id)
        SELECT gen_random_uuid(), '${productId}', id
        FROM inserted_sales
        ON CONFLICT (product_id, sales_id)
        DO UPDATE SET sales_id = EXCLUDED.sales_id
        RETURNING id
      )
      SELECT id FROM final_insert;
    `);

    return result;
  }
}

export default SalesModuleService;
