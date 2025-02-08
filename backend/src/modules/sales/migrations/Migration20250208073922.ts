import { Migration } from '@mikro-orm/migrations';

export class Migration20250208073922 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "sales" ("id" text not null, "sales" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "sales_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_sales_deleted_at" ON "sales" (deleted_at) WHERE deleted_at IS NULL;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "sales" cascade;');
  }

}
