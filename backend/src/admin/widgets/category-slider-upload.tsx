import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { createCategorySliderWidget } from "../components/category-slider-widget-base";

const CategorySliderUploadWidget = createCategorySliderWidget({
  title: "صور السلايدر للفئة",
  metadataKey: "category_slider_images",
  countKey: "category_slider_images_count",
  successMessage: "تم تحديث صور سلايدر الفئة بنجاح",
  errorMessage: "فشل تحديث صور سلايدر الفئة",
});

export const config = defineWidgetConfig({
  zone: "product_category.details.side.after",
});

export default CategorySliderUploadWidget;
