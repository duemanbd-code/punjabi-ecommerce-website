// admin/src/components/ProtectedRoute.tsx

"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    // Make sure code runs only on client
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;

    const token = localStorage.getItem("admin-token");
    if (!token) {
      router.replace("/login"); // replace instead of push to avoid history back
    } else {
      setLoading(false);
    }
  }, [router, isClient]);

  if (loading) return <p>Loading...</p>;

  return <>{children}</>;
}


