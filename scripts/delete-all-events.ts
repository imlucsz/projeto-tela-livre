import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const mongoUriRaw = process.env.MONGO_URI || process.env.MONGODB_URI;
const mongoUri = mongoUriRaw?.trim();

if (!mongoUri) {
  throw new Error('MONGO_URI ou MONGODB_URI não está definido no .env.local');
}

async function deleteAllEvents() {
  try {
    console.log('🔗 Conectando ao MongoDB...');
    await mongoose.connect(mongoUri!, { bufferCommands: false });

    const eventCollection = mongoose.connection.collection('events');
    const countBefore = await eventCollection.countDocuments();
    console.log(`⚠️  Eventos presentes antes da exclusão: ${countBefore}`);

    if (countBefore === 0) {
      console.log('✅ Nenhum evento encontrado. Nada para apagar.');
      return;
    }

    const deleteResult = await eventCollection.deleteMany({});
    console.log(`🗑️  ${deleteResult.deletedCount} eventos apagados.`);
  } catch (error) {
    console.error('❌ Erro ao apagar eventos:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Conexão com MongoDB encerrada.');
  }
}

deleteAllEvents();
