import { requireAuth } from '@clerk/express';

export const authMiddleware = requireAuth();

export const optionalAuthMiddleware = (req, res, next) => {
  next();
};

export const authErrorHandler = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({
      error: 'Authentication required',
      message: 'Please sign in to access this resource'
    });
  }
  next(err);
};
