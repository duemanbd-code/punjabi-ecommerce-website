// admin/src/app/layout.tsx

import AdminSidebar from "../components/AdminSidebar";
import Topbar from "../components/Topbar";
import ProtectedRoute from "../components/ProtectedRoute";
import "./globals.css";

export default function RootLayout({ children, }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-screen bg-gray-100">
        {/* Sidebar + Topbar + Main content */}
        <div className="flex w-full">
          {/* Sidebar + Topbar only if not login page */}
          {typeof window !== "undefined" &&
          !window.location.pathname.startsWith("/login") ? (
            <>
              <AdminSidebar />
              <div className="flex-1 flex flex-col">
                <Topbar />
                <main className="flex-1 p-6 overflow-y-auto">{children}</main>
              </div>
            </>
          ) : (
            // Render children directly (login page)
            <main className="flex-1">{children}</main>
          )}
        </div>
      </body>
    </html>
  );
}
