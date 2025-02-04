import { defineWidgetConfig } from "@medusajs/admin-sdk";
import { AdminProduct, AdminProductVariant, DetailWidgetProps } from "@medusajs/framework/types";
import { Button, Container, Drawer, Heading, Label, Textarea } from "@medusajs/ui";
import { Media, MediaSchema } from "../components/upload-media-form-item";
import { ActionMenu } from "../components/action-menu";
import { PencilSquare } from "@medusajs/icons";
import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import * as zod from "zod";
import { sdk } from "../lib/sdk";

export type VariantImage = {
  url: string | undefined;
};

const schema = zod.object({
  images: zod.array(MediaSchema).optional(),
});

export const Image = ({ image }: { image: { url: string | undefined } }) => (
  <img
    src={image.url}
    alt="Uploaded image"
    className="object-cover aspect-square w-full h-full bg-clip-border rounded-md"
  />
);

const VariantsImagesModal = ({ variant, open, onClose, product, type, settings, notify }: Props) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const form = useForm<MediaFormWrapper>({
    defaultValues: getDefaultValues(product, variant, type),
  });
  const [imageArr, setImageArr] = useState<ImageType[]>([]); //! When removing an image, it resets to the default structure
  const [variants, setVariants] = useState<AdminProductVariant[] | AdminProductVariant>(variant);

  const {
    formState: { isDirty },
    handleSubmit,
    reset,
  } = form;

  useEffect(() => {
    reset(getDefaultValues(product, variant, type));
    setImageArr(
      getDefaultValues(product, variant, type)
        .media.images.filter((i) => i.info.selected)
        .sort((a, b) => a.info.selectedNumber - b.info.selectedNumber)
    );
  }, [reset, product, variant, type]);

  useEffect(() => {
    if (settings.baseOptionUpload.enabled) {
      const _variants = product.variants?.filter(
        (v) =>
          v.options?.find((o) => o.option_id === settings.baseOptionUpload.option)?.value ===
          variant.options?.find((o) => o.option_id === settings.baseOptionUpload.option)?.value
      );

      if (_variants?.length) setVariants(_variants);
    }
  }, []);

  const onReset = () => {
    reset(getDefaultValues(product, variant, type));
    onClose();
  };

  const onSubmit = handleSubmit(async (data: any) => {
    setIsUpdating(true);
    let preppedImages: FormImage[] = [];

    try {
      preppedImages = await prepareImages(data.media.images);
    } catch (error) {
      notify.error("Error", { description: "Something went wrong while trying to upload images." });
      console.error("Something went wrong while trying to upload images.");
      return;
    }

    const urls = preppedImages.map((image) => ({ url: image.url }));
    await fetchBackend(`/admin/products/${product.id}`, { body: { images: urls }, method: "POST" });

    let updatedVariantList: AdminProductVariant[] | undefined;
    if (type === "thumbnail") {
      const thumbnail =
        data.media.images.find((image: { info: { selected: any } }) => image.info.selected)?.url || null;

      if (Array.isArray(variants)) {
        await fetchBackend(`/admin/products/${product.id}/variants/batch`, {
          body: {
            update: variants.map((v) => ({
              id: v.id,
              metadata: { ...v.metadata, thumbnail },
            })),
          },
          method: "POST",
        });

        updatedVariantList = await fetchBackend(`/admin/products/${product.id}/variants?order=title`).then(
          (res) => res?.variants
        );
      } else
        updatedVariantList = await fetchBackend(`/admin/products/${product.id}/variants/${variants.id}`, {
          body: {
            metadata: {
              ...variants.metadata,
              thumbnail,
            },
          },
          method: "POST",
        }).then((res) => res?.product?.variants?.sort?.(sortByTitle));
    } else {
      const images = data.media.images
        .map(({ info: { selected } }: { info: { selected: any } }, i: number) => selected && urls[i])
        .filter(Boolean)
        .sort(
          (a: any, b: any) => imageArr.findIndex((i) => a.url === i.url) - imageArr.findIndex((i) => b.url === i.url)
        );

      if (Array.isArray(variants)) {
        await fetchBackend(`/admin/products/${product.id}/variants/batch`, {
          body: {
            update: variants.map((v) => ({
              id: v.id,
              metadata: { ...v.metadata, images },
            })),
          },
          method: "POST",
        });

        updatedVariantList = await fetchBackend(`/admin/products/${product.id}/variants?order=title`).then(
          (res) => res?.variants
        );
      } else {
        updatedVariantList = await fetchBackend(`/admin/products/${product.id}/variants/${variants.id}`, {
          body: {
            metadata: {
              ...variants.metadata,
              images,
            },
          },
          method: "POST",
        }).then((res) => res?.product?.variants?.sort?.(sortByTitle));
      }
    }

    onClose({ ...product, variants: updatedVariantList || null });
    setIsUpdating(false);
  });

  return (
    <FocusModal open={open} onOpenChange={onReset} modal>
      <FocusModal.Content aria-describedby={undefined}>
        <FocusModal.Title asChild>
          <h2 className="sr-only">Variant Images</h2>
        </FocusModal.Title>
        <FocusModal.Header>
          <Button variant="primary" type="submit" disabled={!isDirty} isLoading={isUpdating} form="variant-images-form">
            Save and close
          </Button>
        </FocusModal.Header>
        <FocusModal.Body>
          <form onSubmit={onSubmit} id="variant-images-form" className="h-full w-full">
            <VariantsImagesMediaForm
              form={nestedForm(form, "media")}
              type={type}
              setImageArr={setImageArr}
              imageArr={imageArr}
            />
          </form>
        </FocusModal.Body>
      </FocusModal.Content>
    </FocusModal>
  );
};

const getDefaultValues = (
  product: AdminProduct,
  variant: AdminProductVariant,
  type: "thumbnail" | "media"
): MediaFormWrapper => {
  const images =
    product?.images?.map((image) => {
      const isSelected =
        type === "thumbnail"
          ? // @ts-ignore
            variant?.metadata?.thumbnail === image.url
          : // @ts-ignore
            variant?.metadata?.images?.some((vImage: any) => vImage.url === image.url) ?? false;

      const selectedNumber =
        type === "media" &&
        // @ts-ignore
        variant?.metadata?.images?.findIndex((vImage: any) => vImage.url === image.url);

      return {
        url: image.url,
        info: {
          selectedNumber: (isSelected && selectedNumber + 1) || -1,
          selected: isSelected,
        },
      };
    }) || [];

  return {
    media: {
      images,
    },
  };
};

const EditForm = ({
  open,
  onOpenChange,
  variant,
  onSubmitSuccess,
}: {
  open: boolean;
  onOpenChange(oprn: boolean): void;
  variant: AdminProductVariant;
  onSubmitSuccess?: () => void;
}) => {
  const variantImages: VariantImage[] = (variant.metadata?.images as VariantImage[]) || [];
  const variantThumbnail = variant.metadata?.thumbnail as string | undefined;

  const form = useForm<Zod.infer<typeof schema>>({
    defaultValues: {
      images: (variant.metadata?.images as Media[]) || [],
    },
  });

  //   const handleSubmit = form.handleSubmit(async ({ images }) => {
  //     try {

  //       const result = await sdk.admin.productVariant.(product.id, { metadata: { how_to_use: steps } } as any);

  //       // Show success toast
  //       toast.success("How-to-use updated", {
  //         description: `Successfully updated How-to-use for product: ${product.handle}`,
  //       });

  //       onOpenChange(false);
  //       if (onSubmitSuccess) onSubmitSuccess();
  //       return result;
  //     } catch (error: any) {
  //       toast.error("How-to-use update failed", { description: error.message });
  //     }
  //   });

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <Drawer.Content>
        <FormProvider {...form}>
          <form
            //   onSubmit={handleSubmit}
            className="flex flex-1 flex-col overflow-hidden"
          >
            <Drawer.Header>
              <Heading className="capitalize">View Variant Images</Heading>
            </Drawer.Header>
            <Drawer.Body className="divide-y p-0 overflow-y-auto no-scrollbar">
              <div className="px-6 py-4 flex flex-col gap-y-2">
                <Heading level="h3">Thumbnail</Heading>
                <div className="grid grid-cols-[repeat(auto-fill,minmax(125px,1fr))] gap-3">
                  {variantThumbnail ? (
                    <Image image={{ url: variantThumbnail }} />
                  ) : (
                    <div className="w-full h-full aspect-square break-words text-ui-fg-muted text-[14px] text-center border rounded-md border-ui-border-strong border-dashed p-[15%] flex justify-center items-center">
                      No thumbnail
                    </div>
                  )}
                </div>
              </div>
              <div className="px-6 py-4 flex flex-col gap-y-2">
                <Heading level="h3">
                  Images <span className="text-ui-fg-muted text-sm">({variantImages.length})</span>
                </Heading>
                <div className="grid h-fit auto-rows-auto grid-cols-[repeat(auto-fill,minmax(125px,1fr))] gap-3">
                  {variantImages.map((image, i) => (
                    <Image key={i} image={image} />
                  ))}
                </div>
              </div>
            </Drawer.Body>
            <Drawer.Footer>
              <div className="flex items-center justify-end gap-x-2">
                <Drawer.Close asChild>
                  <Button size="small" variant="secondary">
                    Cancel
                  </Button>
                </Drawer.Close>
                <Button size="small" type="submit">
                  Save
                </Button>
              </div>
            </Drawer.Footer>
          </form>
        </FormProvider>
      </Drawer.Content>
    </Drawer>
  );
};

const VariantImagesWidget = ({ data }: DetailWidgetProps<AdminProductVariant>) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Container className="divide-y p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Variant Images</Heading>

        <ActionMenu
          groups={[
            {
              actions: [
                {
                  icon: <PencilSquare />,
                  label: "Edit",
                  onClick() {
                    setIsOpen(true);
                  },
                },
              ],
            },
          ]}
        />
      </div>

      {(data.metadata?.images as Media[])?.map((image) => {
        return (
          <div key={image.id} className="txt-small text-ui-fg-subtle flex justify-between px-6 py-4">
            <img src={image.url} alt="" className="w-16 h-16" />
          </div>
        );
      })}

      <EditForm open={isOpen} onOpenChange={setIsOpen} variant={data} />
    </Container>
  );
};

// The widget's configurations
export const config = defineWidgetConfig({
  zone: "product_variant.details.after",
});

export default VariantImagesWidget;
