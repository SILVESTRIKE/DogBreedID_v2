import { z } from "zod";

export const productZodSchema = z.object({
  name: z
    .string()
    .min(3, { message: "Tên sản phẩm phải có ít nhất 3 ký tự." })
    .max(100, { message: "Tên sản phẩm không được vượt quá 100 ký tự." }),
  quantity: z
    .number()
    .int({ message: "Số lượng phải là số nguyên." })
    .min(0, { message: "Số lượng không được nhỏ hơn 0." }),
  slug: z.string().regex(/^[a-z0-9-]+$/, {
    message:
      "Slug chỉ được chứa chữ cái thường (a-z), số (0-9) và dấu gạch ngang (-).",
  }),
  price: z.number().min(0, { message: "Giá không được nhỏ hơn 0." }),
  description: z
    .string()
    .max(500, { message: "Mô tả không được vượt quá 500 ký tự." })
    .optional(),
});

export type ProductZodType = z.infer<typeof productZodSchema>;
