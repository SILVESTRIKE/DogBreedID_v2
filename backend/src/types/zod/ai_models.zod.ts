import { z } from "zod";

// --- Định nghĩa các ENUM để tái sử dụng ---
const ModelTaskEnum = z.enum([
  "DOG_BREED_CLASSIFICATION",
  "CAT_BREED_CLASSIFICATION",
  "OBJECT_DETECTION",
]);
const ModelFormatEnum = z.enum(["ONNX", "TENSORFLOW_JS", "PYTORCH"]);
const ModelStatusEnum = z.enum(["ACTIVE", "INACTIVE", "ARCHIVED"]);

// --- Schema để validate body của request TẠO MỚI model ---
export const CreateAIModelSchema = z.object({
  body: z.object({
    name: z.string().min(3, "Tên model phải có ít nhất 3 ký tự."),
    description: z.string().optional(),
    taskType: ModelTaskEnum,
    format: ModelFormatEnum,
    huggingFaceRepo: z.string().min(1, "Hugging Face repo là bắt buộc."),
    fileName: z.string().min(1, "Tên file là bắt buộc."),
    labelsFileName: z.string().optional().default("labels.json"),
    version: z.string().min(1, "Version là bắt buộc."),
    status: ModelStatusEnum.optional().default("INACTIVE"),
    tags: z.array(z.string()).optional(),
  }),
});

// Suy luận ra kiểu TypeScript để sử dụng trong service
export type CreateAIModelType = z.infer<typeof CreateAIModelSchema.shape.body>;

// --- Schema để validate body của request CẬP NHẬT model ---
// Sử dụng .partial() để cho phép cập nhật một hoặc nhiều trường
export const UpdateAIModelSchema = z.object({
  body: CreateAIModelSchema.shape.body.partial(),
});

// Suy luận ra kiểu TypeScript cho việc cập nhật
export type UpdateAIModelType = z.infer<typeof UpdateAIModelSchema.shape.body>;
