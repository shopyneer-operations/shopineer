import { Migration } from '@mikro-orm/migrations';

export class Migration20250123164122 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "update" ("id" text not null, "prices" jsonb not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "update_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_update_deleted_at" ON "update" (deleted_at) WHERE deleted_at IS NULL;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "update" cascade;');
  }

}
