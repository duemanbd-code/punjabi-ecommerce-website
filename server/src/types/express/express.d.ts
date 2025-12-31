// server/src/types/express/express.d.ts

import 'express';

declare global {
  namespace Express {
    interface Request {
      admin?: any;
      user?: any;
      file?: any;
      files?: any;
    }
  }
}

// Remove the AuthRequest export - it's causing conflicts