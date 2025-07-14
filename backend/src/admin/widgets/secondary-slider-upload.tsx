import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { createSliderWidget } from "../components/slider-widget-base";

const SecondarySliderUploadWidget = createSliderWidget({
  title: "صور السلايدر الثانوي للصفحة الرئيسية",
  metadataKey: "secondary_slider_images",
  countKey: "secondary_slider_images_count",
  successMessage: "تم تحديث صور السلايدر الثانوي بنجاح",
  errorMessage: "فشل تحديث صور السلايدر الثانوي",
});

export const config = defineWidgetConfig({
  zone: "store.details.after",
});

export default SecondarySliderUploadWidget;
