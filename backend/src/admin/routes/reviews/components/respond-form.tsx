import { z } from "zod";
import { Review } from "../../../lib/types/review";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sdk } from "../../../lib/sdk";
import { Button, Drawer, Heading, Input, Label, toast, Toaster } from "@medusajs/ui";

const respondFormSchema = z.object({
  text: z.string(),
});

export const RespondForm = ({
  review,
  onSubmit,
  isOpen,
  setIsOpen,
}: {
  review: Review & { response?: { text: string } };
  onSubmit: Function;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}) => {
  const form = useForm<z.infer<typeof respondFormSchema>>({
    defaultValues: {
      text: review.response?.text || "",
    },
    resolver: zodResolver(respondFormSchema as any),
  });

  const handleSubmit = form.handleSubmit(async (data) => {
    try {
      const result = await sdk.client.fetch<Review>(`/admin/reviews/${review.id}/respond`, {
        method: "POST",
        body: data,
      });
      onSubmit();
      setIsOpen(false);

      // Show success toast
      toast.success("تم إضافة الرد", { description: `تم إضافة الرد بنجاح: ${data.text}` });

      return result;
    } catch (error: any) {
      toast.error("فشل إضافة الرد", { description: `فشل إضافة الرد: ${error.message}` });
    }
  });

  return (
    <>
      <Toaster />

      <Drawer open={isOpen} onOpenChange={setIsOpen}>
        <Drawer.Content>
          <FormProvider {...form}>
            <form onSubmit={handleSubmit} className="flex h-full flex-col overflow-visible">
              <Drawer.Header>
                <Heading className="capitalize">تحديث الرد</Heading>
              </Drawer.Header>
              <Drawer.Body className="flex max-w-full flex-1 flex-col gap-y-8 overflow-y-auto">
                <div>
                  <Controller
                    control={form.control}
                    name="text"
                    render={({ field }) => {
                      return (
                        <div className="flex-1 flex flex-col space-y-2">
                          <div className="flex items-center gap-x-1">
                            <Label size="small" weight="plus">
                              الرد
                            </Label>
                          </div>
                          <Input {...field} />
                        </div>
                      );
                    }}
                  />
                </div>
              </Drawer.Body>

              <Drawer.Footer>
                <div className="flex items-center justify-end gap-x-2">
                  <Drawer.Close asChild>
                    <Button size="small" variant="secondary">
                      إلغاء
                    </Button>
                  </Drawer.Close>
                  <Button size="small" type="submit">
                    حفظ
                  </Button>
                </div>
              </Drawer.Footer>
            </form>
          </FormProvider>
        </Drawer.Content>
      </Drawer>
    </>
  );
};
