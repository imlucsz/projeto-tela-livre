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
    date: new Date('2026-06-02T19:00:00'),
    description: 'Aclamado drama de Walter Salles baseado na emocionante história real de Eunice Paiva, mostrando sua resiliência e busca por justiça durante a ditadura militar no Brasil.',
    image: 'https://i.imgur.com/X9ieYpi.jpeg',
    category: 'cinema' as const,
    genre: 'drama',
    approved: true,
  },
  {
    title: 'Alice no País das Maravilhas',
    location: 'ONG Tela Livre',
    address: 'Rua das Flores, 456 - Centro, São Paulo',
    date: new Date('2026-06-05T15:00:00'),
    description: 'Uma jornada visualmente deslumbrante pelo clássico de Lewis Carroll, repleta de fantasia, metáforas sobre o amadurecimento e personagens excêntricos como o Chapeleiro Maluco.',
    image: 'https://i.imgur.com/CH8MwS0.jpeg',
    category: 'cinema' as const,
    genre: 'infantil',
    approved: true,
  },
  {
    title: 'Até o Último Homem',
    location: 'CCSP',
    address: 'Av. Paulista, 900 - Bela Vista, São Paulo',
    date: new Date('2026-06-08T18:00:00'),
    description: 'A impressionante história real de Desmond Doss, um médico do exército americano que, por motivos religiosos, se recusou a portar armas e salvou 75 homens na Segunda Guerra Mundial.',
    image: 'https://i.imgur.com/OtnVjut.jpeg',
    category: 'cinema' as const,
    genre: 'drama',
    approved: true,
  },
  {
    title: 'Bagagem de Risco',
    location: 'Biblioteca Mário de Andrade',
    address: 'Rua 7 de Abril, 230 - Centro, São Paulo',
    date: new Date('2026-06-11T20:00:00'),
    description: 'Thriller de alta tensão focado em um jovem agente de segurança de aeroporto que é chantageado por um viajante misterioso na véspera de Natal, iniciando uma corrida contra o tempo.',
    image: 'https://i.imgur.com/3ZmV4kR.jpeg',
    category: 'cinema' as const,
    genre: 'acao',
    approved: true,
  },
  {
    title: 'Formula 1',
    location: 'Centro Cultural BB',
    address: 'Rua Álvares Penteado, 112 - Centro, São Paulo',
    date: new Date('2026-06-14T19:00:00'),
    description: 'Documentário imersivo que vai além dos cockpits, revelando a engenharia de ponta, as rivalidades históricas e a intensa pressão psicológica sofrida pelos pilotos na categoria máxima do automobilismo.',
    image: 'https://i.imgur.com/QinomOQ.jpeg',
    category: 'cinema' as const,
    genre: 'documentario',
    approved: true,
  },
  {
    title: 'Interestelar',
    location: 'Sesc Pompeia',
    address: 'Rua Clélia, 93 - Pompeia, São Paulo',
    date: new Date('2026-06-17T19:00:00'),
    description: 'Ficção científica épica de Christopher Nolan que combina física quântica, buracos de minhoca e dilatação temporal com uma emocionante jornada sobre o amor de um pai e a sobrevivência da humanidade.',
    image: 'https://i.imgur.com/Et1JYuW.jpeg',
    category: 'cinema' as const,
    genre: 'ficcao',
    approved: true,
  },
  {
    title: 'Marty Supreme',
    location: 'Cinemateca Brasileira',
    address: 'Largo Sen. Felipe Schmidt, 64 - Consolação, São Paulo',
    date: new Date('2026-06-20T18:30:00'),
    description: 'Inspirado na vida do excêntrico jogador de ping-pong Marty Reisman, o longa explora a vibrante e estilosa subcultura do esporte profissional americano na década de 1950.',
    image: 'https://i.imgur.com/7hPOcbt.jpeg',
    category: 'cinema' as const,
    genre: 'drama',
    approved: true,
  },
  {
    title: 'Os Pecadores',
    location: 'Museu de Arte de SP',
    address: 'Av. Paulista, 1578 - Bela Vista, São Paulo',
    date: new Date('2026-06-23T20:00:00'),
    description: 'Um drama denso e instigante que investiga os limites da moralidade, segredos de família ocultos e o impacto do dogmatismo religioso no cotidiano de uma comunidade isolada.',
    image: 'https://i.imgur.com/7CKbjYI.jpeg',
    category: 'cinema' as const,
    genre: 'drama',
    approved: true,
  },
  {
    title: 'Tropa de Elite',
    location: 'Centro Cultural SP',
    address: 'Av. São João, 288 - Centro, São Paulo',
    date: new Date('2026-06-26T18:00:00'),
    description: 'O visceral e aclamado retrato do combate ao tráfico no Rio de Janeiro sob a ótica do Capitão Nascimento, expondo as entranhas da corrupção policial e o treinamento implacável do BOPE.',
    image: 'https://i.imgur.com/0lasSWW.jpeg',
    category: 'cinema' as const,
    genre: 'acao',
    approved: true,
  },
  {
    title: 'Velozes e Furiosos 6',
    location: 'TeatroMundo',
    address: 'Rua XV de Novembro, 500 - Centro, São Paulo',
    date: new Date('2026-06-29T19:30:00'),
    description: 'Ação de alta octanagem pelas ruas de Londres, onde Dom Toretto e sua equipe se unem ao agente Hobbs para derrubar uma organização rival de mercenários em troca do perdão de seus crimes.',
    image: 'https://i.imgur.com/U0luBuP.jpeg',
    category: 'cinema' as const,
    genre: 'acao',
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
    genre: {
      type: String,
      enum: ['geral','comedia','drama','infantil','animacao','documentario','acao','romance','ficcao'],
      default: 'geral',
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

