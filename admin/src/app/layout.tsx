// admin/src/app/layout.tsx

import "./globals.css";
import AdminSidebar from "../components/AdminSidebar";
import Topbar from "../components/Topbar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        <div className="flex w-full min-h-screen">
          <AdminSidebar />
          <div className="flex-1 flex flex-col">
            <Topbar />
            <main className="flex-1 p-6 overflow-y-auto">
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
