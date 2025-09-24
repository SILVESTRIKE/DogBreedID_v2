import { CustomError } from "./CustomError";

export class ValidationError extends CustomError {
    statusCode: number = 400;
    message: string = "Validation Error";
    constructor(private issues: any[]) {
        super("Validation Error");
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
    serializeErrors(): { message: string; field?: string; }[] {
        return this.issues.map(issue => {
            (`Validation Error: ${issue.message} at ${issue.path.join('.')}`);
            
            return { message: issue.message, field: issue.path[0] };
        });
    }

}