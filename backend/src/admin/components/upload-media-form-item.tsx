import { useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { z } from "zod";
import { FileType, FileUpload } from "./file-upload";
import { Form } from "./form";

export const MediaSchema = z.object({
  id: z.string().optional(),
  url: z.string(),
  file: z.any().nullable(), // File
});

export type Media = z.infer<typeof MediaSchema>;

const SUPPORTED_FORMATS = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/heic", "image/svg+xml"];

const SUPPORTED_FORMATS_FILE_EXTENSIONS = [".jpeg", ".png", ".gif", ".webp", ".heic", ".svg"];

export const UploadMediaFormItem = ({
  form,
  append,
  showHint = true,
  multiple = true,
}: {
  form: UseFormReturn<any>;
  append: (value: Media) => void;
  showHint?: boolean;
  multiple?: boolean;
}) => {
  // const { t } = useTranslation();

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

      files.forEach(append);
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
                <Form.Label optional>Image</Form.Label>
                {/* {showHint && <Form.Hint>Drag and drop images here or click to upload</Form.Hint>} */}
              </div>
              <Form.Control>
                <FileUpload
                  label={"Upload Image"}
                  hint={"Drag and drop images here or click to upload"}
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
