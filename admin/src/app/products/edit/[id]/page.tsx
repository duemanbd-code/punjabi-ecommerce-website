// admin/src/app/products/edit/page.tsx

"use client";
import AdminSidebar from "../../../../components/AdminSidebar";
import Topbar from "../../../../components/Topbar";
import ProductFormPage from "../../form";
import { useParams } from "next/navigation";

export default function EditProductPage() {
  const params = useParams();
  const productId = Array.isArray(params.id) ? params.id[0] : params.id;

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar/>
      <div className="flex-1 flex flex-col">
        <Topbar/>
        <main className="p-6 flex-1 overflow-auto">
          <h1 className="text-3xl font-bold mb-6">Edit Product</h1>
          <ProductFormPage productId={productId}/>
        </main>
      </div>
    </div>
  );
}

