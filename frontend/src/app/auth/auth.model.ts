export type Role = 'ROLE_USER' | 'ROLE_ADMIN';

export interface UserProfile {
  id: number;
  githubId?: string;
  username: string;
  name?: string;
  email?: string;
  avatarUrl?: string;
  role: Role;
  approved: boolean;
}

export interface AuthResponse {
  token?: string;
  tokenType?: string;
  user: UserProfile;
  message?: string;
}
