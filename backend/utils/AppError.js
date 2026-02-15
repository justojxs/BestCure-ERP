/**
 * Custom application error class.
 * Extends native Error to include HTTP status codes and operational flags.
 * Operational errors (expected) are distinguished from programming errors (unexpected).
 */
class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message
   * @param {number} statusCode - HTTP status code (4xx = client error, 5xx = server error)
   */
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default AppError;
