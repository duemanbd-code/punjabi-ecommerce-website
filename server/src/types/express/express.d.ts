// server/src/types/express/express.d.ts

import { Request } from 'express';
import { IAdmin } from '../models/admin.model';

declare global {
  namespace Express {
    interface Request {
      admin?: IAdmin | any;
      user?: any;
      file?: any;
      files?: any;
      body: any;
      params: any;
      query: any;
      headers: any;
    }
  }
}

// Export AuthRequest that includes everything
export interface AuthRequest extends Request {
  admin: any;
  user?: any;
  file?: any;
  files?: any;
  body: any;
  params: any;
  query: any;
  headers: any;
}