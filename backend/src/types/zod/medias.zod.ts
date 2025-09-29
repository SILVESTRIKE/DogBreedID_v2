import { z } from "zod";
import { objectIdSchema } from "./user.zod";

// Schema này không dùng trực tiếp cho route, mà dùng cho service sau khi upload
export const MediaDbZodSchema = z.object({
  name: z.string(),
  mediaPath: z.string(),
  description: z.string().nullable().optional(),
  type: z.string().nullable().optional(),
  // creator_id may be a MongoDB ObjectId or string; accept any and validate in service
  creator_id: z.any(),
  directory_id: objectIdSchema,
});
export type MediaDbZodType = z.infer<typeof MediaDbZodSchema>;

export const UpdateMediaInfoZodSchema = z
  .object({
    name: z.string().min(1, "Tên không được để trống").optional(),
    description: z.string().nullable().optional(),
  })
  .strict();

export const CreateDirectoryZodSchema = z
  .object({
    name: z.string().min(1, "Tên thư mục không được để trống"),
    parent_id: z.string().nullable().optional(),
  })
  .strict();
export type CreateDirectoryZodType = z.infer<typeof CreateDirectoryZodSchema>;

// Schema để validate `:id` trong URL (params)
export const GetByIdParamsSchema = z.object({
  id: z.string().transform((val, ctx) => {
    const parsed = parseInt(val, 10);
    if (isNaN(parsed)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ID phải là một chuỗi số hợp lệ.",
      });
      return z.NEVER;
    }
    return parsed;
  }),
});

// Schema để validate query string cho việc lấy danh sách media
export const GetMediasQuerySchema = z.object({
  page: z.string().optional().default("1").transform(Number),
  limit: z.string().optional().default("50").transform(Number),
  search: z.string().optional(),
  type: z.string().optional(),
  directory_id: objectIdSchema.optional(),
});
