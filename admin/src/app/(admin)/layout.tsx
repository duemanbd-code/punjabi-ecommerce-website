// admin/src/app/(admin)/layout.tsx

import RequireAdminAuth from "../../components/RequireAdminAuth";
import AdminSidebar from "../../components/AdminSidebar";
import Topbar from "../../components/Topbar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <RequireAdminAuth>
      <div className="flex w-full min-h-screen">
        <AdminSidebar />
        <div className="flex-1 flex flex-col">
          <Topbar />
          <main className="flex-1 p-6 overflow-y-auto">
            {children}
          </main>
        </div>
      </div>
    </RequireAdminAuth>
  );
}

