import { Request, Response, NextFunction } from "express";
import { z, ZodError, ZodIssue } from "zod";

const validateRequestMiddleware =
  (schema: z.ZodTypeAny) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Dữ liệu đầu vào không hợp lệ.",

          errors: error.issues.map((e: ZodIssue) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }
      next(error);
    }
  };

export default validateRequestMiddleware;
