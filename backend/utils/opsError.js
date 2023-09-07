class OpsError extends Error {
  constructor(message, statusCode) {
    super(message);

    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    this.isOperational = true; //ony for operational errors only not library bug

    Error.captureStackTrace(this, this.constructor);
  }
}

/* const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode ? res.statusCode : 500;
  res.status(statusCode);

  res.json({
    message: err.message,
    stack: process.env.MODE_ENV === "development" ? err.stack : null,
  });
}; */

module.exports = OpsError;
