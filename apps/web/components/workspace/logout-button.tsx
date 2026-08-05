"use client";

import { logout } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await logout();
      router.replace("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className="mt-8 w-full rounded-[10px] border border-white/10 px-4 py-3 text-sm text-white/70 transition hover:bg-white/5 hover:text-white disabled:opacity-60"
    >
      {loading ? "Saindo…" : "Sair da conta"}
    </button>
  );
}
