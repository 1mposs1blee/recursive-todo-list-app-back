const errorMessageList = {
  400: "Bad Request",
  401: "Unauthorized",
  403: "Forbidden",
  404: "Not found",
  409: "Conflict",
};

const HttpError = (status, message = errorMessageList[status]) => {
  const err = new Error();

  err.status = status;
  err.message = message;

  return err;
};

module.exports = HttpError;
