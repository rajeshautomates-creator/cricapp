export type UserRole = 'SUPER_ADMIN' | 'ADMIN' | 'VIEWER';

export interface User {
    id: string;
    email: string;
    fullName: string;
    role: UserRole;
    hasActiveSubscription: boolean;
    createdAt: string;
}

export interface AuthResponse {
    user: User;
    accessToken: string;
    refreshToken: string;
}
