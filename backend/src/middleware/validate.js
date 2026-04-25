import { ApiError } from '../utils/ApiError.js';

export const validate = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((d) => ({
        field: d.path.join('.'),
        message: d.message,
      }));

      if (process.env.NODE_ENV === 'development') {
        console.warn('Validation failed:', JSON.stringify(errors), 'Body:', JSON.stringify(req[source]));
      }

      return next(new ApiError(400, 'Validation Error', errors));
    }

    req[source] = value;
    next();
  };
};
