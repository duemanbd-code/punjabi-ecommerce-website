// server/src/types/express-type/index.d.ts

import * as express from 'express';
import { User } from '../../models/user.model'; // Adjust path as needed
import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    interface Request {
      admin?: any; // custom property for admin
      user?: User | JwtPayload | any;
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}

// Export AuthRequest interface
export interface AuthRequest extends express.Request {
  user: User | JwtPayload | any;
  admin?: any;
  body: any;
  params: any;
  query: any;
  files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
}