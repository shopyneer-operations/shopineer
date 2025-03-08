import { Migration } from '@mikro-orm/migrations';

export class Migration20250308121601 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "review" add column if not exists "image" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "review" drop column if exists "image";`);
  }

}
