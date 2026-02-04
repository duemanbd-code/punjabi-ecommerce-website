// server/src/app.ts

import express from "express";
import cors from "cors";
import path from "path";

import adminRoutes from "./routes/admin.routes";
import productRoutes from "./routes/product.routes";
import orderRoutes from "./routes/order.routes";

const app = express();

// Get environment variables
const front_url = process.env.CLIENT_URL;
const admin_url = process.env.ADMIN_URL;
const server_url = process.env.SERVER_URL;
const live_frontend = process.env.LIVE_ADMIN_URL;
const live_admin = process.env.LIVE_FRONTEND_URL;

// CORRECTED allowed origins - FIXED: removed leading space
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
  "https://punjabi-ecommerce-website.onrender.com",
  "https://puti-client-production-admin.vercel.app",
  "https://puti-client-production-t1kq.vercel.app",
  "https://admin.duemanbd.com",  // ✅ FIXED: Removed leading space
  "https://www.duemanbd.com",
  "https://duemanbd.com",
  // Add environment variables if they exist and are strings
  ...(front_url && typeof front_url === 'string' ? [front_url] : []),
  ...(admin_url && typeof admin_url === 'string' ? [admin_url] : []),
  ...(server_url && typeof server_url === 'string' ? [server_url] : []),
  ...(live_admin && typeof live_admin === 'string' ? [live_admin] : []),
  ...(live_frontend && typeof live_frontend === 'string' ? [live_frontend] : [])
].filter(Boolean); // Remove any undefined/null values

// Remove trailing slashes and trim whitespace from origins
const cleanOrigins = allowedOrigins.map(origin => 
  origin.toString().trim().replace(/\/$/, '')
);

console.log('🛡️  CORS Allowed Origins:', cleanOrigins);

// More flexible CORS configuration
app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) {
        console.log('✅ Allowing request with no origin (server-to-server)');
        return callback(null, true);
      }
      
      console.log('🔍 Checking CORS for origin:', origin);
      console.log('✅ Allowed origins:', cleanOrigins);
      
      // Check if origin is in allowed list
      const isAllowed = cleanOrigins.some(allowedOrigin => {
        // Exact match
        if (origin === allowedOrigin) {
          console.log('✅ Exact match found for:', origin);
          return true;
        }
        
        // Match without www subdomain
        if (origin.replace('www.', '') === allowedOrigin.replace('www.', '')) {
          console.log('✅ Match without www for:', origin);
          return true;
        }
        
        // Match with/without protocol (http/https)
        const originNoProtocol = origin.replace(/^https?:\/\//, '');
        const allowedNoProtocol = allowedOrigin.replace(/^https?:\/\//, '');
        if (originNoProtocol === allowedNoProtocol) {
          console.log('✅ Match without protocol for:', origin);
          return true;
        }
        
        return false;
      });
      
      if (isAllowed) {
        callback(null, true);
      } else {
        console.log("❌ Blocked by CORS:", origin);
        console.log("🔄 Allowed origins:", cleanOrigins);
        // Instead of error, allow for now to debug
        // callback(new Error(`Not allowed by CORS. Origin: ${origin}`));
        callback(null, true); // TEMPORARY: Allow all for debugging
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept", "cache-control"],
    exposedHeaders: ["Content-Range", "X-Content-Range"],
  })
);

// Handle preflight requests
app.options("*", cors());

// Parse JSON request bodies
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

// Log all requests
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} - Origin: ${req.headers.origin || 'none'}`);
  if (req.method === 'POST' || req.method === 'PUT') {
    console.log('Body:', JSON.stringify(req.body, null, 2));
  }
  next();
});

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// Serve uploads
const uploadsPath = path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsPath));

// Health check endpoint
app.get("/health", (req, res) => {
  res.status(200).json({ 
    status: "healthy", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    corsOrigins: cleanOrigins.length,
    origins: cleanOrigins
  });
});

// Test CORS endpoint
app.get("/api/test-cors", (req, res) => {
  res.json({
    message: "CORS test successful",
    yourOrigin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error("❌ Server Error:", err);
  
  if (err.message && err.message.includes("CORS")) {
    return res.status(403).json({ 
      error: "CORS Error", 
      message: err.message,
      yourOrigin: req.headers.origin,
      allowedOrigins: cleanOrigins 
    });
  }
  
  res.status(err.status || 500).json({
    error: "Internal Server Error",
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

export default app;



// // server/src/app.ts

// import express from "express";
// import cors from "cors";
// import path from "path";

// import adminRoutes from "./routes/admin.routes";
// import productRoutes from "./routes/product.routes";
// import orderRoutes from "./routes/order.routes";

// const app = express();

// // CORRECTED allowed origins (remove double https://)

// const front_url= process.env.CLIENT_URL;
// const admin_url=process.env.ADMIN_URL;
// const server_url= process.env.SERVER_URL;
// const live_frontend= process.env.LIVE_ADMIN_URL;
// const live_admin= process.env.LIVE_FRONTEND_URL;
// const allowedOrigins = [
//   "http://localhost:3000",
//   "http://localhost:3001",
//   "https://puti-client-production.onrender.com",
//   "https://puti-client-production-admin.vercel.app",
//   "https://puti-client-production-t1kq.vercel.app",
//  " https://admin.duemanbd.com",
//  "https://www.duemanbd.com",
//   'https://duemanbd.com',
//   front_url, admin_url, server_url, live_admin, live_frontend
//  // ✅ Fixed: Removed extra https:// and trailing slash
// ];

// // More flexible CORS configuration
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       // Allow requests with no origin (like mobile apps, curl, postman)
//       if (!origin) return callback(null, true);
      
//       if (allowedOrigins.indexOf(origin) !== -1) {
//         callback(null, true);
//       } else {
//         console.log("Blocked by CORS:", origin);
//         callback(new Error("Not allowed by CORS"));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "Accept", "cache-control"],
//   })
// );

// // Handle preflight requests
// app.options("*", cors());

// // Parse JSON request bodies
// app.use(express.json());

// // Routes
// app.use("/api/admin", adminRoutes);
// app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);

// // Serve uploads
// const uploadsPath = path.join(process.cwd(), "uploads");
// app.use("/uploads", express.static(uploadsPath));

// export default app;

