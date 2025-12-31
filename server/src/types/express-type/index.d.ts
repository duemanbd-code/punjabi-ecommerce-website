import * as express from "express-type";

declare global {
  namespace Express {
    interface Request {
      admin?: any; // custom property for admin
    }
  }
}
