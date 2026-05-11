import Link from "next/link";
import { Film, Heart } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
                <Film className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-semibold tracking-tight text-foreground">
                Tela Livre
              </span>
            </Link>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Conectamos ONGs e comunidades através do cinema. Descubra sessões
              gratuitas, oficinas e projetos sociais perto de você.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Navegação
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Eventos
                </Link>
              </li>
              <li>
                <Link
                  href="/#categorias"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Categorias
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Para ONGs
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Conta
            </h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/profile"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Meu Perfil
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                >
                  Painel da ONG
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            2026 Tela Livre. Todos os direitos reservados.
          </p>
          <p className="flex items-center gap-1 text-sm text-muted-foreground">
            Feito com <Heart className="h-4 w-4 fill-primary text-primary" /> para a comunidade
          </p>
        </div>
      </div>
    </footer>
  );
}
