import { defineLink } from "@medusajs/framework/utils";
import UserModule from "@medusajs/medusa/user";
import ReviewModule from "../modules/review";

export default defineLink(UserModule.linkable.user, {
  linkable: ReviewModule.linkable.review,
  isList: true,
  deleteCascade: true,
});
