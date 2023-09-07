const OpsError = require("../utils/opsError");

/* module.exports = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
  next();
}; */

//Transform mongodb errors to operational erros
const handleCastErrorDB = (err) => {
  const message = `Invalid ${err.path}: ${err.value}.`;
  return new OpsError(message, 400);
};

const handleDuplicateErrorDB = (err) => {
  const value = err.keyValue.name;

  //console.log(err.keyValue.name, "....................")
  const message = `Duplicate field value: "${value}". Please use another another value.`;
  return new OpsError(message, 400);
};

const handleValidationErrorDB = (err) => {
  //console.log(err)
  const errors = Object.values(err.errors).map((el) => el.message);
  const message = `Invalid input data: ${errors.join(". ")}`;
  return new OpsError(message, 400);
};

const handleJWTError = () =>
  new OpsError("Invalid token. Please login to access the target site", 401); //unathorize

const handleTokenExpiredError = () =>
  new OpsError("Your token has expired. Please login again.", 401);

const sendErrorDev = (err, res) => {
  res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack,
  });
};

const sendErrorProd = (err, res) => {
  //Operational Error
  if (err.isOperational) {
    res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
    });

    // Programming or Other Unknown Error
  } else {
    console.error(`Error 💥 ${err} 💥`);
    res.status(500).json({
      status: "error",
      message: "Something went very wrong!!!",
    });
  }
};

module.exports = (err, req, res, next) => {
  //console.log(err.stack)
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  if (process.env.NODE_ENV === "development") {
    return sendErrorDev(err, res);
  } else if (process.env.NODE_ENV === "production ") {
    //Note the gap after "production " is intentional
    let error = { ...err }; //destructure err
    if (error.name === "CastError") error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateErrorDB(error);
    if (error.errors) error = handleValidationErrorDB(error);
    if (error.name === "JsonWebTokenError") error = handleJWTError();
    if (error.name === "TokenExpiredError") error = handleTokenExpiredError();

    sendErrorProd(error, res);
  }
  next();
};
