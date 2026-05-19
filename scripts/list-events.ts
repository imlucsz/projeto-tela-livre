import { connectDB } from '../lib/mongodb';
import Event from '../lib/models/Event';

async function listEvents() {
  try {
    await connectDB();
    
    const events = await Event.find()
      .select('_id title approved featured category date')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    if (events.length === 0) {
      console.log('✗ Nenhum evento encontrado no banco de dados');
      return;
    }

    console.log('\n📹 EVENTOS NO BANCO DE DADOS:\n');
    events.forEach((event: any, index: number) => {
      console.log(`${index + 1}. ${event.title}`);
      console.log(`   ID: ${event._id}`);
      console.log(`   Aprovado: ${event.approved ? '✓ Sim' : '✗ Não'}`);
      console.log(`   Destaque: ${event.featured ? '⭐ Sim' : 'Não'}`);
      console.log(`   Categoria: ${event.category}`);
      console.log(`   Data: ${new Date(event.date).toLocaleDateString('pt-BR')}`);
      console.log(`   Link: http://localhost:3000/event/${event._id}\n`);
    });

    // Estatísticas
    const approved = events.filter((e: any) => e.approved).length;
    const featured = events.filter((e: any) => e.featured).length;
    console.log(`\n📊 RESUMO:`);
    console.log(`   Total: ${events.length}`);
    console.log(`   Aprovados: ${approved}`);
    console.log(`   Em Destaque: ${featured}`);
  } catch (error) {
    console.error('Erro ao listar eventos:', error);
    process.exit(1);
  }
}

listEvents();
