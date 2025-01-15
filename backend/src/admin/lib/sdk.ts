import Medusa from "@medusajs/js-sdk";
import { BACKEND_URL } from "../../lib/constants.js";

export const sdk = new Medusa({
  baseUrl: BACKEND_URL,
  debug: process.env.NODE_ENV === "development",
  auth: {
    type: "session",
  },
});
