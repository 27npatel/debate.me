"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

export default function LogoutPage() {
  const { logout } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // Call logout and redirect to home page
    const handleLogout = async () => {
      try {
        await logout();
      } catch (error) {
        console.error("Error during logout:", error);
      } finally {
        router.replace("/");
      }
    };

    handleLogout();
  }, [logout, router]);

  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Logging out...</h1>
        <p>You are being redirected to the home page.</p>
      </div>
    </div>
  );
} 