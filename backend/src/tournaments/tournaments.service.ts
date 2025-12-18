import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTournamentDto, UpdateTournamentDto } from './dto/tournament.dto';
import { UserRole } from '@prisma/client';

@Injectable()
export class TournamentsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateTournamentDto, userId: string) {
        const tournament = await this.prisma.tournament.create({
            data: {
                ...dto,
                startDate: new Date(dto.startDate),
                endDate: new Date(dto.endDate),
                adminId: userId,
            },
            include: {
                admin: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
            },
        });

        return tournament;
    }

    async findAll(userId?: string, userRole?: UserRole) {
        const where = userRole === UserRole.ADMIN && userId ? { adminId: userId } : {};

        const tournaments = await this.prisma.tournament.findMany({
            where,
            include: {
                admin: {
                    select: {
                        id: true,
                        fullName: true,
                    },
                },
                _count: {
                    select: {
                        teams: true,
                        matches: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return tournaments;
    }

    async findOne(id: string) {
        const tournament = await this.prisma.tournament.findUnique({
            where: { id },
            include: {
                admin: {
                    select: {
                        id: true,
                        email: true,
                        fullName: true,
                    },
                },
                teams: {
                    select: {
                        id: true,
                        name: true,
                        shortName: true,
                        logoUrl: true,
                    },
                },
                matches: {
                    select: {
                        id: true,
                        matchDate: true,
                        venue: true,
                        status: true,
                        teamA: {
                            select: {
                                id: true,
                                name: true,
                                shortName: true,
                            },
                        },
                        teamB: {
                            select: {
                                id: true,
                                name: true,
                                shortName: true,
                            },
                        },
                    },
                    orderBy: { matchDate: 'asc' },
                },
            },
        });

        if (!tournament) {
            throw new NotFoundException('Tournament not found');
        }

        return tournament;
    }

    async update(id: string, dto: UpdateTournamentDto, userId: string, userRole: UserRole) {
        const tournament = await this.prisma.tournament.findUnique({
            where: { id },
        });

        if (!tournament) {
            throw new NotFoundException('Tournament not found');
        }

        // Only owner or super admin can update
        if (userRole !== UserRole.SUPER_ADMIN && tournament.adminId !== userId) {
            throw new ForbiddenException('You can only update your own tournaments');
        }

        const updateData: any = { ...dto };
        if (dto.startDate) updateData.startDate = new Date(dto.startDate);
        if (dto.endDate) updateData.endDate = new Date(dto.endDate);

        const updated = await this.prisma.tournament.update({
            where: { id },
            data: updateData,
        });

        return updated;
    }

    async remove(id: string, userId: string, userRole: UserRole) {
        const tournament = await this.prisma.tournament.findUnique({
            where: { id },
        });

        if (!tournament) {
            throw new NotFoundException('Tournament not found');
        }

        // Only owner or super admin can delete
        if (userRole !== UserRole.SUPER_ADMIN && tournament.adminId !== userId) {
            throw new ForbiddenException('You can only delete your own tournaments');
        }

        await this.prisma.tournament.delete({
            where: { id },
        });

        return { message: 'Tournament deleted successfully' };
    }
}
