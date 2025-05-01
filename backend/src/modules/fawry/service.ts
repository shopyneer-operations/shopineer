import {
  ProviderWebhookPayload,
  WebhookActionResult,
  Logger,
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
import { BACKEND_URL } from "../../lib/constants";
import { EntityManager } from "@mikro-orm/knex";
import { processPaymentWorkflow } from "@medusajs/core-flows";
import convertBigNumberToNumber from "./utils/convertBigNumberToNumber";

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
  async updatePayment(input: UpdatePaymentInput): Promise<UpdatePaymentOutput> {
    return {};
  }
  async cancelPayment(input: CancelPaymentInput): Promise<CancelPaymentOutput> {
    return {};
  }
  async deletePayment(input: DeletePaymentInput): Promise<DeletePaymentOutput> {
    return {};
  }
  getPaymentStatus(input: GetPaymentStatusInput): Promise<GetPaymentStatusOutput> {
    throw new Error("Method not implemented.");
  }

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

  private generateCheckoutSignature(
    sessionId: string,
    cart: CartResponse,
    totalPrice: number,
    returnUrl: string
  ): string {
    const merchantRefNum = sessionId;
    const customerProfileId = cart.customer_id;
    const itemsDetails = fp.flow(
      this.getCheckoutItems(totalPrice),
      fp.map((item) => `${item.itemId}${item.quantity}${Number(item.price).toFixed(2)}`),
      fp.join("")
    )(cart);
    const { merchantCode, securityCode } = this.options_;

    const dataToHash = `${merchantCode}${merchantRefNum}${customerProfileId}${returnUrl}${itemsDetails}${securityCode}`;

    const signature = crypto.createHash("sha256").update(dataToHash).digest("hex");

    return signature;
  }

  private generateRetrieveSignature(merchantRefNum: string) {
    const { merchantCode, securityCode } = this.options_;

    const dataToHash = `${merchantCode}${merchantRefNum}${securityCode}`;

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
      const amountDifference = Number(totalPrice) - Number(lineItemsTotal);

      if (amountDifference !== 0) {
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

    console.log("💵💵💵💵", result);

    return result;
  });

  private buildCheckoutRequest(
    sessionId: string,
    cart: CartResponse,
    totalPrice: number,
    returnUrl?: string
  ): ChargeRequest {
    const { merchantCode, returnUrl: defaultReturnUrl } = this.options_;
    if (!returnUrl) {
      returnUrl = defaultReturnUrl;
    }

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
      signature: this.generateCheckoutSignature(sessionId, cart, totalPrice, returnUrl),
    };

    return request;
  }

  private generateRefundSignature(referenceNumber: string, refundAmount: number) {
    const { merchantCode, securityCode } = this.options_;
    const dataToHash = `${merchantCode}${referenceNumber}${refundAmount.toFixed(2)}${securityCode}`;

    const signature = crypto.createHash("sha256").update(dataToHash).digest("hex");

    return signature;
  }

  private buildRefundRequest(referenceNumber: string, refundAmount: number) {
    const { merchantCode } = this.options_;

    return {
      merchantCode,
      referenceNumber,
      refundAmount: refundAmount.toFixed(2),
      signature: this.generateRefundSignature(referenceNumber, refundAmount),
    };
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

  async initiatePayment(input: InitiatePaymentInput): Promise<InitiatePaymentOutput> {
    {
      console.log("✨", input);
      const { cartId, returnUrl, session_id } = input.data as Record<string, string>;

      const cart = await this.getCart(cartId);

      const activityId = this.logger_.activity(
        `⚡🔵 Fawry (initiatePayment): Initiating a payment for cart: ${cartId}`
      );
      const checkoutRequest = this.buildCheckoutRequest(
        session_id,
        cart,
        convertBigNumberToNumber(input.amount),
        returnUrl
      );

      try {
        const response = await axios.post(`${this.options_.baseUrl}/fawrypay-api/api/payments/init`, checkoutRequest, {
          headers: {
            "Content-Type": "application/json",
          },
        });

        this.logger_.success(
          activityId,
          `⚡🟢 Fawry (initiatePayment): Successfully created checkout URL: ${response.data} for cart: ${cartId}`
        );

        return { id: session_id, data: { checkoutUrl: response.data, merchantRefNum: session_id } };
      } catch (error) {
        this.logger_.failure(
          activityId,
          `⚡🔴 Fawry (initiatePayment): Failed to create checkout URL for cart: ${cartId} with error: ${
            error.message
          }. Details: ${JSON.stringify(error.response?.data)}`
        );

        throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error.message);
      }
    }
  }

  async authorizePayment(input: AuthorizePaymentInput): Promise<AuthorizePaymentOutput> {
    const activityId = this.logger_.log(`⚡🔵 Fawry (authorizePayment): Authorizing: ${JSON.stringify(input)}`);
    return {
      data: input.data,
      status: "captured",
    };
  }

  async capturePayment(input: CapturePaymentInput): Promise<CapturePaymentOutput> {
    const activityId = this.logger_.log(`⚡🔵 Fawry (capturePayment): Capturing: ${JSON.stringify(input)}`);
    return { data: input.data };
  }

  async getWebhookActionAndData(payload: ProviderWebhookPayload["payload"]): Promise<WebhookActionResult> {
    const activityId = this.logger_.activity(
      `⚡🔵 Fawry (webhook): triggered with payload: ${JSON.stringify(payload.data)}`,
      payload.data
    );

    const data = payload.data as unknown as WebhookPayload;

    switch (data.orderStatus) {
      case "NEW":
        this.logger_.success(
          activityId,
          `⚡🟢 Fawry (webhook): Setting session_id: ${data.merchantRefNumber} as authorized`
        );

        return {
          action: "authorized",
          data: {
            session_id: data.merchantRefNumber,
            amount: new BigNumber(data.paymentAmount as number),
          },
        };
      case "PAID":
        this.logger_.success(
          activityId,
          `⚡🟢 Fawry (webhook): Setting session_id: ${data.merchantRefNumber} as captured`
        );

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

  async refundPayment(input: RefundPaymentInput): Promise<RefundPaymentOutput> {
    const activityId = this.logger_.activity(
      `⚡🔵 Fawry (refundPayment): Initiating a refund for payment: ${JSON.stringify(input.data)}`
    );

    try {
      // 1. get payment by merchant reference number (session_id)
      const paymentData = await this.retrievePayment({ data: { id: input.data.merchantRefNum } });

      const response = await axios.post(
        `${this.options_.baseUrl}/ECommerceWeb/Fawry/payments/refund`,
        this.buildRefundRequest((paymentData.data as any).fawryRefNumber, convertBigNumberToNumber(input.amount)),
        { headers: { "Content-Type": "application/json" } }
      );
      this.logger_.success(
        activityId,
        `⚡🟢 Fawry (refundPayment): Successfully created a refund for payment ${
          paymentData.data.fawryRefNumber
        } with amount: ${convertBigNumberToNumber(input.amount)}`
      );
      return { data: { ...response.data } };
    } catch (error) {
      this.logger_.failure(
        activityId,
        `⚡🔴 Fawry (refundPayment): Failed to refund payment: ${input.data.merchantRefNum} with error: ${error.message}`
      );
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error.message);
    }
  }

  async retrievePayment(input: RetrievePaymentInput): Promise<RetrievePaymentOutput> {
    const activityId = this.logger_.activity(`⚡🔵 Fawry (retrievePayment): Retrieving a payment: ${input.data.id}`);
    const externalId = input.data?.id;

    try {
      const response = await axios.get(
        `${this.options_.baseUrl}/ECommerceWeb/Fawry/payments/status/v2?merchantCode=${
          this.options_.merchantCode
        }&merchantRefNumber=${externalId}&signature=${this.generateRetrieveSignature(externalId as string)}`,
        { headers: { "Content-Type": "application/json" } }
      );

      this.logger_.success(activityId, `⚡🟢 Fawry (retrievePayment): Successfully retrieved payment: ${externalId}`);

      return { data: response.data };
    } catch (error) {
      this.logger_.failure(
        activityId,
        `⚡🔴 Fawry (retrievePayment): Failed to retrieve payment: ${externalId} with error: ${error.message}`
      );
      throw new MedusaError(MedusaError.Types.UNEXPECTED_STATE, error.message);
    }
  }
}
