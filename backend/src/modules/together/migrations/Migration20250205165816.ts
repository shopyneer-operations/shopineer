import { Migration } from '@mikro-orm/migrations';

export class Migration20250205165816 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "together" ("id" text not null, "product_id_1" text not null, "product_id_2" text not null, "frequency" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "together_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_together_deleted_at" ON "together" (deleted_at) WHERE deleted_at IS NULL;');

    this.addSql('drop table if exists "together-2" cascade;');
  }

  async down(): Promise<void> {
    this.addSql('create table if not exists "together-2" ("id" text not null, "product_id_1" text not null, "product_id_2" text not null, "frequency" integer not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "together-2_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_together-2_deleted_at" ON "together-2" (deleted_at) WHERE deleted_at IS NULL;');

    this.addSql('drop table if exists "together" cascade;');
  }

}
