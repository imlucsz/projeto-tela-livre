#!/usr/bin/env node

/**
 * Script para seedar (popular) eventos do carrossel original no banco de dados
 * Versão em JavaScript puro - sem dependências de TypeScript
 * 
 * Uso: node scripts/seed-carousel-events.js
 */

require('dotenv').config({ path: '.env.local' });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Definir schema de User (copiado do modelo) para criar ONG mock
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['USER', 'NGO', 'ADMIN'],
    default: 'NGO',
  },
  image: {
    type: String,
    default: '',
  },
}, { timestamps: true });

const CAROUSEL_EVENTS = [
  {
    title: "Ainda Estou Aqui",
    location: "Fatec Itaquera",
    address: "Av. Sérgio Vieira de Mellos, 1000 - Itaquera, São Paulo",
    date: new Date('2026-06-28T19:00:00'),
    description: "Drama brasileiro premiado internacionalmente",
    image: "https://i.imgur.com/X9ieYpi.jpeg",
    category: "cinema",
    genre: "drama",
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
    genre: "infantil",
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
    genre: "drama",
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
    genre: "acao",
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
    genre: "documentario",
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
    genre: "ficcao",
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
    genre: "drama",
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
    genre: "drama",
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
    genre: "acao",
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
    genre: "acao",
    approved: true,
  },
];

// Definir schema de Event (copiado do modelo)
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
    genre: {
      type: String,
      enum: ['geral','comedia','drama','infantil','animacao','documentario','acao','romance','ficcao'],
      default: 'geral',
    },
    approved: {
      type: Boolean,
      default: false,
    },
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: []
      }
    ],
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
    
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI ou MONGODB_URI não está definido no .env.local');
    }

    // Conectar ao MongoDB
    await mongoose.connect(mongoUri);
    console.log('✅ Conectado ao MongoDB');

    // Criar modelos
    const User = mongoose.model('User', userSchema, 'users');
    const Event = mongoose.model('Event', eventSchema, 'events');

    // Step 1: Criar ou buscar ONG mock genérica
    let ongMock = await User.findOne({ email: 'ong-sistema@telalivre.org' });

    if (!ongMock) {
      console.log('📝 Criando ONG genérica para seed...');
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('SenhaSegura123!', salt);

      ongMock = await User.create({
        name: 'Tela Livre - Sistema',
        email: 'ong-sistema@telalivre.org',
        password: hashedPassword,
        role: 'NGO',
        image: 'https://api.dicebear.com/7.x/initials/svg?seed=TLS',
      });
      console.log('✅ ONG mock criada:', ongMock._id);
    } else {
      console.log('✅ ONG mock encontrada:', ongMock._id);
    }

    // Step 2: Adicionar createdBy a cada evento do carrossel
    const eventsWithCreator = CAROUSEL_EVENTS.map((event) => ({
      ...event,
      createdBy: ongMock._id,
      participants: [], // Iniciar com array vazio
    }));

    // Verificar quantos eventos já existem
    const existingCount = await Event.countDocuments();
    console.log(`📊 Eventos existentes: ${existingCount}`);

    // Step 3: Garantir que cada item exista no banco (idempotente)
    const upserted = [];

    for (const item of eventsWithCreator) {
      const existing = await Event.findOne({ title: item.title, date: item.date });

      if (!existing) {
        await Event.create(item);
        upserted.push(item.title);
      } else {
        // atualiza dados caso tenham mudado (e garante que createdBy está setado)
        await Event.updateOne({ _id: existing._id }, { $set: { createdBy: ongMock._id, participants: [] } });
      }
    }

    if (upserted.length > 0) {
      console.log(`✨ ${upserted.length} eventos do carrossel foram criados.`);
    } else {
      console.log('✨ Nenhum evento novo foi necessário (tudo já existia).');
    }

    console.log('📍 Todos os eventos estão com approved=true e createdBy atribuído');
    
    // Listar eventos criados
    const allEvents = await Event.find({}).select('title date location image approved createdBy').populate('createdBy', 'name');
    console.log('\n📽️  Eventos no banco de dados:');
    allEvents.forEach((event) => {
      const dateStr = new Date(event.date).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
      const approvalStatus = event.approved ? '✅ Aprovado' : '⏳ Pendente';
      const creatorName = event.createdBy?.name || 'Sem ONG';
      console.log(`  • ${event.title} (${dateStr}) - ${approvalStatus} - Criado por: ${creatorName}`);
    });

    console.log('\n🎬 Seed completado com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao fazer seed:', error.message);
    process.exit(1);
  }
}

seedEvents();
