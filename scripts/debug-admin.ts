import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from '@/lib/mongodb';
import User from '@/lib/models/User';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function debugAdmin() {
  try {
    console.log('🔗 Conectando ao banco de dados...');
    await connectDB();
    console.log('✅ Conectado!\n');
    
    const email = 'luc@gmail.com';
    
    console.log(`🔍 Procurando usuário: ${email}...`);
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    
    if (!user) {
      console.log('❌ Usuário NÃO ENCONTRADO no banco!\n');
      console.log('Todos os usuários no banco:');
      const allUsers = await User.find().select('email role -_id');
      allUsers.forEach(u => {
        console.log(`  📧 ${u.email} → role: "${u.role}" (type: ${typeof u.role})`);
      });
    } else {
      console.log('✅ Usuário ENCONTRADO!\n');
      console.log(`📧 Email: ${user.email}`);
      console.log(`👤 Role no banco: "${user.role}" (type: ${typeof user.role})`);
      console.log(`🔐 Senha hash length: ${user.password?.length}`);
      console.log(`🚫 Banned: ${user.isBanned}`);
      console.log(`\n🆔 ID: ${user._id}`);
      
      // Validações
      console.log('\n🔍 VALIDAÇÕES:');
      console.log(`  ✓ role === "ADMIN"? ${user.role === 'ADMIN'}`);
      console.log(`  ✓ role === "admin"? ${user.role === 'admin'}`);
      console.log(`  ✓ role.toUpperCase() === "ADMIN"? ${user.role?.toString().toUpperCase() === 'ADMIN'}`);
      
      if (user.role !== 'ADMIN') {
        console.log('\n⚠️  PROBLEMA ENCONTRADO!');
        console.log(`   Role está como "${user.role}" mas código espera "ADMIN"`);
        console.log('   CORRIGINDO...');
        
        user.role = 'ADMIN';
        await user.save();
        console.log('✅ Role corrigido para "ADMIN"!');
      } else {
        console.log('\n✅ Role está CORRETO!');
      }
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro:', error);
    process.exit(1);
  }
}

debugAdmin();
