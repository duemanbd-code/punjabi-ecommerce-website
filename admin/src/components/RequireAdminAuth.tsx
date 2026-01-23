// admin/src/components/RequireAdminAuth.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RequireAdminAuth({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("admin-token");

    if (!token) {
      router.replace("/login");
    }
  }, [router]);

  return <>{children}</>;
}
