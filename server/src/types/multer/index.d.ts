// server/src/types/multer/index.d.ts

declare module 'multer' {
  import { Request } from 'express';
  
  interface FileFilterCallback {
    (error: Error): void;
    (error: null, acceptFile: boolean): void;
  }
  
  interface Multer {
    single(fieldname: string): any;
    array(fieldname: string, maxCount?: number): any;
    fields(fields: Array<{ name: string; maxCount?: number }>): any;
    none(): any;
    any(): any;
  }
  
  const multer: (options?: any) => Multer;
  export = multer;
}