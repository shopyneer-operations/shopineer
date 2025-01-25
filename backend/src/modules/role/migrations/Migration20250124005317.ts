import { Migration } from '@mikro-orm/migrations';

export class Migration20250124005317 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "permission" ("id" text not null, "name" text not null, "metadata" jsonb null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "permission_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_permission_deleted_at" ON "permission" (deleted_at) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "role" ("id" text not null, "name" text not null, "created_at" timestamptz not null default now(), "updated_at" timestamptz not null default now(), "deleted_at" timestamptz null, constraint "role_pkey" primary key ("id"));');
    this.addSql('CREATE INDEX IF NOT EXISTS "IDX_role_deleted_at" ON "role" (deleted_at) WHERE deleted_at IS NULL;');

    this.addSql('create table if not exists "permission_roles" ("permission_id" text not null, "role_id" text not null, constraint "permission_roles_pkey" primary key ("permission_id", "role_id"));');

    this.addSql('alter table if exists "permission_roles" add constraint "permission_roles_permission_id_foreign" foreign key ("permission_id") references "permission" ("id") on update cascade on delete cascade;');
    this.addSql('alter table if exists "permission_roles" add constraint "permission_roles_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade on delete cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "permission_roles" drop constraint if exists "permission_roles_permission_id_foreign";');

    this.addSql('alter table if exists "permission_roles" drop constraint if exists "permission_roles_role_id_foreign";');

    this.addSql('drop table if exists "permission" cascade;');

    this.addSql('drop table if exists "role" cascade;');

    this.addSql('drop table if exists "permission_roles" cascade;');
  }

}
