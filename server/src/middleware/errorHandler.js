class AppError extends Error {
  constructor(message, status = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function notFoundHandler(req, res, next) {
  next(new AppError(`Route not found: ${req.method} ${req.originalUrl}`, 404, 'NOT_FOUND'));
}

function errorHandler(err, req, res, next) {
  let status = err.status || 500;
  let message = err.message || 'Something went wrong';
  let code = err.code || 'INTERNAL_ERROR';

  if (err.name === 'CastError') {
    status = 400;
    message = 'Invalid id provided';
    code = 'INVALID_ID';
  }
  if (err.name === 'ValidationError') {
    status = 422;
    message = Object.values(err.errors)[0]?.message || 'Validation failed';
    code = 'MONGO_VALIDATION';
  }
  if (err.code === 11000) {
    status = 409;
    message = 'A record with that value already exists';
    code = 'DUPLICATE_KEY';
  }

  console.error(`[error] ${status} ${code} — ${message}`, err.stack);
  return res.status(status).json({ error: message, code });
}

module.exports = { AppError, notFoundHandler, errorHandler };