import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { createSliderWidget } from "../components/slider-widget-base";

const SliderUploadWidget = createSliderWidget({
  title: "صور السلايدر للصفحة الرئيسية",
  metadataKey: "slider_images",
  countKey: "slider_images_count",
  successMessage: "تم تحديث صور السلايدر بنجاح",
  errorMessage: "فشل تحديث صور السلايدر",
});

export const config = defineWidgetConfig({
  zone: "store.details.after",
});

export default SliderUploadWidget;
