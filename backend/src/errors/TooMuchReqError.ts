import { CustomError } from "./CustomError";

/**
 * Lỗi cho việc người dùng gửi quá nhiều yêu cầu trong một khoảng thời gian.
 * Tương ứng với mã trạng thái HTTP 429.
 */
export class TooMuchReqError extends CustomError {
  statusCode = 429;
  message: string;
  constructor(message?: string) {
    super(message || "Too many requests");
    Object.setPrototypeOf(this, TooMuchReqError.prototype);
    this.message = message || "Too many requests";
  }

  serializeErrors() {
    return [{ message: this.message }];
  }
}
