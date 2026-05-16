import mongoose from "mongoose";

declare global {
  var mongoose: any;
}

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

export async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    // 1. Pegar a URI e limpar totalmente espaços, aspas e quebras de linha ocultas do Windows (\r)
    let rawUri = process.env.MONGO_URI || process.env.MONGODB_URI || '';
    rawUri = rawUri.trim().replace(/[\r\n"]/g, '');

    // 2. Para evitar bugs de parse de parâmetros na string (?appName=...&retryWrites=...),
    // vamos isolar apenas a URL base limpa do banco. O Mongoose gerencia os defaults perfeitamente.
    const uri = rawUri.includes('?') ? rawUri.split('?')[0] : rawUri;

    try {
      const masked = uri.replace(/(mongodb(?:\+srv)?:\/\/[^:]+:)[^@]+@/, '$1****@');
      console.log('[lib/mongodb] Conectando de forma limpa ao MONGO URI:', masked);
    } catch (e) {
      console.log('[lib/mongodb] Conectando ao MongoDB...');
    }

    const opts = {
      bufferCommands: false,
    };

    // 3. Criar a promise de conexão e limpar o cache caso ocorra erro (evita travar o app em rejeições antigas)
    cached.promise = mongoose.connect(uri, opts)
      .then((mongooseInstance) => {
        console.log('[lib/mongodb] Mongoose conectado com sucesso!');
        return mongooseInstance;
      })
      .catch((err) => {
        console.error('[lib/mongodb] Erro ao conectar via Mongoose:', err);
        cached.promise = null; // Reseta o cache de erro para permitir novas tentativas
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
  } catch (error) {
    cached.promise = null; // Garante limpeza caso a rejeição estoure no await
    throw error;
  }
  
  return cached.conn;
}