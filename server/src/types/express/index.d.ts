import { IAdmin } from "../../models/admin.model";

declare module "express-serve-static-core" {
  interface Request {
    admin?: IAdmin;      // Optional admin object
    adminId?: string;    // Optional adminId
  }
}
