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

  // Extract primary slider images from store metadata
  const primarySliderImages = store.metadata?.slider_images || [];
  const primarySliderCount = store.metadata?.slider_images_count || 0;

  res.json({
    images: primarySliderImages,
    count: primarySliderCount,
  });
}
