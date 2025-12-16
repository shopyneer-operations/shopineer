import { Migration } from '@mikro-orm/migrations';

export class Migration20251213143942 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`alter table if exists "brand" add column if not exists "tag_id" text null;`);
  }

  override async down(): Promise<void> {
    this.addSql(`alter table if exists "brand" drop column if exists "tag_id";`);
  }

}
