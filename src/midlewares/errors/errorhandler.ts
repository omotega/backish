import { AppError } from "../../utils/errors";
import { Response } from "express";
import httpStatus from "http-status";
class ErrorHandler {
  private isTrustedError(error: Error): boolean {
    if (error instanceof AppError) {
      return error.isOperational;
    }

    return false;
  }
  private handleTrustedError(error: AppError, response: Response): void {
    response.status(error.httpCode).json({ message: error.message });
  }
  public handleError(error: Error | AppError, response?: Response): void {
    if (this.isTrustedError(error) && response) {
      this.handleTrustedError(error as AppError, response);
    } else {
      this.handleCriticalError(error, response);
    }
  }
  private handleCriticalError(
    error: Error | AppError,
    response?: Response
  ): void {
    if (response) {
      response
        .status(httpStatus.INTERNAL_SERVER_ERROR)
        .json({ message: "Internal server error" });
    }

    console.log("Application encountered a critical error. Exiting");
    process.exit(1);
  }
}

export const errorHandler = new ErrorHandler();
