/**
 * Script para seedar (popular) eventos do carrossel original no banco de dados
 *
 * Uso: npm run seed:ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const mongoUriRaw = process.env.MONGO_URI || process.env.MONGODB_URI;
const mongoUri = mongoUriRaw?.trim();



if (!mongoUri) {
  throw new Error('MONGO_URI ou MONGODB_URI não está definido no .env.local');
}

const CAROUSEL_EVENTS = [
  {
    title: 'Ainda Estou Aqui',
    location: 'Fatec Itaquera',
    address: 'Av. Sérgio Vieira de Mellos, 1000 - Itaquera, São Paulo',
    date: new Date('2026-06-28T19:00:00'),
    description: 'Drama brasileiro premiado internacionalmente',
    image: 'https://i.imgur.com/X9ieYpi.jpeg',
    category: 'cinema',
    approved: true,
  },
  {
    title: 'Alice no País das Maravilhas',
    location: 'ONG Tela Livre',
    address: 'Rua das Flores, 456 - Centro, São Paulo',
    date: new Date('2026-07-05T15:00:00'),
    description: 'Clássico infantil em versão cinematográfica',
    image: 'https://i.imgur.com/CH8MwS0.jpeg',
    category: 'cinema',
    approved: true,
  },
  {
    title: 'Até o Último Homem',
    location: 'CCSP',
    address: 'Av. Paulista, 900 - Bela Vista, São Paulo',
    date: new Date('2026-07-12T18:00:00'),
    description: 'Drama de guerra intenso e emocionante',
    image: 'https://i.imgur.com/OtnVjut.jpeg',
    category: 'cinema',
    approved: true,
  },
  {
    title: 'Bagagem de Risco',
    location: 'Biblioteca Mário de Andrade',
    address: 'Rua 7 de Abril, 230 - Centro, São Paulo',
    date: new Date('2026-07-19T20:00:00'),
    description: 'Thriller emocionante sobre relações humanas',
    image: 'https://i.imgur.com/3ZmV4kR.jpeg',
    category: 'cinema',
    approved: true,
  },
  {
    title: 'Formula 1',
    location: 'Centro Cultural BB',
    address: 'Rua Álvares Penteado, 112 - Centro, São Paulo',
    date: new Date('2026-07-26T19:00:00'),
    description: 'Documentário sobre o mundo da Fórmula 1',
    image: 'https://i.imgur.com/QinomOQ.jpeg',
    category: 'cinema',
    approved: true,
  },
  {
    title: 'Interestelar',
    location: 'Sesc Pompeia',
    address: 'Rua Clélia, 93 - Pompeia, São Paulo',
    date: new Date('2026-08-02T19:00:00'),
    description: 'Épica ficção científica de Christopher Nolan',
    image: 'https://i.imgur.com/Et1JYuW.jpeg',
    category: 'cinema',
    approved: true,
  },
  {
    title: 'Marty Supreme',
    location: 'Cinemateca Brasileira',
    address: 'Largo Sen. Felipe Schmidt, 64 - Consolação, São Paulo',
    date: new Date('2026-08-09T18:30:00'),
    description: 'Drama sobre a vida de um jogador de tênis',
    image: 'https://i.imgur.com/7hPOcbt.jpeg',
    category: 'cinema',
    approved: true,
  },
  {
    title: 'Os Pecadores',
    location: 'Museu de Arte de SP',
    address: 'Av. Paulista, 1578 - Bela Vista, São Paulo',
    date: new Date('2026-08-23T20:00:00'),
    description: 'Drama que aborda temas religiosos e morais',
    image: 'https://i.imgur.com/7CKbjYI.jpeg',
    category: 'cinema',
    approved: true,
  },
  {
    title: 'Tropa de Elite',
    location: 'Centro Cultural SP',
    address: 'Av. São João, 288 - Centro, São Paulo',
    date: new Date('2026-09-06T18:00:00'),
    description: 'Thriller policial brasileiro aclamado',
    image: 'https://i.imgur.com/0lasSWW.jpeg',
    category: 'cinema',
    approved: true,
  },
  {
    title: 'Velozes e Furiosos 6',
    location: 'TeatroMundo',
    address: 'Rua XV de Novembro, 500 - Centro, São Paulo',
    date: new Date('2026-09-13T19:30:00'),
    description: 'Ação e adrenalina em alta velocidade',
    image: 'https://i.imgur.com/U0luBuP.jpeg',
    category: 'cinema',
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
    // Alguns clusters recusam o valor 'retryWrites=true|false' se vier inválido no URI.
    // Normalizamos aqui para evitar falhas na conexão.
    const normalizedUri = (mongoUri as string).replace(/retryWrites=[^&]*/i, 'retryWrites=true');

    await mongoose.connect(normalizedUri);

    console.log('✅ Conectado ao MongoDB');



    // Criar modelo
    const Event = mongoose.model('Event', eventSchema, 'events');

    // 1) Apagar eventos duplicados do carrossel (mesmo title e date)
    // (Não apaga outros eventos que possam existir no banco)
    const idsToDelete: mongoose.Types.ObjectId[] = [];

    for (const item of CAROUSEL_EVENTS) {
      const matches = await Event.find({ title: item.title, date: item.date }).sort({ _id: 1 });
      if (matches.length > 1) {
        // preserva o primeiro e remove os restantes
        const toRemove = matches.slice(1);
        idsToDelete.push(...toRemove.map((m) => m._id as mongoose.Types.ObjectId));
      }
    }


    if (idsToDelete.length > 0) {
      const deleteResult = await Event.deleteMany({ _id: { $in: idsToDelete } });
      console.log(`🧹 ${deleteResult.deletedCount} duplicados apagados.`);
    } else {
      console.log('🧹 Nenhum duplicado encontrado para os eventos do carrossel.');
    }

    // 2) Garantir que cada item exista no banco (idempotente)
    const upserted: string[] = [];

    for (const item of CAROUSEL_EVENTS) {
      const existing = await Event.findOne({ title: item.title, date: item.date });

      if (!existing) {
        await Event.create(item);
        upserted.push(item.title);
      } else {
        // atualiza dados caso tenham mudado
        await Event.updateOne({ _id: existing._id }, { $set: item });
      }
    }

    if (upserted.length > 0) {
      console.log(`✨ ${upserted.length} eventos do carrossel foram criados.`);
    } else {
      console.log('✨ Nenhum evento novo foi necessário (tudo já existia).');
    }

    console.log('📍 Seed finalizado (sem duplicar).');

    // Listar eventos criados/atualizados
    const allEvents = await Event.find({ title: { $in: CAROUSEL_EVENTS.map((e) => e.title) } })
      .select('title date location image approved')
      .sort({ date: 1 });

    console.log('\n📽️  Eventos no banco (carrossel):');
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

