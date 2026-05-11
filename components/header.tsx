"use client";

import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";
import { Menu, X, User, Building2, Search, LogOut, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";
import { SearchImmersive } from "./search-immersive";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Header() {
  const { data: session, status } = useSession();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const isLoading = status === 'loading';

  const user = session?.user;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-primary shadow-lg">
            <img src="/Logo Principal.png" alt="Logo" className="h-14 w-14 object-cover rounded-md" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-foreground">
            Tela Livre
          </span>
        </Link>

        {/* Barra de busca para desktop */}
        <div className="hidden md:block flex-1 max-w-md mx-8">
          <SearchImmersive />
        </div>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Eventos
          </Link>
          <Link
            href="/#categorias"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Categorias
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Para ONGs
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          {isLoading ? (
            <div className="h-9 w-32 animate-pulse rounded-md bg-muted" />
          ) : !user ? (
            <>
              <Button variant="outline" size="sm" onClick={async () => {
                await signIn('credentials', { redirect: false, callbackUrl: '/dashboard' })
                window.location.href = '/login?callbackUrl=/dashboard'
              }}>
                <User className="h-4 w-4 mr-2" />
                Entrar
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Criar conta</Link>
              </Button>
            </>
          ) : (
            <>
              <Button size="sm" variant="ghost" asChild>
                <Link href="/dashboard" className="gap-2">
                  <Building2 className="h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2">
                    <Avatar className="h-7 w-7">
<AvatarImage src={user.image || ''} alt={user.name || ''} />
                      <AvatarFallback>{user.name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <span className="font-medium">{user.name}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href="/profile" className="flex items-center gap-2 w-full">
                      <User className="h-4 w-4" />
                      Meu Perfil
                    </Link>
                  </DropdownMenuItem>
{(user as any).isNgo && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard" className="flex items-center gap-2 w-full">
                          <Building2 className="h-4 w-4" />
                          Painel da ONG
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut({ callbackUrl: '/' })}
                    className="cursor-pointer flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>

        <button
          className="flex h-10 w-10 items-center justify-center rounded-lg text-muted-foreground hover:bg-accent md:hidden"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {mobileMenuOpen && (
        <div className="border-t border-border bg-background px-4 py-4 md:hidden">
          <nav className="flex flex-col gap-3">
            <Button
              variant="ghost"
              className="justify-start px-3 py-2"
              onClick={() => {
                setMobileMenuOpen(false);
                setSearchOpen(true);
              }}
            >
              <Search className="h-4 w-4 mr-2" />
              Buscar Eventos
            </Button>
            {!user && (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={async () => {
                    await signIn('credentials', { redirect: false, callbackUrl: '/dashboard' })
                    setMobileMenuOpen(false)
                    window.location.href = '/login?callbackUrl=/dashboard'
                  }}
                >
                  <User className="mr-2 h-4 w-4" />
                  Entrar
                </Button>
                <Button 
                  size="sm" 
                  className="w-full" 
                  asChild
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href="/register">Criar conta</Link>
                </Button>
              </>
            )}
            {user && (
              <div className="space-y-2 pt-4 border-t">
                <div className="px-3 py-2 text-sm text-muted-foreground">
                  Olá, {user.name}
                </div>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/profile" onClick={() => setMobileMenuOpen(false)}>
                    Meu Perfil
                  </Link>
                </Button>
                <Button variant="ghost" size="sm" className="w-full justify-start" asChild>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)}>
                    Dashboard
                  </Link>
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  className="w-full"
                  onClick={() => {
                    signOut({ callbackUrl: '/' })
                    setMobileMenuOpen(false)
                  }}
                >
                  Sair
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
