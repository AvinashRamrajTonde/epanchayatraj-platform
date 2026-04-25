import { ApiError } from '../utils/ApiError.js';

export const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new ApiError(401, 'Authentication required'));
    }
    if (!allowedRoles.includes(req.user.role)) {
      return next(new ApiError(403, 'Insufficient permissions'));
    }
    next();
  };
};

export const requireSuperadminTenant = (req, res, next) => {
  if (req.tenantType !== 'superadmin') {
    return next(new ApiError(403, 'This endpoint is only accessible from the admin portal'));
  }
  next();
};

export const requireVillageTenant = (req, res, next) => {
  if (req.tenantType !== 'village') {
    return next(new ApiError(403, 'This endpoint is only accessible from a village portal'));
  }
  next();
};
