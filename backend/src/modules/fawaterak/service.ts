import {
  PaymentSessionStatus,
  ProviderWebhookPayload,
  WebhookActionResult,
  Logger,
  CartDTO,
  CartLineItemDTO,
  InitiatePaymentInput,
  InitiatePaymentOutput,
  CapturePaymentInput,
  CapturePaymentOutput,
  AuthorizePaymentInput,
  AuthorizePaymentOutput,
  RefundPaymentInput,
  RefundPaymentOutput,
  RetrievePaymentInput,
  RetrievePaymentOutput,
  CancelPaymentInput,
  CancelPaymentOutput,
  DeletePaymentInput,
  DeletePaymentOutput,
  GetPaymentStatusInput,
  GetPaymentStatusOutput,
  UpdatePaymentInput,
  UpdatePaymentOutput,
} from "@medusajs/framework/types";
import { AbstractPaymentProvider, BigNumber, MedusaError } from "@medusajs/framework/utils";
import fp from "lodash/fp";
import crypto from "crypto";
import axios from "axios";
import { EntityManager } from "@mikro-orm/knex";
import _ from "lodash";

type ChargeItem = {
  name: string;
  price: number;
  quantity: number;
};

interface ChargeRequest {
  cartTotal: number;
  currency: "USD" | "EGP" | "SR" | "AED" | "KWD" | "QAR" | "BHD";
  customer: {
    first_name: string;
    last_name: string;
    email?: string;
    phone?: string;
    address?: string;
    customer_unique_id?: string;
  };
  cartItems: {
    name: string;
    price: number;
    quantity: number;
  }[];
  shipping?: number;
  frequency?: "once" | "weekly" | "biweekly" | "monthly" | "quarterly";
  discountData?: {
    type: "pcg" | "literal";
    value: number;
  };
  taxData?: {
    title: string;
    value: number;
  };
  payLoad: {
    sessionId: string;
    cartId: string;
  };
  due_date?: string;
  sendEmail?: boolean;
  sendSMS?: boolean;
  redirectionUrls?: {
    successUrl?: string;
    failUrl?: string;
    pendingUrl?: string;
    webhookUrl?: string;
  };
}

interface ChargeResponse {
  status: "success" | "error";
  data: {
    url: string;
    invoiceKey: string;
    invoiceId: number;
  };
}

interface WebhookPayload {
  customerData: Record<string, any>;
  hashKey: string;
  invoice_id: number;
  invoice_key: string;
  invoice_status: "paid" | "cancelled" | "expired";
  paidAmount: number;
  paidAt: string;
  paidCurrency: string;
  pay_load: string | null;
  payment_method: string;
  referenceNumber: string;
}

type Options = {
  // merchantCode: string;
  apiKey: string;
  baseUrl: string;
  returnUrl: string;
};

type InjectedDependencies = {
  logger: Logger;
  manager: EntityManager;
};

type CartResponse = {
  cart_id: string;
  customer_id: string;
  customer_email: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_phone: string;
  line_items: {
    line_item_id: string;
    quantity: number;
    unit_price: number;
    title: string;
    subtitle: string;
    thumbnail: string;
  }[];
};

export default class FawaterakProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "fawaterak";
  protected logger_: Logger;
  protected options_: Options;
  protected manager_: EntityManager;
  // assuming you're initializing a client
  protected client;

  constructor(container: InjectedDependencies, options: Options) {
    super(container, options);

    this.options_ = options;
    this.manager_ = container.manager;
    this.logger_ = container.logger;
  }

  static validateOptions(options: Record<any, any>) {
    const requiredFields = ["apiKey", "baseUrl", "returnUrl"];

    for (const field of requiredFields) {
      if (!options[field]) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `${field} is required in the provider's options`);
      }
    }
  }

  private getCheckoutItems = fp.curry(function getCheckoutItems(totalPrice: number, cart: CartResponse): ChargeItem[] {
    return [
      {
        name: "Order Total",
        price: Number(totalPrice),
        quantity: 1,
      },
    ];
  });

  private async getCart(cartId: string): Promise<CartResponse> {
    const cart = (await this.manager_.execute(`
      SELECT
          c.id AS cart_id,
          cu.id AS customer_id,
          cu.email AS customer_email,
          ca.first_name AS customer_first_name,
          ca.last_name AS customer_last_name,
          ca.phone AS customer_phone,
          JSON_AGG(
              JSON_BUILD_OBJECT(
                  'line_item_id', cli.id,
                  'quantity', cli.quantity,
                  'unit_price', cli.unit_price,
                  'title', cli.title,
                  'subtitle', cli.subtitle,
            'thumbnail', cli.thumbnail
              )
          ) AS line_items
      FROM cart c
      LEFT JOIN customer cu ON c.customer_id = cu.id
      LEFT JOIN cart_address ca ON c.shipping_address_id = ca.id
      LEFT JOIN cart_line_item cli ON c.id = cli.cart_id
      WHERE c.id = '${cartId}'
      GROUP BY c.id, cu.id, cu.email, ca.first_name, ca.last_name, ca.phone
    `)) as CartResponse[];

    return cart[0];
  }

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    {
      const { cartId, returnUrl, session_id } = input.data as Record<string, string>;

      const cart = await this.getCart(cartId);

      const activityId = this.logger_.activity(
        `⚡🔵 Fawaterak (initiatePayment): Initiating a payment for cart: ${cartId}`
      );

      const request: ChargeRequest = {
        cartTotal: Number(input.amount),
        currency: "EGP",
        customer: {
          first_name: cart.customer_first_name,
          last_name: cart.customer_last_name,
          email: cart.customer_email,
          phone: cart.customer_phone,
          address: "",
        },
        payLoad: {
          sessionId: session_id,
          cartId,
        },
        redirectionUrls: {
          successUrl: this.options_.returnUrl,
          failUrl: this.options_.returnUrl,
          pendingUrl: this.options_.returnUrl,
          webhookUrl: `https://backend-production-b092.up.railway.app/hooks/payment/fawaterak_json`,
        },
        cartItems: this.getCheckoutItems(Number(input.amount), cart),
      };

      try {
        const response = await axios.post<ChargeRequest, { data: ChargeResponse }>(
          `${this.options_.baseUrl}/api/v2/createInvoiceLink`,
          request,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${this.options_.apiKey}`,
            },
          }
        );

        this.logger_.success(
          activityId,
          `⚡🟢 Fawaterak (initiatePayment): Successfully created checkout URL: ${response.data.data.url} for cart: ${cartId}`
        );

        return {
          id: session_id,
          data: {
            checkoutUrl: response.data.data.url,
            invoiceKey: response.data.data.invoiceKey,
            invoiceId: response.data.data.invoiceId.toString(),
          },
        };
      } catch (error) {
        this.logger_.failure(
          activityId,
          `⚡🔴 Fawaterak (initiatePayment): Failed to create checkout URL for cart: ${cartId} with error: ${
            error.message
          }. Details: ${JSON.stringify(error.response?.data)}`
        );

        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error.message);
      }
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const activityId = this.logger_.activity(
      `⚡🔵 Fawaterak (authorizePayment): Authorizing: ${JSON.stringify(input)}`
    );
    return {
      data: input.data,
      status: "captured",
    };
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const activityId = this.logger_.activity(`⚡🔵 Fawaterak (capturePayment): Capturing: ${JSON.stringify(input)}`);
    return { data: input.data };
  }

  // private generateHashKey(data: any): string {
  //   const { apiKey } = this.options_;
  //   const queryParam = `InvoiceId=${data.invoice_id}&InvoiceKey=${data.invoice_key}&PaymentMethod=${data.payment_method}`;
  //   return crypto.createHmac("sha256", apiKey).update(queryParam).digest("hex");
  // }

  // private generateCancelHashKey(data: any): string {
  //   const { apiKey } = this.options_;
  //   const queryParam = `referenceId=${data.referenceId}&PaymentMethod=${data.paymentMethod}`;
  //   return crypto.createHmac("sha256", apiKey).update(queryParam).digest("hex");
  // }

  async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    const activityId = this.logger_.activity(
      `⚡🔵 Fawaterak (webhook): triggered with payload: ${JSON.stringify(payload.data)}`,
      payload.data
    );

    const data = payload.data as unknown as WebhookPayload;
    const sessionId = data.pay_load ? JSON.parse(data.pay_load).sessionId : "";

    // Handle paid transactions
    if (data.invoice_status === "paid") {
      this.logger_.success(
        activityId,
        `⚡🟢 Fawaterak (webhook): Setting invoice: ${data.invoice_id} with session ID: ${sessionId} as captured`
      );

      return {
        action: "captured",
        data: {
          session_id: sessionId,
          amount: new BigNumber(data.paidAmount),
        },
      };
    }

    // Handle cancelled/expired transactions
    if (data.invoice_status === "cancelled" || data.invoice_status === "expired") {
      this.logger_.success(activityId, `⚡🟢 Fawaterak (webhook): Setting reference: ${data.invoice_id} as failed`);

      return {
        action: "failed",
        data: {
          session_id: sessionId,
          amount: new BigNumber(data.paidAmount),
        },
      };
    }

    // For any other status, return not supported
    return {
      action: "not_supported",
    };
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const activityId = this.logger_.activity(
      `⚡🔵 Fawaterak (retrievePayment): Retrieving a payment: ${input.data.id}`
    );
    const externalId = input.data?.id;

    try {
      const response = await axios.get(`${this.options_.baseUrl}/api/v2/getInvoiceData/${externalId}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.options_.apiKey}`,
        },
      });

      this.logger_.success(
        activityId,
        `⚡🟢 Fawaterak (retrievePayment): Successfully retrieved payment: ${externalId}`
      );

      return { data: response.data };
    } catch (error) {
      this.logger_.failure(
        activityId,
        `⚡🔴 Fawaterak (retrievePayment): Failed to retrieve payment: ${externalId} with error: ${error.message}`
      );
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error.message);
    }
  }

  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return {};
  }
  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    return {};
  }
  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return {};
  }
  async getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    const payment = await this.retrievePayment(input);

    if (payment.data.status === "success") {
      return {
        status: "captured",
      };
    }

    return {
      status: "pending",
    };
  }
  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return {};
  }
}
