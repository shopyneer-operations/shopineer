import { Migration } from '@mikro-orm/migrations';

export class Migration20251206220056 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "wishlist_item" drop constraint if exists "wishlist_item_product_variant_id_wishlist_id_unique";`);
    this.addSql(`alter table if exists "wishlist" drop constraint if exists "wishlist_customer_id_sales_channel_id_unique";`);
    this.addSql(`alter table if exists "wishlist_item" drop constraint if exists "wishlist_item_wishlist_id_foreign";`);

    this.addSql(`alter table if exists "wishlist" add column if not exists "customer_id" text not null, add column if not exists "sales_channel_id" text not null;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_wishlist_customer_id_sales_channel_id_unique" ON "wishlist" (customer_id, sales_channel_id) WHERE deleted_at IS NULL;`);

    this.addSql(`alter table if exists "wishlist_item" drop column if exists "quantity", drop column if exists "productId", drop column if exists "productVariantId";`);

    this.addSql(`alter table if exists "wishlist_item" add column if not exists "product_variant_id" text not null;`);
    this.addSql(`alter table if exists "wishlist_item" add constraint "wishlist_item_wishlist_id_foreign" foreign key ("wishlist_id") references "wishlist" ("id") on update cascade;`);
    this.addSql(`CREATE UNIQUE INDEX IF NOT EXISTS "IDX_wishlist_item_product_variant_id_wishlist_id_unique" ON "wishlist_item" (product_variant_id, wishlist_id) WHERE deleted_at IS NULL;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "wishlist_item" drop constraint if exists "wishlist_item_wishlist_id_foreign";`);

    this.addSql(`drop index if exists "IDX_wishlist_customer_id_sales_channel_id_unique";`);
    this.addSql(`alter table if exists "wishlist" drop column if exists "customer_id", drop column if exists "sales_channel_id";`);

    this.addSql(`drop index if exists "IDX_wishlist_item_product_variant_id_wishlist_id_unique";`);

    this.addSql(`alter table if exists "wishlist_item" add column if not exists "quantity" integer not null, add column if not exists "productVariantId" text not null;`);
    this.addSql(`alter table if exists "wishlist_item" rename column "product_variant_id" to "productId";`);
    this.addSql(`alter table if exists "wishlist_item" add constraint "wishlist_item_wishlist_id_foreign" foreign key ("wishlist_id") references "wishlist" ("id") on update cascade on delete cascade;`);
  }

}
