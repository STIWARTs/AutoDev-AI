import { clerkMiddleware, requireAuth } from '@clerk/express';

// Export the middleware so we can use it centrally in index.ts
export const authMiddleware = clerkMiddleware();
// Export RequireAuth so we can use it to protect specific routes
export const requireAuthMiddleware = requireAuth();
