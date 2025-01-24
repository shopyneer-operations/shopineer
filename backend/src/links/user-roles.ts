import { defineLink } from "@medusajs/framework/utils";
import UserModule from "@medusajs/medusa/user";
import RbacModule from "src/modules/rbac";

export default defineLink({ linkable: UserModule.linkable.user, isList: true }, RbacModule.linkable.role);
