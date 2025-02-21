import {
  PaymentProviderError,
  PaymentProviderSessionResponse,
  PaymentSessionStatus,
  CreatePaymentProviderSession,
  UpdatePaymentProviderSession,
  ProviderWebhookPayload,
  WebhookActionResult,
  Logger,
  CartDTO,
  CartLineItemDTO,
} from "@medusajs/types";
import { AbstractPaymentProvider, BigNumber, MedusaError } from "@medusajs/utils";
import fp from "lodash/fp";
import crypto from "crypto";
import axios from "axios";
import { BACKEND_URL } from "../../lib/constants";
import { EntityManager } from "@mikro-orm/knex";

type ChargeItem = {
  itemId: string;
  description: string;
  price: number;
  quantity: number;
  imageUrl: string;
};

interface ChargeRequest {
  merchantCode: string;
  merchantRefNum: string;
  customerMobile: string;
  customerEmail: string;
  customerName: string;
  customerProfileId: string;
  language: "en-gb" | "ar-eg";
  chargeItems: ChargeItem[];
  returnUrl: string;
  orderWebHookUrl?: string;
  authCaptureModePayment: boolean;
  signature: string;
}

interface WebhookPayload {
  requestId: string;
  fawryRefNumber: string;
  merchantRefNumber: string;
  customerName?: string;
  customerMail: string;
  paymentAmount: number;
  orderAmount: number;
  fawryFees: number;
  orderStatus: "NEW" | "PAID" | "CANCELLED" | "REFUNDED" | "EXPIRED" | "PARTIAL_REFUNDED" | "FAILD";
  failureReason?: string;
}

type Options = {
  merchantCode: string;
  securityCode: string;
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

export default class FawryProviderService extends AbstractPaymentProvider<Options> {
  static identifier = "fawry";
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
    const requiredFields = ["merchantCode", "securityCode", "baseUrl", "returnUrl"];

    for (const field of requiredFields) {
      if (!options[field]) {
        throw new MedusaError(MedusaError.Types.INVALID_DATA, `${field} is required in the provider's options`);
      }
    }
  }

  private generateSignature(sessionId: string, cart: CartResponse, totalPrice: number): string {
    const merchantRefNum = sessionId;
    const customerProfileId = cart.customer_id;
    const itemsDetails = fp.flow(
      this.getCheckoutItems(totalPrice),
      fp.map((item) => `${item.itemId}${item.quantity}${Number(item.price).toFixed(2)}`),
      fp.join("")
    )(cart);
    const { returnUrl, merchantCode, securityCode } = this.options_;

    const dataToHash = `${merchantCode}${merchantRefNum}${customerProfileId}${returnUrl}${itemsDetails}${securityCode}`;

    const signature = crypto.createHash("sha256").update(dataToHash).digest("hex");

    return signature;
  }

  private getCheckoutItems = fp.curry(function getCheckoutItems(totalPrice: number, cart: CartResponse): ChargeItem[] {
    /**
     * Add amount difference item to cart if amount difference is greater than 0
     */
    const addAmountDifferenceItem = fp.curry(function addAmountDifferenceItem(
      totalPrice: number,
      lineItems: ChargeItem[]
    ) {
      lineItems = fp.cloneDeep(lineItems);
      const lineItemsTotal = fp.sumBy<ChargeItem>("price", lineItems);
      const amountDifference = Number(lineItemsTotal) - Number(totalPrice);

      if (amountDifference > 0) {
        lineItems.push({
          itemId: "amount_difference",
          description: "Amount Difference",
          price: amountDifference,
          quantity: 1,
          imageUrl: "",
        });
      }
      return lineItems;
    });

    function mapCartItemToChargeItem(item: CartResponse["line_items"][0]): ChargeItem {
      return {
        itemId: item.line_item_id,
        description: `${item.subtitle} ${item.title}`,
        price: Number(item.unit_price),
        quantity: Number(item.quantity),
        imageUrl: item.thumbnail,
      };
    }

    const result = fp.flow(
      fp.map(mapCartItemToChargeItem),
      addAmountDifferenceItem(totalPrice),
      fp.sortBy<ChargeItem>("itemId")
    )(cart.line_items);

    return result;
  });

  private buildCheckoutRequest(sessionId: string, cart: CartResponse, totalPrice: number): ChargeRequest {
    const { merchantCode, returnUrl } = this.options_;
    const request: ChargeRequest = {
      merchantCode,
      merchantRefNum: sessionId,
      customerMobile: cart.customer_phone,
      customerEmail: cart.customer_email,
      customerName: cart.customer_first_name + " " + cart.customer_last_name,
      customerProfileId: cart.customer_id,
      language: "ar-eg",
      chargeItems: this.getCheckoutItems(totalPrice, cart),
      returnUrl,
      orderWebHookUrl: `${BACKEND_URL}/hooks/payment/${FawryProviderService.identifier}_fawry`,
      authCaptureModePayment: false,
      signature: this.generateSignature(sessionId, cart, totalPrice),
    };

    return request;
  }

  private generateRefundObject(referenceNumber: string, refundAmount: number) {
    const { merchantCode, securityCode } = this.options_;
    const dataToHash = `${merchantCode}${referenceNumber}${refundAmount.toFixed(2)}${securityCode}`;

    const signature = crypto.createHash("sha256").update(dataToHash).digest("hex");

    return signature;
  }

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

  async initiatePayment({
    context,
    amount,
  }: CreatePaymentProviderSession): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    const cart = await this.getCart(context.extra.cartId as string);

    console.log("✨", cart);

    const activityId = this.logger_.activity(
      `⚡🔵 Fawry (initiatePayment): Initiating a payment for cart: ${context.extra.cartId}`
    );
    const checkoutRequest = this.buildCheckoutRequest(context.session_id, cart, Number(amount));

    try {
      const response = await axios.post(`${this.options_.baseUrl}/fawrypay-api/api/payments/init`, checkoutRequest, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      this.logger_.success(
        activityId,
        `⚡🟢 Fawry (initiatePayment): Successfully created checkout URL: ${response.data} for cart: ${context.extra.cartId}`
      );

      return { data: { checkoutUrl: response.data } };
    } catch (error) {
      this.logger_.failure(
        activityId,
        `⚡🔴 Fawry (initiatePayment): Failed to create checkout URL for cart: ${context.extra.cartId} with error: ${error.message}`
      );

      return {
        error: error.message,
        code: "unknown",
        detail: error,
      };
    }
  }

  async authorizePayment(
    paymentSessionData: Record<string, unknown>,
    context: Record<string, unknown>
  ): Promise<PaymentProviderError | { status: PaymentSessionStatus; data: PaymentProviderSessionResponse["data"] }> {
    return {
      data: paymentSessionData,
      status: "captured",
    };
  }

  async capturePayment(
    paymentData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    const externalId = paymentData.id;

    try {
      return {
        id: externalId,
      };
    } catch (e) {
      return {
        error: e,
        code: "unknown",
        detail: e,
      };
    }
  }

  async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    const activityId = this.logger_.activity(
      `⚡🔵 Fawry (webhook): triggered with payload: ${JSON.stringify(payload)}`
    );

    const data = payload.data as unknown as WebhookPayload;

    switch (data.orderStatus) {
      case "NEW":
        return {
          action: "authorized",
          data: {
            session_id: data.merchantRefNumber,
            amount: new BigNumber(data.paymentAmount as number),
          },
        };
      case "PAID":
        return {
          action: "captured",
          data: {
            session_id: data.merchantRefNumber,
            amount: new BigNumber(data.paymentAmount as number),
          },
        };
      case "FAILD":
      case "EXPIRED":
        return {
          action: "failed",
          data: {
            session_id: data.merchantRefNumber,
            amount: new BigNumber(data.paymentAmount as number),
          },
        };
      default:
        return {
          action: "not_supported",
        };
    }
  }

  async refundPayment(
    paymentData: Record<string, unknown>,
    refundAmount: number
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    const activityId = this.logger_.activity(
      `⚡🔵 Fawry (refundPayment): Initiating a refund for payment: ${paymentData.checkoutUrl}`
    );
    console.log("🤯", paymentData, refundAmount);

    try {
      const response = await axios.post(
        `${this.options_.baseUrl}/ECommerceWeb/Fawry/payments/refund`,
        this.generateRefundObject("", refundAmount),
        { headers: { "Content-Type": "application/json" } }
      );

      this.logger_.success(
        activityId,
        `⚡🟢 Fawry (refundPayment): Successfully created a refund for payment ${paymentData.checkoutUrl} with amount: ${refundAmount}`
      );

      return { data: { ...response.data } };
    } catch (error) {
      this.logger_.failure(
        activityId,
        `⚡🔴 Fawry (refundPayment): Failed to refund payment: ${paymentData.checkoutUrl} with error: ${error.message}`
      );

      return {
        error: error.message,
        code: "unknown",
        detail: error,
      };
    }
  }

  cancelPayment(
    paymentData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    throw new Error("Method not implemented.");
  }

  deletePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    throw new Error("Method not implemented.");
  }
  getPaymentStatus(paymentSessionData: Record<string, unknown>): Promise<PaymentSessionStatus> {
    throw new Error("Method not implemented.");
  }
  retrievePayment(
    paymentSessionData: Record<string, unknown>
  ): Promise<PaymentProviderError | PaymentProviderSessionResponse["data"]> {
    throw new Error("Method not implemented.");
  }
  updatePayment(context: UpdatePaymentProviderSession): Promise<PaymentProviderError | PaymentProviderSessionResponse> {
    throw new Error("Method not implemented.");
  }
}
