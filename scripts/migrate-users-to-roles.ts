/**
 * Script de Migração: Convertendo isNgo (boolean) para role (enum)
 * 
 * INSTRUÇÕES:
 * 1. Execute este script uma única vez no seu banco de dados
 * 2. Ele converterá todos os usuarios existentes:
 *    - isNgo: false → role: 'USER'
 *    - isNgo: true  → role: 'NGO'
 * 3. Após a migração, você pode remover o campo isNgo do schema
 * 
 * COMO USAR:
 * Opção 1: Execute via Node.js
 *   node -r ts-node/register scripts/migrate-users-to-roles.ts
 * 
 * Opção 2: Execute dentro de um Route Handler temporário
 *   - Crie a rota em /api/admin/migrate
 *   - Cole a função migrateUsersToRoles() como export handler
 *   - Acesse POST /api/admin/migrate (proteja com admin check!)
 */

import { connectDB } from '@/lib/mongodb'
import User, { UserRole } from '@/lib/models/User'

/**
 * Função de migração principal
 */
export async function migrateUsersToRoles() {
  try {
    await connectDB()

    console.log('🔄 Iniciando migração de usuários...')

    // Buscar todos os usuários que ainda têm o campo legado isNgo
    const usersWithIsNgo = await User.find({ 
      $or: [
        { isNgo: true },
        { isNgo: false, role: { $exists: false } }
      ]
    })

    console.log(`📊 Encontrados ${usersWithIsNgo.length} usuários para migrar`)

    if (usersWithIsNgo.length === 0) {
      console.log('✅ Nenhum usuário para migrar. Sistema já está atualizado!')
      return { success: true, migrated: 0 }
    }

    // Migrar cada usuário
    let migratedCount = 0
    for (const user of usersWithIsNgo) {
      try {
        // Converter isNgo para role baseado no booleano antigo
        if (user.isNgo === true) {
          user.role = UserRole.NGO
        } else {
          user.role = UserRole.USER
        }

        // Remover o campo legado (opcional - deixar por enquanto para backup)
        // user.isNgo = undefined

        await user.save()
        migratedCount++
        console.log(`✓ ${user.email}: ${user.role}`)
      } catch (err) {
        console.error(`✗ Erro ao migrar ${user.email}:`, err)
      }
    }

    console.log(`\n✅ Migração concluída! ${migratedCount}/${usersWithIsNgo.length} usuários migrados`)
    
    return {
      success: true,
      migrated: migratedCount,
      total: usersWithIsNgo.length
    }
  } catch (error) {
    console.error('❌ Erro na migração:', error)
    throw error
  }
}

/**
 * Verificar status da migração
 */
export async function checkMigrationStatus() {
  try {
    await connectDB()

    const stats = {
      totalUsers: await User.countDocuments(),
      usersWithRole: await User.countDocuments({ role: { $exists: true } }),
      usersWithoutRole: await User.countDocuments({ role: { $exists: false } }),
      roleBreakdown: await User.aggregate([
        {
          $group: {
            _id: '$role',
            count: { $sum: 1 }
          }
        }
      ])
    }

    console.log('📊 Status da Migração:')
    console.log(`   Total de usuários: ${stats.totalUsers}`)
    console.log(`   Com role: ${stats.usersWithRole}`)
    console.log(`   Sem role: ${stats.usersWithoutRole}`)
    console.log('   Distribuição por role:')
    stats.roleBreakdown.forEach(item => {
      console.log(`      ${item._id || 'undefined'}: ${item.count}`)
    })

    return stats
  } catch (error) {
    console.error('❌ Erro ao verificar status:', error)
    throw error
  }
}

/**
 * Limpar o campo legado (execute APÓS garantir que todos têm role)
 */
export async function cleanupLegacyField() {
  try {
    await connectDB()

    console.log('🧹 Removendo campo legado isNgo...')

    const result = await User.updateMany(
      { isNgo: { $exists: true } },
      { $unset: { isNgo: '' } }
    )

    console.log(`✅ ${result.modifiedCount} documentos limpos`)
    return result
  } catch (error) {
    console.error('❌ Erro ao limpar:', error)
    throw error
  }
}
