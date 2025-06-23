import { MedusaRequest, MedusaResponse } from "@medusajs/framework";

export async function GET(req: MedusaRequest, res: MedusaResponse) {
  const query = req.scope.resolve("query");

  // Get the store to access its metadata
  const {
    data: [store],
  } = await query.graph({
    entity: "store",
    fields: ["id", "metadata"],
  });

  if (!store) {
    return res.status(404).json({
      message: "Store not found",
    });
  }

  // Extract secondary slider images from store metadata
  const secondarySliderImages = store.metadata?.secondary_slider_images || [];
  const secondarySliderCount = store.metadata?.secondary_slider_images_count || 0;

  res.json({
    images: secondarySliderImages,
    count: secondarySliderCount,
  });
}
