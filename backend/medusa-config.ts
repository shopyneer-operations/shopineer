import { loadEnv, defineConfig, Modules, ContainerRegistrationKeys } from "@medusajs/framework/utils";
import {
  ADMIN_CORS,
  AUTH_CORS,
  BACKEND_URL,
  COOKIE_SECRET,
  DATABASE_URL,
  JWT_SECRET,
  REDIS_URL,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  SENDGRID_API_KEY,
  SENDGRID_FROM_EMAIL,
  SHOULD_DISABLE_ADMIN,
  STORE_CORS,
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET,
  WORKER_MODE,
  MINIO_ENDPOINT,
  MINIO_ACCESS_KEY,
  MINIO_SECRET_KEY,
  MINIO_BUCKET,
  MEILISEARCH_HOST,
  MEILISEARCH_API_KEY,
  FAWRY_MERCHANT_CODE,
  STORE_URL,
  FAWRY_RETURN_PATH,
  FAWRY_SECURITY_CODE,
  FAWRY_BASE_URL,
  FAWATERAK_BASE_URL,
  FAWATERAK_API_KEY,
  FAWATERAK_RETURN_PATH,
} from "./src/lib/constants";

loadEnv(process.env.NODE_ENV, process.cwd());

const medusaConfig = {
  projectConfig: {
    databaseUrl: DATABASE_URL,
    databaseLogging: false,
    redisUrl: REDIS_URL,
    workerMode: WORKER_MODE,
    http: {
      // adminCors: ADMIN_CORS,
      // authCors: AUTH_CORS,
      // storeCors: STORE_CORS,
      adminCors: "/^.*/",
      authCors: "/^.*/",
      storeCors: "/^.*/",
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET,
      jwtExpiresIn: "30d",
    },
  },
  admin: {
    backendUrl: BACKEND_URL,
    disable: SHOULD_DISABLE_ADMIN,
  },
  modules: [
    {
      resolve: "./src/modules/sales",
    },
    {
      resolve: "./src/modules/together",
    },
    {
      resolve: "./src/modules/review",
    },
    {
      resolve: "./src/modules/facebook",
      options: {
        accessToken: process.env.FACEBOOK_ACCESS_TOKEN,
        catalogId: process.env.FACEBOOK_CATALOG_ID,
        businessId: process.env.FACEBOOK_BUSINESS_ID,
        apiVersion: "v18.0",
      },
    },
    {
      resolve: "./src/modules/brand",
    },
    {
      resolve: "./src/modules/supplier",
    },
    {
      resolve: "./src/modules/price-history",
    },
    {
      resolve: "./src/modules/role",
    },
    {
      resolve: "./modules/store-analytics",
    },
    {
      resolve: "./modules/wishlist",
      options: {
        jwtSecret: JWT_SECRET,
      },
    },
    {
      // ...
      key: Modules.AUTH,
      resolve: "@medusajs/medusa/auth",
      dependencies: [Modules.CACHE, ContainerRegistrationKeys.LOGGER],
      options: {
        providers: [
          // other providers...
          {
            resolve: "@medusajs/medusa/auth-emailpass",
            id: "emailpass",
            options: {},
          },
          {
            resolve: "@medusajs/medusa/auth-google",
            id: "google",
            options: {
              clientId: process.env.GOOGLE_CLIENT_ID,
              clientSecret: process.env.GOOGLE_CLIENT_SECRET,
              callbackUrl: process.env.GOOGLE_CALLBACK_URL,
            },
          },
        ],
      },
    },
    {
      key: Modules.PAYMENT,
      resolve: "@medusajs/medusa/payment",
      options: {
        providers: [
          {
            resolve: "./src/modules/fawry",
            id: "fawry",
            options: {
              merchantCode: FAWRY_MERCHANT_CODE,
              securityCode: FAWRY_SECURITY_CODE,
              baseUrl: FAWRY_BASE_URL,
              returnUrl: `${STORE_URL}/${FAWRY_RETURN_PATH}`,
            },
          },
          {
            resolve: "./src/modules/fawaterak",
            id: "json",
            options: {
              baseUrl: FAWATERAK_BASE_URL,
              apiKey: FAWATERAK_API_KEY,
              returnUrl: `${STORE_URL}/${FAWATERAK_RETURN_PATH}`,
            },
          },
          // ...(STRIPE_API_KEY && STRIPE_WEBHOOK_SECRET
          //   ? [
          //       {
          //         resolve: "@medusajs/payment-stripe",
          //         id: "stripe",
          //         options: {
          //           apiKey: STRIPE_API_KEY,
          //           webhookSecret: STRIPE_WEBHOOK_SECRET,
          //         },
          //       },
          //     ]
          //   : []),
        ],
      },
    },
    {
      key: Modules.FILE,
      resolve: "@medusajs/file",
      options: {
        providers: [
          ...(MINIO_ENDPOINT && MINIO_ACCESS_KEY && MINIO_SECRET_KEY
            ? [
                {
                  resolve: "./src/modules/minio-file",
                  id: "minio",
                  options: {
                    endPoint: MINIO_ENDPOINT,
                    accessKey: MINIO_ACCESS_KEY,
                    secretKey: MINIO_SECRET_KEY,
                    bucket: MINIO_BUCKET, // Optional, default: medusa-media
                  },
                },
              ]
            : [
                {
                  resolve: "@medusajs/file-local",
                  id: "local",
                  options: {
                    upload_dir: "static",
                    backend_url: `${BACKEND_URL}/static`,
                  },
                },
              ]),
        ],
      },
    },
    ...(REDIS_URL
      ? [
          {
            key: Modules.EVENT_BUS,
            resolve: "@medusajs/event-bus-redis",
            options: {
              redisUrl: REDIS_URL,
            },
          },
          {
            key: Modules.WORKFLOW_ENGINE,
            resolve: "@medusajs/workflow-engine-redis",
            options: {
              redis: {
                url: REDIS_URL,
              },
            },
          },
        ]
      : []),
    ...((SENDGRID_API_KEY && SENDGRID_FROM_EMAIL) || (RESEND_API_KEY && RESEND_FROM_EMAIL)
      ? [
          {
            key: Modules.NOTIFICATION,
            resolve: "@medusajs/notification",
            options: {
              providers: [
                ...(SENDGRID_API_KEY && SENDGRID_FROM_EMAIL
                  ? [
                      {
                        resolve: "@medusajs/notification-sendgrid",
                        id: "sendgrid",
                        options: {
                          channels: ["email"],
                          api_key: SENDGRID_API_KEY,
                          from: SENDGRID_FROM_EMAIL,
                        },
                      },
                    ]
                  : []),
                ...(RESEND_API_KEY && RESEND_FROM_EMAIL
                  ? [
                      {
                        resolve: "./src/modules/email-notifications",
                        id: "resend",
                        options: {
                          channels: ["email"],
                          api_key: RESEND_API_KEY,
                          from: RESEND_FROM_EMAIL,
                        },
                      },
                    ]
                  : []),
              ],
            },
          },
        ]
      : []),
    ...(STRIPE_API_KEY && STRIPE_WEBHOOK_SECRET
      ? [
          {
            key: Modules.PAYMENT,
            resolve: "@medusajs/payment",
            options: {
              providers: [
                {
                  resolve: "@medusajs/payment-stripe",
                  id: "stripe",
                  options: {
                    apiKey: STRIPE_API_KEY,
                    webhookSecret: STRIPE_WEBHOOK_SECRET,
                  },
                },
              ],
            },
          },
        ]
      : []),
    // ...(MEILISEARCH_HOST && MEILISEARCH_API_KEY
    //   ? [
    //       {
    //         resolve: "medusa-plugin-meilisearch",
    //         options: {
    //           config: {
    //             host: MEILISEARCH_HOST,
    //             apiKey: MEILISEARCH_API_KEY,
    //           },
    //           settings: {
    //             products: {
    //               indexSettings: {
    //                 searchableAttributes: ["title", "description", "variant_sku"],
    //                 displayedAttributes: ["title", "description", "variant_sku", "thumbnail", "handle"],
    //               },
    //               primaryKey: "id",
    //             },
    //           },
    //         },
    //       },
    //     ]
    //   : []),
  ],
  plugins: [],
};

console.log(JSON.stringify(medusaConfig, null, 2));

export default defineConfig(medusaConfig);
