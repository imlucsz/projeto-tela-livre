import { connectDB } from '../lib/mongodb';
import Event from '../lib/models/Event';

/**
 * Script de migração para atribuir `genre` a eventos existentes.
 *
 * Como funciona:
 * - Busca eventos onde `genre` não existe, é nulo, vazio ou 'geral'.
 * - Analisa `title` + `description` por palavras-chave para inferir um gênero.
 * - Atualiza o documento com o gênero detectado (ou 'geral' se não houver detector).
 *
 * Uso:
 *   DRY_RUN=true node ./scripts/migrate-genres.ts   # apenas simula
 *   node ./scripts/migrate-genres.ts               # aplica as mudanças
 */

const KEYWORDS: Record<string, string[]> = {
  infantil: ['infantil', 'crian', 'kids', 'juvenil', 'infância'],
  animacao: ['anima', 'animação', 'animacao', 'animação', 'animado'],
  documentario: ['documentário', 'documentario', 'documental', 'doc'],
  comedia: ['comédia', 'comedia', 'humor', 'cômico', 'comico', 'stand-up', 'standup'],
  drama: ['drama', 'dramático', 'dramatico'],
  acao: ['ação', 'acao', 'aventura', 'tiro', 'luta', 'ação|acao'],
  romance: ['romance', 'amor', 'romântico', 'romantico'],
  ficcao: ['ficção', 'ficcao', 'sci-fi', 'sci fi', 'ficção científica', 'ficcao cientifica']
};

function detectGenre(text: string): string {
  const t = (text || '').toLowerCase();

  // Prioridade: infantil > animacao > documentario > comedia > drama > acao > romance > ficcao
  const priority = ['infantil','animacao','documentario','comedia','drama','acao','romance','ficcao'];

  for (const key of priority) {
    const kws = KEYWORDS[key] || [];
    for (const kw of kws) {
      if (kw && t.includes(kw)) return key;
    }
  }

  return 'geral';
}

async function migrate() {
  const DRY = !!process.env.DRY_RUN;
  console.log(`\n[Migration] Iniciando migração de gêneros (dry run=${DRY})`);

  try {
    await connectDB();

    const filter = {
      $or: [
        { genre: { $exists: false } },
        { genre: null },
        { genre: '' },
        { genre: 'geral' }
      ]
    };

    const events = await Event.find(filter).select('_id title description category').lean();

    if (!events || events.length === 0) {
      console.log('Nenhum evento encontrado que necessite migração.');
      process.exit(0);
    }

    console.log(`Encontrados ${events.length} eventos para analisar.`);

    let updated = 0;
    for (const ev of events) {
      const text = `${ev.title || ''} ${ev.description || ''} ${ev.category || ''}`;
      const guessed = detectGenre(text);

      if (!guessed || guessed === 'geral') {
        // Não identificou gênero específico; deixa como 'geral'
        if (DRY) {
          console.log(`[DRY] ${ev._id} -> manter 'geral' (não detectado)`);
        } else {
          // Atualiza explicitamente para garantir campo presente
          await Event.updateOne({ _id: ev._id }, { $set: { genre: 'geral' } });
          updated++;
          console.log(`${ev._id} -> definido gênero 'geral'`);
        }
      } else {
        if (DRY) {
          console.log(`[DRY] ${ev._id} -> ${guessed}`);
        } else {
          await Event.updateOne({ _id: ev._id }, { $set: { genre: guessed } });
          updated++;
          console.log(`${ev._id} -> definido gênero '${guessed}'`);
        }
      }
    }

    console.log(`\nMigração finalizada. Documentos atualizados: ${updated}`);
    process.exit(0);
  } catch (error) {
    console.error('Erro durante a migração de gêneros:', error);
    process.exit(1);
  }
}

migrate();
