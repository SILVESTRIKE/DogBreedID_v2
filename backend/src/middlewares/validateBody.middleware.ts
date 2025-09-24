import { Request, Response, NextFunction } from "express";
import { ZodError, ZodObject } from "zod";
import { ValidationError } from "../errors/ValidationError";

/**
 * Middleware to validate request data against a Zod schema.
 *
 * @param schema - The Zod schema to validate against.
 * @param type - The type of request data to validate (body, query, params).
 * @param path - Optional path to a specific property in the request data.
 */

export const validateData = (
  schema: ZodObject<any, any>,
  type: "body" | "query" | "params",
  path?: string
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = path ? req[type][path] : req[type];
      schema.parse(dataToValidate);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        next(new ValidationError(error.issues));
      }
      next(error);
    }
  };
};
