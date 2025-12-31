// admin/src/app/products/add/page.tsx

"use client";
import AdminSidebar from "../../../components/AdminSidebar";
import Topbar from "../../../components/Topbar";
import ProductFormPage from "../form";

export default function AddProductPage() {
  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar/>
      <div className="flex-1 flex flex-col">
        <Topbar/>
        <main className="p-6 flex-1 overflow-auto">
          <h1 className="text-3xl font-bold mb-6">Add Product</h1>
          <ProductFormPage/>
        </main>
      </div>
    </div>
  );
}
