import { useState } from "react";
import { Button, DropdownMenu, Heading, Table, toast, Toaster, Tooltip } from "@medusajs/ui";
import { AdminProduct, AdminProductVariant, DetailWidgetProps } from "@medusajs/framework/types";
import { EllipsisHorizontal, PencilSquare, ThumbnailBadge } from "@medusajs/icons";
import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { omit } from "lodash";
import { fetchBackend, paginationInformation } from "../components/variant-images-widget/utils/util";
import ViewImagesModal from "../components/variant-images-widget/view-images-modal";
import VariantsImagesModal from "../components/variant-images-widget/variant-images-modal";
import useSWR from "swr";

export type VariantImage = {
  url: string | undefined;
};

type BaseOptionUpload = {
  enabled?: boolean;
  option?: string;
};

type UpdateData = {
  variants?: boolean;
  // options?: boolean;
  product?: boolean;
};

export type WidgetSettings = {
  baseOptionUpload: BaseOptionUpload;
};

const VariantsImagesWidget = ({ data }: DetailWidgetProps<AdminProduct>) => {
  const [openedVariant, setOpenedVariant] = useState<AdminProductVariant | null>(null);
  const [openedDialogType, setOpenedDialogType] = useState<"media" | "thumbnail" | null>(null);

  const [product, setProduct] = useState<AdminProduct>(data);

  const { mutate } = useSWR(
    ["product", product.id],
    async function updateData({ variants = true, product: _product = false }: UpdateData) {
      if (variants) {
        await fetchBackend(`/admin/products/${product.id}/variants?order=title`).then((res) => {
          if (!res) return;

          setProduct((prevProd) => ({ ...prevProd, variants: res.variants }));
        });
      }

      if (_product) {
        await fetchBackend(`/admin/products/${product.id}?fields=-variants`).then((res) => {
          if (!res) return;

          setProduct((prevProd) => ({ ...prevProd, ...res.product }));
        });
      }
    }
  );

  const handleClose = (_product?: AdminProduct) => {
    setOpenedVariant(null);
    setOpenedDialogType(null);

    if (_product) setProduct(_product);
  };

  const paginationOptions = paginationInformation(product.variants);
  const { currentVariants } = paginationOptions;

  return (
    <>
      <Toaster />
      <div className="shadow-elevation-card-rest bg-ui-bg-base w-full rounded-lg divide-y p-0">
        <div className="flex flex-row justify-between items-center px-6 py-4">
          <Heading level="h1" className="flex items-center justify-between gap-x-4 ">
            <div>Variants Images</div>
          </Heading>
        </div>

        <div className="grid grid-cols-[repeat(auto-fill,minmax(225px,1fr))] gap-3 px-6 py-4">
          {currentVariants?.map((variant) => {
            const variantImages: VariantImage[] | undefined = variant.metadata?.images as VariantImage[] | undefined;

            const variantThumbnail: string | undefined = variant.metadata?.thumbnail as string | undefined;

            return (
              <div key={variant.id} className="w-full p-3 bg-ui-bg-component border rounded-md flex flex-col">
                <div className="flex items-center mb-3 bg-ui-bg-base rounded-full text-center relative py-[1.5px]">
                  <div className="inter-base-semibold flex-1">{variant.title}</div>
                  <DropdownMenu>
                    <DropdownMenu.Trigger asChild>
                      <Button variant="transparent" className="rounded-full absolute right-0 top-0">
                        <EllipsisHorizontal />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        onClick={() => {
                          setOpenedVariant(variant);
                          setOpenedDialogType("thumbnail");
                        }}
                        className="gap-x-2"
                      >
                        <PencilSquare className="text-ui-fg-subtle" />
                        تعديل الصورة الرئيسية
                      </DropdownMenu.Item>
                      <DropdownMenu.Item
                        onClick={() => {
                          setOpenedVariant(variant);
                          setOpenedDialogType("media");
                        }}
                        className="gap-x-2"
                      >
                        <PencilSquare className="text-ui-fg-subtle" />
                        تعديل الصور
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu>
                </div>
                <div className="grid grid-cols-2 grid-rows-2 items-center gap-3 h-full w-full">
                  {variantThumbnail ? (
                    <div className="relative w-full h-full">
                      <img
                        src={variantThumbnail}
                        alt="Thumbnail"
                        className="object-cover bg-clip-border w-full h-full rounded-md aspect-square"
                      />

                      <Tooltip content="Thumbnail">
                        <ThumbnailBadge className="absolute top-2 left-2" />
                      </Tooltip>
                    </div>
                  ) : (
                    <div className="w-full h-full aspect-square break-words text-ui-fg-muted text-[14px] text-center border rounded-md border-ui-border-strong border-dashed p-[15%] flex justify-center items-center">
                      لا يوجد صورة رئيسية
                    </div>
                  )}

                  {variantImages?.length
                    ? variantImages.length === 3
                      ? variantImages.map(
                          (
                            image: {
                              url: string | undefined;
                            },
                            i
                          ) => <Image image={image} key={i} />
                        )
                      : variantImages.slice(0, 3).map(
                          (
                            image: {
                              url: string | undefined;
                            },
                            i
                          ) => (
                            <div key={i} className="w-full h-full relative">
                              <Image image={image} />

                              {i === 2 && (
                                <ViewImagesModal variantImages={variantImages} variantThumbnail={variantThumbnail} />
                              )}
                            </div>
                          )
                        )
                    : Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="w-full h-full aspect-square break-words text-ui-fg-muted text-[14px] text-center border rounded-md border-ui-border-strong border-dashed p-[20%] flex justify-center items-center"
                        >
                          لا يوجد صور
                        </div>
                      ))}
                </div>
              </div>
            );
          })}
        </div>

        <div>
          <Table.Pagination count={product.variants?.length || 0} {...omit(paginationOptions, "currentVariants")} />
        </div>
      </div>

      {openedDialogType && (
        <VariantsImagesModal
          product={product}
          variant={openedVariant!}
          open={!!openedVariant}
          onClose={handleClose}
          type={openedDialogType}
          notify={toast}
        />
      )}
    </>
  );
};

export const Image = ({ image }: { image: { url: string | undefined } }) => (
  <img
    src={image.url}
    alt="Uploaded image"
    className="object-cover aspect-square w-full h-full bg-clip-border rounded-md"
  />
);

export const config = defineWidgetConfig({
  zone: "product.details.after",
});

export default VariantsImagesWidget;
