import { Migration } from '@mikro-orm/migrations';

export class Migration20250203221125 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "review" ("id" text not null, "rating" integer not null, "title" text not null, "description" text null, "approved_at" timestamptz null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "review_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_review_deleted_at" ON "review" (deleted_at) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "response" ("id" text not null, "text" text not null, "review_id" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "response_pkey" primary key ("id"));');
    this.addSql('alter table if exists "response" add constraint "response_review_id_unique" unique ("review_id");');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_response_review_id" ON "response" (review_id) WHERE deleted_at IS NULL;');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_response_deleted_at" ON "response" (deleted_at) WHERE deleted_at IS NULL;');

    this.addSql('alter table if exists "response" add constraint "response_review_id_foreign" foreign key ("review_id") references "review" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "response" drop constraint if exists "response_review_id_foreign";');

    this.addSql('drop table if exists "review" cascade;');

    this.addSql('drop table if exists "response" cascade;');
  }

}
