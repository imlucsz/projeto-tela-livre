"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Users,
  TrendingUp,
  Calendar,
  Search,
  Bell,
  Settings,
  Plus,
  Filter,
  Download,
  FileText,
  MessageSquare,
  Clapperboard,
  Star,
  LogOut,
  HelpCircle,
  ChevronRight,
  Film,
  Ticket,
  Video,
  Heart,
  MapPin,
  Clock,
  Play,
} from "lucide-react";
import Image from "next/image";

interface Session {
  title: string;
  location: string;
  date: string;
  attendees: string;
  status: "Confirmado" | "Pendente" | "Cancelado";
  genre: string;
}

interface StatCard {
  title: string;
  value: string;
  change: string;
  icon: any;
  color: string;
}

interface CommunityReach {
  name: string;
  progress: number;
  color: string;
}

function getInitials(name?: string | null) {
  if (!name) return "AD";

  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function CinemaDashboard() {
  const { data: session, status } = useSession();
  const [search, setSearch] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  // Verifica role do usuário
  const isAdmin = session?.user?.role === 'ADMIN';
  const isOng = session?.user?.role === 'NGO';
  const isUser = session?.user?.role === 'USER';
  
  // Se é USER, mostra aviso
  const showUserWarning = isUser;

  // Dados padrão enquanto carrega
  const defaultSessions: Session[] = [
    {
      title: "O Auto da Compadecida",
      location: "Centro Comunitário São Paulo",
      date: "15 Abril, 14h",
      attendees: "120 pessoas",
      status: "Confirmado",
      genre: "Comédia",
    },
    {
      title: "Kiriku e a Feiticeira",
      location: "Escola Municipal Esperança",
      date: "16 Abril, 10h",
      attendees: "85 crianças",
      status: "Confirmado",
      genre: "Animação",
    },
    {
      title: "Central do Brasil",
      location: "ONG Vida Nova",
      date: "18 Abril, 19h",
      attendees: "60 pessoas",
      status: "Pendente",
      genre: "Drama",
    },
    {
      title: "O Menino Maluquinho",
      location: "Praça da Comunidade",
      date: "20 Abril, 16h",
      attendees: "200 pessoas",
      status: "Confirmado",
      genre: "Infantil",
    },
    {
      title: "Cidade de Deus",
      location: "Centro Cultural Arte Viva",
      date: "22 Abril, 20h",
      attendees: "90 pessoas",
      status: "Confirmado",
      genre: "Drama",
    },
  ];

  const stats: StatCard[] = [
    { title: "Pessoas Impactadas", value: "2.847", change: "+12% este mês", icon: Users, color: "text-amber-400" },
    { title: "Sessões Realizadas", value: "156", change: "+8 esta semana", icon: Film, color: "text-red-400" },
    { title: "Filmes no Acervo", value: "89", change: "+5 novos", icon: Video, color: "text-amber-300" },
    { title: "Próximos Eventos", value: "24", change: "Este mês", icon: Calendar, color: "text-red-300" },
  ];

  const communities: CommunityReach[] = [
    { name: "Zona Leste - SP", progress: 85, color: "from-amber-400 to-red-500" },
    { name: "Centro - RJ", progress: 62, color: "from-red-400 to-amber-500" },
    { name: "Zona Sul - MG", progress: 48, color: "from-amber-500 to-red-400" },
  ];

  const navItems = [
    { icon: Clapperboard, label: "Painel", active: true, href: "#" },
    { icon: Film, label: "Filmes", active: false, href: "/dashboard/movies" },
    { icon: Calendar, label: "Sessões", active: false, href: "/dashboard/sessions" },
    { icon: Users, label: "Beneficiários", active: false, href: "/dashboard/beneficiaries" },
    { icon: Ticket, label: "Ingressos", active: false, href: "/dashboard/tickets" },
  ];

  const managementItems = [
    { icon: FileText, label: "Relatórios", href: "/dashboard/reports" },
    { icon: Heart, label: "Doadores", href: "/dashboard/donors" },
    { icon: MessageSquare, label: "Mensagens", href: "/dashboard/messages" },
    { icon: Video, label: "Acervo", href: "/dashboard/archive" },
    { icon: TrendingUp, label: "Métricas", href: "/dashboard/metrics" },
  ];

  const settingsItems = [
    { icon: Settings, label: "Ajustes", href: "/dashboard/settings" },
    { icon: MapPin, label: "Locais", href: "/dashboard/locations" },
  ];

  useEffect(() => {
    setEvents(defaultSessions);
    setLoading(false);
  }, []);

  if (status === "loading") {
    return (
      <div className="h-screen bg-black flex items-center justify-center">
        <div className="text-white">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="h-screen relative overflow-hidden bg-black">
      {/* Background com gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-black to-black/80" />
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-red-600/10 rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 p-6 grid grid-cols-12 gap-6 h-screen">
        {/* Aviso para usuários USER */}
        {showUserWarning && (
          <div className="col-span-12 bg-blue-500/20 border border-blue-500/40 rounded-2xl p-4 mb-4 flex items-center gap-3">
            <div className="flex-1">
              <p className="text-blue-100 font-semibold">ℹ️ Acesso Limitado</p>
              <p className="text-blue-100/80 text-sm">
                Você é um usuário regular. Solicite acesso como ONG ou entre em contato com um administrador para acessar todos os recursos.
              </p>
            </div>
            <Button 
              size="sm" 
              className="bg-blue-600 hover:bg-blue-700 text-white border-0"
              onClick={() => window.open('mailto:admin@cineng.com', '_blank')}
            >
              Solicitar Acesso
            </Button>
          </div>
        )}

        {/* Left Sidebar Card */}
        <Card className="col-span-2 backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6 pb-6 h-fit flex flex-col">
          <div className="space-y-6">
            {/* Logo */}
            <div className="text-center">
              <Image
                src="/Logo Principal.png"
                alt="Logo Tela Livre"
                width={120}
                height={120}
                className="mx-auto mb-2 object-contain"
                priority
              />
              <p className="text-amber-200/60 text-sm">Cinema Social</p>
            </div>

            {/* Main Navigation */}
            <div>
              <h4 className="text-amber-200/80 text-sm font-semibold uppercase tracking-wider mb-3">
                Menu Principal
              </h4>
              <nav className="space-y-2">
                {navItems.map((item, index) => (
                  <Link key={index} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`w-full justify-start text-base text-amber-100/80 hover:bg-amber-500/10 hover:text-amber-100 transition-all duration-700 ease-out hover:scale-[1.02] h-11 ${
                        item.active ? "bg-amber-500/20 text-amber-100 border border-amber-500/30" : ""
                      }`}
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Cinema Tools */}
            <div>
              <h4 className="text-amber-200/80 text-sm font-semibold uppercase tracking-wider mb-3">Gestão</h4>
              <nav className="space-y-2">
                {managementItems.map((item, index) => (
                  <Link key={index} href={item.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base text-amber-100/80 hover:bg-amber-500/10 hover:text-amber-100 transition-all duration-700 ease-out hover:scale-[1.02] h-11"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>

            {/* Administration */}
            <div>
              <h4 className="text-amber-200/80 text-sm font-semibold uppercase tracking-wider mb-3">
                Configurações
              </h4>
              <nav className="space-y-2">
                {settingsItems.map((item, index) => (
                  <Link key={index} href={item.href}>
                    <Button
                      variant="ghost"
                      className="w-full justify-start text-base text-amber-100/80 hover:bg-amber-500/10 hover:text-amber-100 transition-all duration-700 ease-out hover:scale-[1.02] h-11"
                    >
                      <item.icon className="mr-3 h-5 w-5" />
                      {item.label}
                    </Button>
                  </Link>
                ))}
              </nav>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="flex-shrink-0 space-y-4 pt-4 border-t border-amber-500/20">
            <Card className="backdrop-blur-xl bg-gradient-to-br from-amber-500/20 to-red-600/20 border border-amber-400/30 rounded-2xl p-4">
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <Star className="h-8 w-8 text-amber-400" />
                </div>
                <div>
                  <h4 className="text-white font-semibold text-lg">Apoie o Projeto</h4>
                  <p className="text-amber-100/70 text-sm">Faça parte dessa história</p>
                </div>
                <Button className="w-full bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0 transition-all duration-700 ease-out hover:scale-[1.02] text-sm font-medium">
                  Doar Agora
                  <ChevronRight className="ml-2 h-3 w-3" />
                </Button>
              </div>
            </Card>

            <div className="space-y-2">
              <Button
                variant="ghost"
                className="w-full justify-start text-base text-amber-100/80 hover:bg-amber-500/10 hover:text-amber-100 transition-all duration-700 ease-out hover:scale-[1.02] h-11"
              >
                <HelpCircle className="mr-3 h-5 w-5" />
                Ajuda
              </Button>
              <Button
                variant="ghost"
                onClick={() => signOut()}
                className="w-full justify-start text-base text-amber-100/80 hover:bg-red-500/10 hover:text-red-100 transition-all duration-700 ease-out hover:scale-[1.02] h-11"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </Button>
            </div>
          </div>
        </Card>

        {/* Main Content Area */}
        <div className="col-span-8 space-y-6 h-screen overflow-y-auto max-h-full">
          {/* Header Card */}
          <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-white">Painel de Controle</h2>
                <p className="text-amber-200/60">
                  Bem-vindo ao Tela Livre - Transformando vidas através do cinema
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-amber-200/40 h-4 w-4" />
                  <Input
                    placeholder="Buscar filmes, sessões..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-black/20 border border-amber-500/20 rounded-xl text-white placeholder:text-amber-200/40 focus:border-amber-500/40 focus:bg-black/30"
                  />
                </div>
                <Button
                  size="icon"
                  variant="ghost"
                  className="text-amber-100/80 hover:bg-amber-500/10 hover:text-amber-100"
                >
                  <Bell className="h-5 w-5" />
                </Button>
                <Link href="/dashboard/sessions/new">
                  <Button className="bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 hover:border-amber-500/50 text-amber-100 transition-all duration-700 ease-out hover:scale-[1.02]">
                    <Plus className="mr-2 h-4 w-4" />
                    Nova Sessão
                  </Button>
                </Link>
              </div>
            </div>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <Card
                key={index}
                className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6 transition-all duration-700 ease-out hover:scale-[1.02] hover:bg-black/40"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-amber-200/60 text-sm">{stat.title}</p>
                    <p className="text-2xl font-bold text-white">{stat.value}</p>
                    <p className={`text-sm ${stat.color}`}>{stat.change}</p>
                  </div>
                  <stat.icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </Card>
            ))}
          </div>

          {/* Sessions and Impact Cards */}
          <div className="grid grid-cols-2 gap-6">
            {/* Próximas Sessões */}
            <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Próximas Sessões</h3>
                <div className="flex items-center space-x-2">
                  <Button size="sm" variant="ghost" className="text-amber-100/80 hover:bg-amber-500/10">
                    <Filter className="mr-2 h-4 w-4" />
                    Filtrar
                  </Button>
                  <Button size="sm" variant="ghost" className="text-amber-100/80 hover:bg-amber-500/10">
                    <Download className="mr-2 h-4 w-4" />
                    Exportar
                  </Button>
                </div>
              </div>

              <div className="space-y-4 max-h-96 overflow-y-auto">
                {events.map((session, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-amber-500/10 hover:bg-black/30 transition-all duration-300"
                  >
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-amber-500/20 rounded-xl">
                        <Play className="h-5 w-5 text-amber-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <p className="font-semibold text-white text-sm">{session.title}</p>
                            <p className="text-xs text-amber-200/60">{session.location}</p>
                          </div>
                          <div className="text-right ml-4">
                            <p className="font-medium text-amber-100 text-sm flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {session.date}
                            </p>
                            <Badge
                              className={`text-xs ${
                                session.status === "Confirmado"
                                  ? "bg-green-500/20 text-green-400 border-green-400/30"
                                  : "bg-amber-500/20 text-amber-400 border-amber-400/30"
                              }`}
                            >
                              {session.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Impacto Social */}
            <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-white">Impacto Social</h3>
                <Button size="sm" variant="ghost" className="text-amber-100/80 hover:bg-amber-500/10">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Annual Goal Progress */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-100/80 text-sm">Meta Anual de Pessoas</span>
                    <span className="text-white font-semibold">5.000</span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-amber-400 to-red-500 h-3 rounded-full"
                      style={{ width: "57%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-amber-400">2.847 alcançadas</span>
                    <span className="text-amber-200/60">57%</span>
                  </div>
                </div>

                {/* Sessions Goal */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-amber-100/80 text-sm">Meta de Sessões</span>
                    <span className="text-white font-semibold">200</span>
                  </div>
                  <div className="w-full bg-black/30 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-red-400 to-amber-500 h-3 rounded-full"
                      style={{ width: "78%" }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-red-400">156 realizadas</span>
                    <span className="text-amber-200/60">78%</span>
                  </div>
                </div>

                {/* Community Reach */}
                <div className="space-y-3">
                  <h4 className="text-white font-medium">Comunidades Atendidas</h4>
                  <div className="space-y-2">
                    {communities.map((community, index) => (
                      <div key={index} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-amber-100/80">{community.name}</span>
                          <span className="text-white">{community.progress}%</span>
                        </div>
                        <div className="w-full bg-black/30 rounded-full h-2">
                          <div
                            className={`bg-gradient-to-r ${community.color} h-2 rounded-full`}
                            style={{ width: `${community.progress}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Next Event Countdown */}
                <div className="bg-black/20 rounded-xl p-4 text-center border border-amber-500/10">
                  <p className="text-2xl font-bold text-white">3 dias</p>
                  <p className="text-amber-200/60 text-sm">até a próxima grande sessão</p>
                </div>
              </div>
            </Card>
          </div>

          {/* Featured Films Banner */}
          <Card className="backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-6">
                <div className="flex items-center justify-center w-16 h-16 bg-gradient-to-br from-amber-500/30 to-red-600/30 border border-amber-400/30 rounded-2xl">
                  <Film className="h-8 w-8 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">Expanda o Acervo de Filmes</h3>
                  <p className="text-amber-100/80 text-lg mb-3">
                    Ajude-nos a levar mais histórias e cultura para as comunidades
                  </p>
                  <div className="flex items-center space-x-6 text-sm text-amber-200/70">
                    {[
                      { dot: "bg-amber-400", label: "Filmes Nacionais" },
                      { dot: "bg-red-400", label: "Cinema Infantil" },
                      { dot: "bg-amber-300", label: "Documentários" },
                      { dot: "bg-red-300", label: "Clássicos" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center space-x-2">
                        <div className={`w-2 h-2 ${item.dot} rounded-full`}></div>
                        <span>{item.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <Button className="bg-gradient-to-r from-amber-500 to-red-600 hover:from-amber-600 hover:to-red-700 text-white border-0 transition-all duration-700 ease-out hover:scale-[1.02] px-8 py-6 text-lg font-medium">
                Contribuir
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </Card>
        </div>

        {/* Right Sidebar */}
        <Card className="col-span-2 backdrop-blur-xl bg-black/30 border border-amber-500/20 rounded-3xl p-6 h-fit">
          <div className="space-y-6">
            {/* User Profile */}
            <div className="text-center">
              <Avatar className="h-16 w-16 mx-auto mb-3">
                <AvatarFallback className="bg-gradient-to-br from-amber-500 to-red-600 text-white text-xl font-bold">
                  {getInitials(session?.user?.name)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-white font-semibold text-lg">{session?.user?.name || "Usuário"}</h3>
              <p className="text-amber-200/60 text-sm">{session?.user?.email}</p>
              <Badge className={`mt-2 ${
                isAdmin ? 'bg-red-500/20 text-red-400 border-red-400/30' :
                isOng ? 'bg-amber-500/20 text-amber-400 border-amber-400/30' :
                'bg-blue-500/20 text-blue-400 border-blue-400/30'
              }`}>
                {isAdmin ? '👑 Administrador' : isOng ? '🎬 ONG' : '👤 Usuário'}
              </Badge>
            </div>

            {/* Quick Actions */}
            <div className="space-y-2">
              <h4 className="text-amber-200/80 text-sm font-semibold uppercase tracking-wider">Ações Rápidas</h4>
              <Link href="/dashboard/sessions/new">
                <Button className="w-full justify-start bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-100 h-11">
                  <Ticket className="mr-3 h-5 w-5 text-amber-400" />
                  Gerar Ingressos
                </Button>
              </Link>
              <Link href="/dashboard/movies/new">
                <Button className="w-full justify-start bg-black/20 hover:bg-black/30 border border-amber-500/10 text-amber-100 h-11">
                  <Film className="mr-3 h-5 w-5 text-amber-400" />
                  Adicionar Filme
                </Button>
              </Link>
              <Link href="/dashboard/settings">
                <Button className="w-full justify-start bg-black/20 hover:bg-black/30 border border-amber-500/10 text-amber-100 h-11">
                  <Users className="mr-3 h-5 w-5 text-amber-400" />
                  Cadastrar ONG
                </Button>
              </Link>
            </div>

            {/* Recent Activity */}
            <div className="space-y-3">
              <h4 className="text-amber-200/80 text-sm font-semibold uppercase tracking-wider">Atividade Recente</h4>
              <div className="space-y-3">
                {[
                  { action: "Sessão confirmada", detail: "O Auto da Compadecida", time: "Há 2h" },
                  { action: "Novo local cadastrado", detail: "Centro Cultural SP", time: "Há 5h" },
                  { action: "Filme adicionado", detail: "Bacurau", time: "Há 1 dia" },
                  { action: "Relatório gerado", detail: "Impacto Q1 2026", time: "Há 2 dias" },
                ].map((activity, index) => (
                  <div key={index} className="p-3 bg-black/20 rounded-xl border border-amber-500/10">
                    <p className="text-white text-sm font-medium">{activity.action}</p>
                    <p className="text-amber-200/60 text-xs">{activity.detail}</p>
                    <p className="text-amber-400/60 text-xs mt-1">{activity.time}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Highlight */}
            <div className="space-y-3">
              <h4 className="text-amber-200/80 text-sm font-semibold uppercase tracking-wider">Destaque</h4>
              <Card className="bg-gradient-to-br from-amber-500/10 to-red-600/10 border border-amber-500/20 rounded-2xl p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="flex items-center justify-center w-10 h-10 bg-amber-500/20 rounded-xl">
                    <Star className="h-5 w-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-white font-semibold text-sm">Festival de Cinema</p>
                    <p className="text-amber-200/60 text-xs">Evento Especial</p>
                  </div>
                </div>
                <p className="text-amber-100/80 text-sm mb-3">
                  Grande evento com 5 filmes brasileiros premiados
                </p>
                <div className="flex items-center justify-between text-xs text-amber-200/60">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    25 Abril
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    300 vagas
                  </span>
                </div>
              </Card>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

