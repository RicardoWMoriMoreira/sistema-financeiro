"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => signOut({ callbackUrl: "/login" })}
      className="gap-2 text-slate-600 dark:text-slate-400"
      aria-label="Sair da conta"
    >
      <LogOut className="size-4" aria-hidden="true" />
      Sair
    </Button>
  );
}
