/**
 * Constantes e Tipos Centralizados de Role
 * 
 * Use este arquivo para:
 * - Definições únicas de role values
 * - Labels legíveis
 * - Validações consistentes
 * - Evitar typos ("NGO" vs "ngo")
 */

export const ROLES = {
  USER: "USER",
  NGO: "NGO",
  ADMIN: "ADMIN"
} as const;

export type RoleType = typeof ROLES[keyof typeof ROLES];

/**
 * Labels legíveis para exibição
 */
export const ROLE_LABELS: Record<RoleType, string> = {
  USER: "Usuário",
  NGO: "ONG",
  ADMIN: "Administrador"
};

/**
 * Descrições das roles para documentação
 */
export const ROLE_DESCRIPTIONS: Record<RoleType, string> = {
  USER: "Usuário comum que pode se inscrever em eventos",
  NGO: "Organização que pode criar e gerenciar eventos",
  ADMIN: "Administrador que gerencia o sistema TODO"
};

/**
 * Permissões por role (use para autorização granular no futuro)
 */
export const ROLE_PERMISSIONS: Record<RoleType, string[]> = {
  USER: ["view_events", "join_events", "leave_events"],
  NGO: [
    "view_events",
    "create_events",
    "edit_own_events",
    "delete_own_events",
    "view_own_participants",
    "manage_volunteers"
  ],
  ADMIN: [
    "view_all_events",
    "create_events",
    "edit_all_events",
    "delete_all_events",
    "approve_events",
    "manage_users",
    "manage_ngos",
    "view_analytics"
  ]
};

/**
 * Validar se uma role é válida
 * Type guard para garantir que role é um dos valores válidos
 */
export function isValidRole(role: unknown): role is RoleType {
  return typeof role === 'string' && Object.values(ROLES).includes(role as RoleType);
}

/**
 * Validar se uma role pode executar uma ação
 */
export function hasPermission(role: RoleType, permission: string): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/**
 * Roles que podem criar eventos
 */
export const CAN_CREATE_EVENTS = [ROLES.NGO, ROLES.ADMIN] as const;

/**
 * Roles que podem gerenciar usuários
 */
export const CAN_MANAGE_USERS = [ROLES.ADMIN] as const;

/**
 * Roles que podem aprovar eventos
 */
export const CAN_APPROVE_EVENTS = [ROLES.ADMIN] as const;
