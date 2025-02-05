import { Migration } from '@mikro-orm/migrations';

export class Migration20250205143935 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "together" ("id" text not null, "product_handle_1" text not null, "product_handle_2" text not null, "frequency" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "together_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_together_deleted_at" ON "together" (deleted_at) WHERE deleted_at IS NULL;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "together" cascade;');
  }

}
