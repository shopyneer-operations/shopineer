import { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FileType, FileUpload } from "./file-upload";
import { Form } from "./form";
import { Input } from "@medusajs/ui";
import { Trash } from "@medusajs/icons";

export const SliderItemSchema = z.object({
  id: z.string().optional(),
  url: z.string(),
  file: z.any().nullable(), // File
  link: z.string().optional(),
});

export type SliderItem = z.infer<typeof SliderItemSchema>;

const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/svg+xml"];

const SUPPORTED_FORMATS_FILE_EXTENSIONS = [".jpeg", ".png", ".gif", ".webp", ".heic", ".svg"];

export const SliderItemForm = ({
  form,
  append,
  showHint = true,
  multiple = true,
}: {
  form: UseFormReturn<any>;
  append: (value: SliderItem) => void;
  showHint?: boolean;
  multiple?: boolean;
}) => {
  const hasInvalidFiles = useCallback(
    (fileList: FileType[]) => {
      const invalidFile = fileList.find((f) => !SUPPORTED_FORMATS.includes(f.file.type));

      if (invalidFile) {
        form.setError("media", {
          type: "invalid_file",
          message: `Invalid file type: ${
            invalidFile.file.name
          }. Supported types are: ${SUPPORTED_FORMATS_FILE_EXTENSIONS.join(", ")}`,
        });

        return true;
      }

      return false;
    },
    [form]
  );

  const onUploaded = useCallback(
    (files: FileType[]) => {
      form.clearErrors("media");
      if (hasInvalidFiles(files)) {
        return;
      }

      files.forEach((file) => {
        append({
          url: file.url,
          file: file.file,
          link: "",
        });
      });
    },
    [form, append, hasInvalidFiles]
  );

  return (
    <Form.Field
      control={form.control as UseFormReturn<any>["control"]}
      name="media"
      render={() => {
        return (
          <Form.Item>
            <div className="flex flex-col gap-y-2">
              <div className="flex flex-col gap-y-1">
                <Form.Label optional>الصورة</Form.Label>
              </div>
              <Form.Control>
                <FileUpload
                  label={"رفع الصورة"}
                  hint={"قم بتحميل الصور أو إسقاطها"}
                  hasError={!!form.formState.errors.media}
                  formats={SUPPORTED_FORMATS}
                  onUploaded={onUploaded}
                  multiple={multiple}
                />
              </Form.Control>
              <Form.ErrorMessage />
            </div>
          </Form.Item>
        );
      }}
    />
  );
};

export const SliderItemDisplay = ({
  item,
  index,
  onRemove,
  onUpdateLink,
}: {
  item: SliderItem;
  index: number;
  onRemove: () => void;
  onUpdateLink: (link: string) => void;
}) => {
  return (
    <div className="relative group">
      <img src={item.url} alt={`Slider image ${index + 1}`} className="w-full h-24 object-cover rounded-md" />
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200">
        <button
          type="button"
          onClick={onRemove}
          className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Trash className="w-4 h-4" />
        </button>
      </div>
      <div className="mt-2">
        <Input
          placeholder="رابط السلايدر (اختياري)"
          value={item.link || ""}
          onChange={(e) => onUpdateLink(e.target.value)}
          className="text-sm"
        />
      </div>
    </div>
  );
};
