import { ApiError } from '../utils/ApiError.js';

export const errorHandler = (err, req, res, next) => {
  const isDev = process.env.NODE_ENV === 'development';
  let statusCode = typeof err.statusCode === 'number' ? err.statusCode : 500;
  let message = err.message || 'Internal Server Error';
  let errors = err.errors || [];

  // Prisma unique constraint violation
  if (err.code === 'P2002') {
    statusCode = 409;
    const field = err.meta?.target?.join(', ') || 'field';
    message = `Duplicate value for ${field}`;
  }

  // Prisma record not found
  if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // Joi validation errors
  if (err.isJoi) {
    statusCode = 400;
    message = 'Validation Error';
    errors = err.details.map((d) => ({
      field: d.path.join('.'),
      message: d.message,
    }));
  }

  // Multer errors
  if (err.code === 'LIMIT_FILE_SIZE' || err.code === 'LIMIT_FILE_COUNT') {
    statusCode = 400;
  }

  // In production, never leak internal error details for 500s
  if (!isDev && statusCode >= 500) {
    message = 'Internal Server Error';
    errors = [];
  }

  if (isDev) {
    console.error('ERROR:', err);
  } else if (statusCode >= 500) {
    // Log 500s in production too (without leaking to client)
    console.error(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} →`, err.message);
  }

  res.status(statusCode).json({
    success: false,
    statusCode,
    message,
    errors,
    ...(isDev && { stack: err.stack }),
  });
};
