"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getCurrentUser } from "@/lib/supabase/auth";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    getCurrentUser().then((user) => {
      router.replace(user ? "/dashboard" : "/login");
    });
  }, [router]);

  return null;
}
