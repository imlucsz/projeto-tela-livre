import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';
import { UserRole } from '@/lib/models/User';

// Carregar variáveis de ambiente
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

/**
 * Script para promover um usuário a ADMIN
 * Use: npx tsx scripts/make-admin.ts
 */
async function makeAdmin() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await connectDB();
    console.log('✅ Conectado!\n');
    
    const email = 'luc@gmail.com';
    
    console.log(`🔍 Procurando usuário: ${email}...`);
    
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log('❌ Usuário não encontrado! Criando novo usuário ADMIN...\n');
      
      // Se não existe, criar novo
      const newUser = await User.create({
        name: 'Lucas Admin',
        email: email.toLowerCase().trim(),
        password: '@FatecSenha123', // Mude isso depois!
        role: UserRole.ADMIN
      });
      
      console.log('✅ ADMIN criado com sucesso!\n');
      console.log(`📧 Email: ${newUser.email}`);
      console.log(`👤 Role: ${newUser.role}`);
      console.log(`\n🔑 Credenciais para Login:`);
      console.log(`   Email: ${email}`);
      console.log(`   Senha: senha123456`);
      console.log(`\n⚠️  MUDE A SENHA APÓS PRIMEIRO LOGIN!\n`);
    } else {
      console.log(`✅ Usuário encontrado!\n`);
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Role Atual: ${user.role}\n`);
      
      if (user.role === UserRole.ADMIN) {
        console.log('✅ Já é ADMIN! Nada a fazer.\n');
      } else {
        // Promover a ADMIN
        user.role = UserRole.ADMIN;
        await user.save();
        console.log('✅ Promovido para ADMIN com sucesso!\n');
        console.log(`🔑 Credenciais:`);
        console.log(`   Email: ${email}`);
        console.log(`   Senha: (use a senha registrada)\n`);
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

makeAdmin();
