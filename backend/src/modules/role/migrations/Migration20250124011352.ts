import { Migration } from '@mikro-orm/migrations';

export class Migration20250124011352 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table if not exists "role_permission" ("role_id" text not null, "permission_id" text not null, constraint "role_permission_pkey" primary key ("role_id", "permission_id"));');

    this.addSql('alter table if exists "role_permission" add constraint "role_permission_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade on delete cascade;');
    this.addSql('alter table if exists "role_permission" add constraint "role_permission_permission_id_foreign" foreign key ("permission_id") references "permission" ("id") on update cascade on delete cascade;');

    this.addSql('drop table if exists "permission_roles" cascade;');
  }

  async down(): Promise<void> {
    this.addSql('create table if not exists "permission_roles" ("permission_id" text not null, "role_id" text not null, constraint "permission_roles_pkey" primary key ("permission_id", "role_id"));');

    this.addSql('alter table if exists "permission_roles" add constraint "permission_roles_permission_id_foreign" foreign key ("permission_id") references "permission" ("id") on update cascade on delete cascade;');
    this.addSql('alter table if exists "permission_roles" add constraint "permission_roles_role_id_foreign" foreign key ("role_id") references "role" ("id") on update cascade on delete cascade;');

    this.addSql('drop table if exists "role_permission" cascade;');
  }

}
