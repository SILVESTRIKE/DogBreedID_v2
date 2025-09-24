import { z } from "zod";
import { GetByIdParamsSchema as MediaGetByIdParamsSchema } from "./medias.zod";

export const GetHistoryByIdParamsSchema = MediaGetByIdParamsSchema;

export const GetPredictionHistoryQuerySchema = z.object({
  query: z.object({
    page: z.coerce.number().int().positive().optional().default(1),
    limit: z.coerce.number().int().positive().optional().default(20),
  }),
});
