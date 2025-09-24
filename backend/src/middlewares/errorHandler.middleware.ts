import { Request, Response, NextFunction } from "express";
import { CustomError } from "../errors/CustomError";

export const errorHandlerMiddleware = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error(err);
  if (err instanceof CustomError) {
    return res.status(err.statusCode).send({
      success: false,
      errors: err.serializeErrors(),
    });
  }

  res.status(500).send({
    success: false,
    errors: [{ message: "Something went wrong" }],
  });
};
