"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = getToken();
    if (token) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-950">
      <p className="text-white">Loading...</p>
    </div>
  );
}