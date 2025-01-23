import { Migration } from '@mikro-orm/migrations';

export class Migration20250123212812 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "price_history" ("id" text not null, "currency_code" text not null, "amount" numeric not null, "raw_amount" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "price_history_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_price_history_deleted_at" ON "price_history" (deleted_at) WHERE deleted_at IS NULL;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "price_history" cascade;');
  }

}
