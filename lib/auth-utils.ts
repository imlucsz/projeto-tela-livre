import { ROLES, RoleType, hasPermission } from '@/lib/constants'
import { Session } from 'next-auth'

/**
 * Valida se o usuário tem a role necessária
 * 
 * @example
 * hasRole(session, ROLES.NGO)
 * hasRole(session, [ROLES.NGO, ROLES.ADMIN])
 */
export function hasRole(
  session: Session | null,
  requiredRole: RoleType | RoleType[]
): boolean {
  if (!session?.user) return false

  const userRole = session.user.role as RoleType
  const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]

  return roles.includes(userRole)
}

/**
 * Valida se é um usuário comum (USER role)
 */
export function isUser(session: Session | null): boolean {
  return hasRole(session, ROLES.USER)
}

/**
 * Valida se é uma ONG (NGO role)
 */
export function isNgo(session: Session | null): boolean {
  return hasRole(session, ROLES.NGO)
}

/**
 * Valida se é um admin (ADMIN role)
 */
export function isAdmin(session: Session | null): boolean {
  return hasRole(session, ROLES.ADMIN)
}

/**
 * Valida se é ONG ou Admin (podem criar eventos)
 */
export function isNgoOrAdmin(session: Session | null): boolean {
  return hasRole(session, [ROLES.NGO, ROLES.ADMIN])
}

/**
 * Validar se usuário tem permissão para uma ação
 * 
 * @example
 * canUserAction(session, 'create_events')
 */
export function canUserAction(session: Session | null, action: string): boolean {
  if (!session?.user) return false
  const userRole = session.user.role as RoleType
  return hasPermission(userRole, action)
}

/**
 * Para usar em Server Actions ou Route Handlers
 * Garante que o usuário tem a role requerida ou lança erro
 * 
 * @example
 * await requireRole(session, ROLES.NGO)
 */
export async function requireRole(
  session: Session | null,
  requiredRole: RoleType | RoleType[]
): Promise<void> {
  if (!hasRole(session, requiredRole)) {
    throw new Error('Acesso negado: permissão insuficiente')
  }
}

/**
 * Para usar em Server Actions ou Route Handlers
 * Garante que é NGO
 */
export async function requireNgo(session: Session | null): Promise<void> {
  if (!isNgo(session)) {
    throw new Error('Acesso negado: apenas ONGs podem acessar este recurso')
  }
}

/**
 * Para usar em Server Actions ou Route Handlers
 * Garante que é Admin
 */
export async function requireAdmin(session: Session | null): Promise<void> {
  if (!isAdmin(session)) {
    throw new Error('Acesso negado: apenas administradores podem acessar este recurso')
  }
}

/**
 * Para usar em Route Handlers com tratamento de erro
 * 
 * @example
 * try {
 *   const role = assertRole(session, ROLES.ADMIN)
 *   // role é type-safe como ROLES.ADMIN
 * } catch (e) {
 *   return NextResponse.json({error: e.message}, {status: 403})
 * }
 */
export function assertRole(
  session: Session | null,
  requiredRole: RoleType
): RoleType {
  if (!hasRole(session, requiredRole)) {
    throw new Error('Acesso negado: permissão insuficiente')
  }
  return requiredRole as RoleType
}
