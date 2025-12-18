// Matches Module
import { Module } from '@nestjs/common';
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IsString, IsOptional, IsDateString, IsInt, IsEnum } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole, MatchStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class CreateMatchDto {
    @IsString()
    tournamentId: string;

    @IsString()
    teamAId: string;

    @IsString()
    teamBId: string;

    @IsDateString()
    matchDate: string;

    @IsString()
    venue: string;

    @IsInt()
    @IsOptional()
    overs?: number;

    @IsEnum(MatchStatus)
    @IsOptional()
    status?: MatchStatus;
}

export class UpdateMatchDto {
    @IsDateString()
    @IsOptional()
    matchDate?: string;

    @IsString()
    @IsOptional()
    venue?: string;

    @IsInt()
    @IsOptional()
    overs?: number;

    @IsEnum(MatchStatus)
    @IsOptional()
    status?: MatchStatus;

    @IsString()
    @IsOptional()
    result?: string;
}

@Injectable()
export class MatchesService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateMatchDto, userId: string, userRole: UserRole) {
        const tournament = await this.prisma.tournament.findUnique({
            where: { id: dto.tournamentId },
        });

        if (!tournament) {
            throw new NotFoundException('Tournament not found');
        }

        if (userRole !== UserRole.SUPER_ADMIN && tournament.adminId !== userId) {
            throw new ForbiddenException('You can only schedule matches in your tournaments');
        }

        const match = await this.prisma.match.create({
            data: {
                ...dto,
                matchDate: new Date(dto.matchDate),
            },
            include: {
                tournament: true,
                teamA: true,
                teamB: true,
            },
        });

        // Create match score record
        await this.prisma.matchScore.create({
            data: {
                matchId: match.id,
                ballByBall: [],
            },
        });

        return match;
    }

    async findAll(tournamentId?: string, status?: MatchStatus) {
        const where: any = {};
        if (tournamentId) where.tournamentId = tournamentId;
        if (status) where.status = status;

        const matches = await this.prisma.match.findMany({
            where,
            include: {
                tournament: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                teamA: true,
                teamB: true,
                score: true,
            },
            orderBy: { matchDate: 'asc' },
        });

        return matches;
    }

    async findOne(id: string) {
        const match = await this.prisma.match.findUnique({
            where: { id },
            include: {
                tournament: true,
                teamA: {
                    include: {
                        players: true,
                    },
                },
                teamB: {
                    include: {
                        players: true,
                    },
                },
                score: true,
            },
        });

        if (!match) {
            throw new NotFoundException('Match not found');
        }

        return match;
    }

    async update(id: string, dto: UpdateMatchDto, userId: string, userRole: UserRole) {
        const match = await this.prisma.match.findUnique({
            where: { id },
            include: { tournament: true },
        });

        if (!match) {
            throw new NotFoundException('Match not found');
        }

        if (userRole !== UserRole.SUPER_ADMIN && match.tournament.adminId !== userId) {
            throw new ForbiddenException('You can only update matches in your tournaments');
        }

        const updateData: any = { ...dto };
        if (dto.matchDate) updateData.matchDate = new Date(dto.matchDate);

        const updated = await this.prisma.match.update({
            where: { id },
            data: updateData,
            include: {
                teamA: true,
                teamB: true,
                score: true,
            },
        });

        return updated;
    }

    async remove(id: string, userId: string, userRole: UserRole) {
        const match = await this.prisma.match.findUnique({
            where: { id },
            include: { tournament: true },
        });

        if (!match) {
            throw new NotFoundException('Match not found');
        }

        if (userRole !== UserRole.SUPER_ADMIN && match.tournament.adminId !== userId) {
            throw new ForbiddenException('You can only delete matches from your tournaments');
        }

        await this.prisma.match.delete({
            where: { id },
        });

        return { message: 'Match deleted successfully' };
    }
}

@Controller('matches')
@UseGuards(JwtAuthGuard)
export class MatchesController {
    constructor(private matchesService: MatchesService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async create(@Body() dto: CreateMatchDto, @Req() req) {
        return this.matchesService.create(dto, req.user.userId, req.user.role);
    }

    @Get()
    async findAll(@Query('tournamentId') tournamentId?: string, @Query('status') status?: MatchStatus) {
        return this.matchesService.findAll(tournamentId, status);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.matchesService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async update(@Param('id') id: string, @Body() dto: UpdateMatchDto, @Req() req) {
        return this.matchesService.update(id, dto, req.user.userId, req.user.role);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async remove(@Param('id') id: string, @Req() req) {
        return this.matchesService.remove(id, req.user.userId, req.user.role);
    }
}

@Module({
    controllers: [MatchesController],
    providers: [MatchesService],
    exports: [MatchesService],
})
export class MatchesModule { }
