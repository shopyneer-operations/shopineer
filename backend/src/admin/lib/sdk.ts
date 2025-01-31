import Medusa from "@medusajs/js-sdk";

export const sdk = new Medusa({
  baseUrl:
    process.env.NODE_ENV === "development"
      ? "http://localhost:9000"
      : "https://backend-production-b092.up.railway.app/",
  debug: process.env.NODE_ENV === "development",
  auth: {
    type: "session",
  },
});
