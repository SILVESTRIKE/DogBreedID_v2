import { CustomError } from "./CustomError";

export class AppError extends CustomError {
  statusCode = 500;
  message: string;
  constructor(message?: string) {
    super(message || "App crashed!");
    Object.setPrototypeOf(this, AppError.prototype);
    this.message = message || "App crashed!";
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
