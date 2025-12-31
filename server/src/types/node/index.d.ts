// server/src/types/index.d.ts

declare namespace NodeJS {
  interface ProcessEnv {
    NODE_ENV: string;
    PORT: string;
    MONGODB_URI: string;
    JWT_SECRET: string;
    CLOUDINARY_CLOUD_NAME: string;
    CLOUDINARY_API_KEY: string;
    CLOUDINARY_API_SECRET: string;
    CLIENT_URL: string;
    ADMIN_URL: string;
    [key: string]: string;
  }
}

declare var process: NodeJS.Process;
declare var __dirname: string;