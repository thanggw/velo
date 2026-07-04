export type Role = 'ADMIN' | 'MANAGER' | 'MEMBER';

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  role: Role;
  isActive?: boolean;
}
