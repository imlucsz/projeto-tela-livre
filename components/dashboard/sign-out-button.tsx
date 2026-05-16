"use client";

import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";

export default function SignOutButton() {
  return (
    <Button
      variant="ghost"
      onClick={() => signOut()}
      className="w-full justify-start text-base text-amber-100/80 hover:bg-red-500/10 hover:text-red-100 transition-all duration-700 ease-out hover:scale-[1.02] h-11"
    >
      <LogOut className="mr-3 h-5 w-5" />
      Sair
    </Button>
  );
}
