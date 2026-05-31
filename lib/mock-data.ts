export interface Event {
  id: string;
  title: string;
  description: string;
  image: string;
  location: string;
  address: string;
  date: string;
  time: string;
  category: "cinema" | "oficinas" | "projetos";
  ngo: {
    name: string;
    logo: string;
    description: string;
  };
  impact: {
    people: number;
    communities: number;
    sessions: number;
  };
  participants: Participant[];
  volunteers: Volunteer[];
}

export interface Participant {
  id: string;
  name: string;
  email: string;
  avatar: string;
  registeredAt: string;
}

export interface Volunteer {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  registeredAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
  savedEvents: string[];
  participatingEvents: string[];
  isNgo: boolean;
}

export const mockEvents: Event[] = [
  {
    id: "1",
    title: "Cinema ao Ar Livre - Clássicos Brasileiros",
    description: "Uma noite especial de cinema ao ar livre com clássicos do cinema brasileiro. Traga sua família e amigos para assistir filmes que marcaram gerações em um ambiente acolhedor e comunitário. Teremos pipoca gratuita e espaço para crianças.",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=500&fit=crop",
    location: "Praça da Sé",
    address: "Praça da Sé, s/n - Centro, São Paulo - SP",
    date: "2026-04-15",
    time: "19:00",
    category: "cinema",
    genre: "geral",
    ngo: {
      name: "Instituto Cultura Viva",
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=ICV&backgroundColor=ea580c",
      description: "O Instituto Cultura Viva promove o acesso à cultura e educação em comunidades carentes há mais de 15 anos."
    },
    impact: {
      people: 1250,
      communities: 8,
      sessions: 45
    },
    participants: [
      { id: "p1", name: "Maria Silva", email: "maria@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maria", registeredAt: "2026-03-20" },
      { id: "p2", name: "João Santos", email: "joao@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Joao", registeredAt: "2026-03-21" },
      { id: "p3", name: "Ana Costa", email: "ana@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ana", registeredAt: "2026-03-22" },
    ],
    volunteers: [
      { id: "v1", name: "Carlos Lima", email: "carlos@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carlos", role: "Organização", registeredAt: "2026-03-15" },
    ]
  },
  {
    id: "2",
    title: "Oficina de Produção Audiovisual",
    description: "Aprenda os fundamentos da produção audiovisual nesta oficina gratuita. Você vai aprender sobre roteiro, filmagem e edição básica usando equipamentos simples como celulares.",
    image: "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=800&h=500&fit=crop",
    location: "Centro Cultural São Paulo",
    address: "Rua Vergueiro, 1000 - Paraíso, São Paulo - SP",
    date: "2026-04-20",
    time: "14:00",
    category: "oficinas",
    genre: "geral",
    ngo: {
      name: "Jovens Criadores",
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=JC&backgroundColor=0891b2",
      description: "Capacitando jovens através da arte e tecnologia desde 2010."
    },
    impact: {
      people: 800,
      communities: 5,
      sessions: 32
    },
    participants: [
      { id: "p4", name: "Pedro Oliveira", email: "pedro@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Pedro", registeredAt: "2026-03-18" },
    ],
    volunteers: []
  },
  {
    id: "3",
    title: "Cine Debate - Diversidade e Inclusão",
    description: "Sessão de cinema seguida de debate sobre diversidade e inclusão. Um espaço seguro para reflexão e troca de experiências sobre temas importantes para nossa sociedade.",
    image: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=800&h=500&fit=crop",
    location: "Biblioteca Mário de Andrade",
    address: "Rua da Consolação, 94 - República, São Paulo - SP",
    date: "2026-04-25",
    time: "18:30",
    category: "projetos",
    genre: "documentario",
    ngo: {
      name: "Coletivo Diversidade",
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=CD&backgroundColor=7c3aed",
      description: "Promovendo a inclusão e o respeito à diversidade através da cultura."
    },
    impact: {
      people: 650,
      communities: 12,
      sessions: 28
    },
    participants: [],
    volunteers: []
  },
  {
    id: "4",
    title: "Cinema na Comunidade - Filmes Infantis",
    description: "Uma tarde especial para as crianças da comunidade com exibição de filmes infantis educativos. Atividades lúdicas e lanche para os pequenos.",
    image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&h=500&fit=crop",
    location: "Parque do Ibirapuera",
    address: "Av. Pedro Álvares Cabral - Vila Mariana, São Paulo - SP",
    date: "2026-05-01",
    time: "15:00",
    category: "cinema",
    genre: "infantil",
    ngo: {
      name: "Amigos da Infância",
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=AI&backgroundColor=16a34a",
      description: "Cuidando do futuro das nossas crianças há 20 anos."
    },
    impact: {
      people: 2000,
      communities: 15,
      sessions: 60
    },
    participants: [
      { id: "p5", name: "Fernanda Lima", email: "fernanda@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fernanda", registeredAt: "2026-03-25" },
      { id: "p6", name: "Roberto Mendes", email: "roberto@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Roberto", registeredAt: "2026-03-26" },
    ],
    volunteers: [
      { id: "v2", name: "Lucia Ferreira", email: "lucia@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lucia", role: "Cuidados Infantis", registeredAt: "2026-03-20" },
    ]
  },
  {
    id: "5",
    title: "Oficina de Roteiro para Iniciantes",
    description: "Descubra como transformar suas ideias em roteiros para cinema e TV. Oficina prática com exercícios e feedback personalizado.",
    image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=500&fit=crop",
    location: "Casa de Cultura Vila Madalena",
    address: "Rua Aspicuelta, 150 - Vila Madalena, São Paulo - SP",
    date: "2026-05-10",
    time: "10:00",
    category: "oficinas",
    genre: "geral",
    ngo: {
      name: "Escola Livre de Cinema",
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=ELC&backgroundColor=dc2626",
      description: "Democratizando o ensino de cinema desde 2005."
    },
    impact: {
      people: 450,
      communities: 3,
      sessions: 18
    },
    participants: [],
    volunteers: []
  },
  {
    id: "6",
    title: "Projeto Tela Solidária",
    description: "Levamos cinema para comunidades sem acesso a salas de exibição. Nesta edição, exibiremos documentários sobre meio ambiente e sustentabilidade.",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=500&fit=crop",
    location: "Comunidade Jardim Ângela",
    address: "Estrada do M'Boi Mirim, 5000 - Jardim Ângela, São Paulo - SP",
    date: "2026-05-15",
    time: "19:30",
    category: "projetos",
    genre: "documentario",
    ngo: {
      name: "Tela para Todos",
      logo: "https://api.dicebear.com/7.x/initials/svg?seed=TPT&backgroundColor=2563eb",
      description: "Conectando comunidades através do cinema há 8 anos."
    },
    impact: {
      people: 3500,
      communities: 25,
      sessions: 120
    },
    participants: [
      { id: "p7", name: "Amanda Souza", email: "amanda@email.com", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda", registeredAt: "2026-03-28" },
    ],
    volunteers: []
  }
];

export const mockUser: User = {
  id: "user1",
  name: "Carolina Martins",
  email: "carolina@email.com",
  avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Carolina",
  savedEvents: ["2", "5"],
  participatingEvents: ["1", "4"],
  isNgo: false
};

export const mockNgoUser: User = {
  id: "ngo1",
  name: "Instituto Cultura Viva",
  email: "contato@culturaviva.org",
  avatar: "https://api.dicebear.com/7.x/initials/svg?seed=ICV&backgroundColor=ea580c",
  savedEvents: [],
  participatingEvents: [],
  isNgo: true
};

export const categories = [
  {
    id: "cinema",
    name: "Cinema gratuito",
    icon: "film",
    description: "Sessões de cinema ao ar livre e em espaços comunitários"
  },
  {
    id: "oficinas",
    name: "Oficinas",
    icon: "graduation-cap",
    description: "Aprenda produção audiovisual, roteiro e mais"
  },
  {
    id: "projetos",
    name: "Projetos sociais",
    icon: "heart-handshake",
    description: "Iniciativas que transformam comunidades através do cinema"
  }
];
