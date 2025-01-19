import { Migration } from '@mikro-orm/migrations';

export class Migration20250117100930 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table if exists "supplier" add column if not exists "test" boolean not null default false;');
    this.addSql('alter table if exists "supplier" drop column if exists "contact_person";');
    this.addSql('alter table if exists "supplier" drop column if exists "email";');
    this.addSql('alter table if exists "supplier" drop column if exists "phone";');
  }

  async down(): Promise<void> {
    this.addSql('alter table if exists "supplier" add column if not exists "contact_person" text not null default \'\', add column if not exists "email" text not null default \'\', add column if not exists "phone" text not null default \'\';');
    this.addSql('alter table if exists "supplier" drop column if exists "test";');
  }

}
