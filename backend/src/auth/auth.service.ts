import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async register(dto: RegisterDto) {
        // Check if user already exists
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });

        if (existingUser) {
            throw new ConflictException('User with this email already exists');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(dto.password, 10);

        // Create user
        const user = await this.prisma.user.create({
            data: {
                email: dto.email,
                password: hashedPassword,
                fullName: dto.fullName,
                role: UserRole.VIEWER, // Default role
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                createdAt: true,
            },
        });

        return {
            message: 'User registered successfully',
            user,
        };
    }

    async login(dto: LoginDto) {
        // Find user
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
            include: {
                adminPurchase: true,
                viewerSubscription: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Verify password
        const passwordValid = await bcrypt.compare(dto.password, user.password);
        if (!passwordValid) {
            throw new UnauthorizedException('Invalid credentials');
        }

        // Generate tokens
        const tokens = await this.generateTokens(user.id, user.email, user.role);

        // Save refresh token
        await this.saveRefreshToken(user.id, tokens.refreshToken);

        // Return user data (without password) and tokens
        const { password, ...userWithoutPassword } = user;

        return {
            user: {
                ...userWithoutPassword,
                hasActiveSubscription: this.checkActiveSubscription(user),
            },
            ...tokens,
        };
    }

    async refreshTokens(refreshToken: string) {
        try {
            // Verify refresh token
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
            });

            // Check if refresh token exists in database
            const storedToken = await this.prisma.refreshToken.findFirst({
                where: {
                    token: refreshToken,
                    userId: payload.sub,
                },
            });

            if (!storedToken) {
                throw new UnauthorizedException('Invalid refresh token');
            }

            // Check if token is expired
            if (storedToken.expiresAt < new Date()) {
                await this.prisma.refreshToken.delete({
                    where: { id: storedToken.id },
                });
                throw new UnauthorizedException('Refresh token expired');
            }

            // Generate new tokens
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            const tokens = await this.generateTokens(user.id, user.email, user.role);

            // Delete old refresh token and save new one
            await this.prisma.refreshToken.delete({
                where: { id: storedToken.id },
            });
            await this.saveRefreshToken(user.id, tokens.refreshToken);

            return tokens;
        } catch (error) {
            throw new UnauthorizedException('Invalid refresh token');
        }
    }

    async logout(userId: string, refreshToken: string) {
        // Delete specific refresh token
        await this.prisma.refreshToken.deleteMany({
            where: {
                userId,
                token: refreshToken,
            },
        });

        return { message: 'Logged out successfully' };
    }

    async getCurrentUser(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            include: {
                adminPurchase: true,
                viewerSubscription: true,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                createdAt: true,
                adminPurchase: true,
                viewerSubscription: true,
            },
        });

        if (!user) {
            throw new UnauthorizedException('User not found');
        }

        return {
            ...user,
            hasActiveSubscription: this.checkActiveSubscription(user),
        };
    }

    private async generateTokens(userId: string, email: string, role: UserRole) {
        const payload = { sub: userId, email, role };

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_ACCESS_SECRET'),
                expiresIn: this.configService.get('JWT_ACCESS_EXPIRY') || '15m',
            }),
            this.jwtService.signAsync(payload, {
                secret: this.configService.get('JWT_REFRESH_SECRET'),
                expiresIn: this.configService.get('JWT_REFRESH_EXPIRY') || '7d',
            }),
        ]);

        return {
            accessToken,
            refreshToken,
        };
    }

    private async saveRefreshToken(userId: string, token: string) {
        const expiryDays = 7;
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + expiryDays);

        await this.prisma.refreshToken.create({
            data: {
                token,
                userId,
                expiresAt,
            },
        });
    }

    private checkActiveSubscription(user: any): boolean {
        if (user.role === UserRole.SUPER_ADMIN) {
            return true;
        }

        if (user.role === UserRole.ADMIN) {
            return (
                user.adminPurchase?.status === 'completed' &&
                user.adminPurchase?.expiryDate &&
                new Date(user.adminPurchase.expiryDate) > new Date()
            );
        }

        if (user.role === UserRole.VIEWER) {
            return (
                user.viewerSubscription?.isActive &&
                user.viewerSubscription?.expiryDate &&
                new Date(user.viewerSubscription.expiryDate) > new Date()
            );
        }

        return false;
    }
}
