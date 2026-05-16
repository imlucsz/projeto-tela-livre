/**
 * Script para seedar (popular) eventos do carrossel original no banco de dados
 * 
 * Uso: npm run seed:ts
 */

import mongoose from 'mongoose';

const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

if (!mongoUri) {
  throw new Error('MONGO_URI ou MONGODB_URI não está definido no .env.local');
}

const CAROUSEL_EVENTS = [
  {
    title: "Ainda Estou Aqui",
    location: "Fatec Itaquera",
    address: "Av. Sérgio Vieira de Mellos, 1000 - Itaquera, São Paulo",
    date: new Date('2026-06-28T19:00:00'),
    description: "Drama brasileiro premiado internacionalmente",
    image: "https://i.imgur.com/X9ieYpi.jpeg",
    category: "cinema",
    approved: true,
  },
  {
    title: "Alice no País das Maravilhas",
    location: "ONG Tela Livre",
    address: "Rua das Flores, 456 - Centro, São Paulo",
    date: new Date('2026-07-05T15:00:00'),
    description: "Clássico infantil em versão cinematográfica",
    image: "https://i.imgur.com/CH8MwS0.jpeg",
    category: "cinema",
    approved: true,
  },
  {
    title: "Até o Último Homem",
    location: "CCSP",
    address: "Av. Paulista, 900 - Bela Vista, São Paulo",
    date: new Date('2026-07-12T18:00:00'),
    description: "Drama de guerra intenso e emocionante",
    image: "https://i.imgur.com/OtnVjut.jpeg",
    category: "cinema",
    approved: true,
  },
  {
    title: "Bagagem de Risco",
    location: "Biblioteca Mário de Andrade",
    address: "Rua 7 de Abril, 230 - Centro, São Paulo",
    date: new Date('2026-07-19T20:00:00'),
    description: "Thriller emocionante sobre relações humanas",
    image: "https://i.imgur.com/3ZmV4kR.jpeg",
    category: "cinema",
    approved: true,
  },
  {
    title: "Formula 1",
    location: "Centro Cultural BB",
    address: "Rua Álvares Penteado, 112 - Centro, São Paulo",
    date: new Date('2026-07-26T19:00:00'),
    description: "Documentário sobre o mundo da Fórmula 1",
    image: "https://i.imgur.com/QinomOQ.jpeg",
    category: "cinema",
    approved: true,
  },
  {
    title: "Interestelar",
    location: "Sesc Pompeia",
    address: "Rua Clélia, 93 - Pompeia, São Paulo",
    date: new Date('2026-08-02T19:00:00'),
    description: "Épica ficção científica de Christopher Nolan",
    image: "https://i.imgur.com/Et1JYuW.jpeg",
    category: "cinema",
    approved: true,
  },
  {
    title: "Marty Supreme",
    location: "Cinemateca Brasileira",
    address: "Largo Sen. Felipe Schmidt, 64 - Consolação, São Paulo",
    date: new Date('2026-08-09T18:30:00'),
    description: "Drama sobre a vida de um jogador de tênis",
    image: "https://i.imgur.com/7hPOcbt.jpeg",
    category: "cinema",
    approved: true,
  },
  {
    title: "Os Pecadores",
    location: "Museu de Arte de SP",
    address: "Av. Paulista, 1578 - Bela Vista, São Paulo",
    date: new Date('2026-08-23T20:00:00'),
    description: "Drama que aborda temas religiosos e morais",
    image: "https://i.imgur.com/7CKbjYI.jpeg",
    category: "cinema",
    approved: true,
  },
  {
    title: "Tropa de Elite",
    location: "Centro Cultural SP",
    address: "Av. São João, 288 - Centro, São Paulo",
    date: new Date('2026-09-06T18:00:00'),
    description: "Thriller policial brasileiro aclamado",
    image: "https://i.imgur.com/0lasSWW.jpeg",
    category: "cinema",
    approved: true,
  },
  {
    title: "Velozes e Furiosos 6",
    location: "TeatroMundo",
    address: "Rua XV de Novembro, 500 - Centro, São Paulo",
    date: new Date('2026-09-13T19:30:00'),
    description: "Ação e adrenalina em alta velocidade",
    image: "https://i.imgur.com/U0luBuP.jpeg",
    category: "cinema",
    approved: true,
  },
];

// Schema de Event
const eventSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
    },
    date: {
      type: Date,
      required: true,
    },
    location: {
      type: String,
      default: '',
    },
    address: {
      type: String,
      default: '',
    },
    image: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      enum: ['cinema', 'oficinas', 'projetos'],
      default: 'cinema',
    },
    approved: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
  },
  { timestamps: true }
);

async function seedEvents() {
  try {
    console.log('🌱 Iniciando seed de eventos do carrossel...');

    // Conectar ao MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB');

    // Criar modelo
    const Event = mongoose.model('Event', eventSchema, 'events');

    // Verificar quantos eventos já existem
    const existingCount = await Event.countDocuments();
    console.log(`📊 Eventos existentes: ${existingCount}`);

    // Inserir novos eventos
    try {
      const result = await Event.insertMany(CAROUSEL_EVENTS);
      console.log(`✨ ${result.length} eventos foram criados com sucesso!`);
    } catch (error: any) {
      if (error.code === 11000) {
        console.log('⚠️  Alguns eventos já existiam, continuando...');
      } else {
        throw error;
      }
    }

    console.log('📍 Todos os eventos estão com approved=true e aparecerão no carrossel');
    
    // Listar eventos criados
    const allEvents = await Event.find({}).select('title date location image approved');
    console.log('\n📽️  Eventos no banco de dados:');
    allEvents.forEach((event: any) => {
      const dateStr = new Date(event.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const approvalStatus = event.approved ? '✅ Aprovado' : '⏳ Pendente';
      console.log(`  • ${event.title} (${dateStr}) - ${approvalStatus}`);
    });

    console.log('\n🎬 Seed completado com sucesso!');
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Erro ao fazer seed:', error.message);
    process.exit(1);
  }
}

seedEvents();
