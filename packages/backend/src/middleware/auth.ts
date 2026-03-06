import { clerkMiddleware, requireAuth } from '@clerk/express';
import type { RequestHandler } from 'express';

// Export the middleware so we can use it centrally in index.ts
export const authMiddleware: RequestHandler = clerkMiddleware();
// Export RequireAuth so we can use it to protect specific routes
export const requireAuthMiddleware: RequestHandler = requireAuth();
