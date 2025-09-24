import { CustomError } from './CustomError'; 

export class NotFoundError extends CustomError {
    statusCode = 404; // 404

    constructor(public message: string = 'Not found.') {
        super(message);
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
    serializeErrors() {
        return [{ message: this.message }];
    }
}