export type Permission = {
  /**
   * e.g. orders
   */
  name: string;

  /**
   * e.g. /^\/orders/
   */
  path: string;

  /**
   * e.g. POST
   */
  method: PermissionType;
};

export enum PermissionType {
  "POST" = "POST",
  "GET" = "GET",
  "PUT" = "PUT",
  "DELETE" = "DELETE",
}
