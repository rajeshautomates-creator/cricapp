import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto, UpdateUserDto, ChangeRoleDto } from './dto/user.dto';
import { UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateUserDto) {
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
                role: dto.role || UserRole.VIEWER,
            },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                createdAt: true,
            },
        });

        return user;
    }

    async findAll(page: number = 1, limit: number = 10) {
        const skip = (page - 1) * limit;

        const [users, total] = await Promise.all([
            this.prisma.user.findMany({
                skip,
                take: limit,
                select: {
                    id: true,
                    email: true,
                    fullName: true,
                    role: true,
                    createdAt: true,
                    adminPurchase: true,
                    viewerSubscription: true,
                },
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.user.count(),
        ]);

        return {
            data: users,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const user = await this.prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                createdAt: true,
                updatedAt: true,
                adminPurchase: true,
                viewerSubscription: true,
                tournaments: {
                    select: {
                        id: true,
                        name: true,
                        status: true,
                    },
                },
            },
        });

        if (!user) {
            throw new NotFoundException('User not found');
        }

        return user;
    }

    async update(id: string, dto: UpdateUserDto) {
        const user = await this.prisma.user.update({
            where: { id },
            data: dto,
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
                updatedAt: true,
            },
        });

        return user;
    }

    async remove(id: string, requestUserId: string) {
        // Prevent self-deletion
        if (id === requestUserId) {
            throw new ForbiddenException('Cannot delete your own account');
        }

        await this.prisma.user.delete({
            where: { id },
        });

        return { message: 'User deleted successfully' };
    }

    async changeRole(id: string, dto: ChangeRoleDto) {
        const user = await this.prisma.user.update({
            where: { id },
            data: { role: dto.role },
            select: {
                id: true,
                email: true,
                fullName: true,
                role: true,
            },
        });

        return user;
    }

    async getStats(userId: string, userRole: UserRole) {
        if (userRole === UserRole.SUPER_ADMIN) {
            // Global stats for superadmin
            const [usersCount, adminsCount, subscribersCount, tournamentsCount] = await Promise.all([
                this.prisma.user.count(),
                this.prisma.user.count({ where: { role: UserRole.ADMIN } }),
                this.prisma.viewerSubscription.count({ where: { isActive: true } }),
                this.prisma.tournament.count(),
            ]);

            return {
                totalUsers: usersCount,
                totalAdmins: adminsCount,
                activeSubscribers: subscribersCount,
                totalTournaments: tournamentsCount,
            };
        }

        // Admin stats
        const tournaments = await this.prisma.tournament.count({
            where: { adminId: userId },
        });

        const teams = await this.prisma.team.count({
            where: { tournament: { adminId: userId } },
        });

        const matches = await this.prisma.match.count({
            where: { tournament: { adminId: userId } },
        });

        const liveMatches = await this.prisma.match.count({
            where: {
                tournament: { adminId: userId },
                status: 'LIVE',
            },
        });

        return {
            tournaments,
            teams,
            matches,
            liveMatches,
        };
    }
}
