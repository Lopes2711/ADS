export type Role = 'ADMIN' | 'COORDINATOR' | 'PROFESSOR' | 'STUDENT';

/**
 * Mapeamento de rotas permitidas por Role de acordo com o Diagrama de Casos de Uso:
 * - ADMIN (Gestor de Horários): Req. 2 (Importar, Configurar Regras, Validar Horário), Req. 4 (Alocação e Sugestão de Salas), Geral (Horários) e Gestão de Utilizadores.
 * - COORDINATOR (Diretor de Curso): Req. 2 (Validar Horário e Consultar Violações), Req. 8 (Trocar Docente, Desdobrar Turno, Simular Impacto), Geral (Horários).
 * - PROFESSOR (Docente): Geral (Consultar Horário Publicado), Req. 8 (Registar Indisponibilidade).
 * - STUDENT (Estudante): Geral (Consultar Horário Publicado).
 */
export const ROUTE_ROLES: Record<string, Role[]> = {
  '/home': ['ADMIN', 'COORDINATOR', 'PROFESSOR', 'STUDENT'],
  '/horarios': ['ADMIN', 'COORDINATOR', 'PROFESSOR', 'STUDENT'],
  '/regras': ['ADMIN', 'COORDINATOR'],
  '/alocacao': ['ADMIN'],
  '/mudancas': ['COORDINATOR', 'PROFESSOR'],
  '/importar': ['ADMIN'],
  '/utilizadores': ['ADMIN', 'COORDINATOR', 'PROFESSOR', 'STUDENT'],
};

export function canAccessRoute(role: string | null | undefined, route: string): boolean {
  if (!role) return false;
  const allowed = ROUTE_ROLES[route];
  if (!allowed) return false;
  return allowed.includes(role as Role);
}

