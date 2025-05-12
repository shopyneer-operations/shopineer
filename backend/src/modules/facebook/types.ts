export type FacebookProductItem = {
  /** Additional product image URLs */
  additional_image_urls?: string[];

  /** Additional attributes to distinguish the product in its variant group (e.g. {"Scent" : "Fruity", "Style" : "Classic"}) */
  additional_variant_attributes?: Record<string, string>;

  /** The name of the Android app (suitable for display) */
  android_app_name?: string;

  /** Fully-qualified Activity class name for intent generation */
  android_class?: string;

  /** Fully-qualified package name for intent generation */
  android_package?: string;

  /** A custom scheme for the Android app */
  android_url?: string;

  /** Availability of the product item (default: 'in stock') */
  availability?:
    | "in stock"
    | "out of stock"
    | "preorder"
    | "available for order"
    | "discontinued"
    | "pending"
    | "mark_as_sold";

  /** Brand of the product item */
  brand?: string;

  /** Google product category. Use `product_type` for custom names */
  category?: string;

  /** Category-specific fields as a JSON object */
  category_specific_fields?: Record<string, any>;

  /** URL to add product to cart and directly to checkout */
  checkout_url?: string;

  /** Color of the product item */
  color?: string;

  /** Commerce tax category */
  commerce_tax_category?: string;

  /** Condition of the product item (default: 'new') */
  condition?: "new" | "refurbished" | "used" | "used_like_new" | "used_good" | "used_fair" | "cpo" | "open_box_new";

  /** Currency in ISO 4217 code */
  currency?: string;

  /** Custom variants like color, size, etc. Required. */
  custom_data: Record<string, string>;

  /** Optional custom label (max 100 chars) */
  custom_label_0?: string;
  /** Optional custom label (max 100 chars) */
  custom_label_1?: string;
  /** Optional custom label (max 100 chars) */
  custom_label_2?: string;
  /** Optional custom label (max 100 chars) */
  custom_label_3?: string;
  /** Optional custom label (max 100 chars) */
  custom_label_4?: string;

  /** Optional custom number */
  custom_number_0?: number;
  /** Optional custom number */
  custom_number_1?: number;
  /** Optional custom number */
  custom_number_2?: number;
  /** Optional custom number */
  custom_number_3?: number;
  /** Optional custom number */
  custom_number_4?: number;

  /** Description of the product item (max 5000 chars, supports emoji) */
  description?: string;

  /** Expiration date in YYYY-MM-DD format */
  expiration_date?: string;

  /** Facebook product category for the item */
  fb_product_category?: string;

  /** Target gender */
  gender?: "female" | "male" | "unisex";

  /** Global Trade Item Number */
  gtin?: string;

  /** Required. URL of the product image */
  image_url: string;

  /** Importer address as a JSON object */
  importer_address?: Record<string, any>;

  /** Name of the product importer */
  importer_name?: string;

  /** Inventory count */
  inventory?: number;

  /** iOS app name for display */
  ios_app_name?: string;

  /** App Store ID */
  ios_app_store_id?: number;

  /** Custom scheme for iOS app */
  ios_url?: string;

  /** iPad app name for display */
  ipad_app_name?: string;

  /** iPad App Store ID */
  ipad_app_store_id?: number;

  /** Custom scheme for iPad app */
  ipad_url?: string;

  /** iPhone app name for display */
  iphone_app_name?: string;

  /** iPhone App Store ID */
  iphone_app_store_id?: number;

  /** Custom scheme for iPhone app */
  iphone_url?: string;

  /** Manufacturer information (name, address, etc.) */
  manufacturer_info?: string;

  /** Manufacturer part number */
  manufacturer_part_number?: string;

  /** Product launch visibility control */
  marked_for_product_launch?: "default" | "marked" | "not_marked";

  /** Material of the product (max 200 chars) */
  material?: string;

  /** Mobile-optimized external product page URL */
  mobile_link?: string;

  /** Required. Name or title of the product (supports emoji) */
  name: string;

  /** Ordering index within a group */
  ordering_index?: number;

  /** Country of origin (enum string) */
  origin_country?: string;

  /** Pattern of the product item */
  pattern?: string;

  /** Required. Price with 2 extra digits for cents (e.g., 599 = $5.99) */
  price: number;

  /** Product priority (for recommendation algorithms, etc.) */
  product_priority_1?: number;
  product_priority_2?: number;
  product_priority_3?: number;
  product_priority_4?: number;

  /** Retailer-defined product category (max 750 chars) */
  product_type?: string;

  /** Required. Unique identifier for this item/variant */
  retailer_id: string;

  /** Group ID this variant belongs to */
  retailer_product_group_id?: string;

  /** Number of days the item can be returned */
  return_policy_days?: number;

  /** Sale price (formatted like `price`) */
  sale_price?: number;

  /** Sale price end date (datetime string) */
  sale_price_end_date?: string;

  /** Sale price start date (datetime string) */
  sale_price_start_date?: string;

  /** Short description of the product */
  short_description?: string;

  /** Size of the product item */
  size?: string;

  /** Date when the product became available (YYYY-MM-DD) */
  start_date?: string;

  /** URL of the product item */
  url?: string;

  /** Visibility of the product (default: 'published') */
  visibility?: "staging" | "published";

  /** WhatsApp compliance category */
  wa_compliance_category?: "DEFAULT" | "COUNTRY_ORIGIN_EXEMPT";

  /** Windows Phone app store GUID */
  windows_phone_app_id?: string;

  /** Name of the Windows Phone app */
  windows_phone_app_name?: string;

  /** Custom scheme for the Windows Phone app */
  windows_phone_url?: string;
};
