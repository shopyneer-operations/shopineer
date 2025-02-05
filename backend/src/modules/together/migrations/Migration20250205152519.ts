import { Migration } from '@mikro-orm/migrations';

export class Migration20250205152519 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table if exists "together" add column if not exists "product_id_1" text not null, add column if not exists "product_id_2" text not null;');
    this.addSql('alter table if exists "together" drop column if exists "product_handle_1";');
    this.addSql('alter table if exists "together" drop column if exists "product_handle_2";');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "together" add column if not exists "product_handle_1" text not null, add column if not exists "product_handle_2" text not null;');
    this.addSql('alter table if exists "together" drop column if exists "product_id_1";');
    this.addSql('alter table if exists "together" drop column if exists "product_id_2";');
  }

}
