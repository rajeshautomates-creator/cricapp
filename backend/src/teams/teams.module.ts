// Teams Module
import { Module } from '@nestjs/common';
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IsString, IsOptional } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class CreateTeamDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    shortName?: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsString()
    @IsOptional()
    captain?: string;

    @IsString()
    @IsOptional()
    coach?: string;

    @IsString()
    tournamentId: string;
}

export class UpdateTeamDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    shortName?: string;

    @IsString()
    @IsOptional()
    logoUrl?: string;

    @IsString()
    @IsOptional()
    captain?: string;

    @IsString()
    @IsOptional()
    coach?: string;
}

@Injectable()
export class TeamsService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreateTeamDto, userId: string, userRole: UserRole) {
        // Verify tournament ownership
        const tournament = await this.prisma.tournament.findUnique({
            where: { id: dto.tournamentId },
        });

        if (!tournament) {
            throw new NotFoundException('Tournament not found');
        }

        if (userRole !== UserRole.SUPER_ADMIN && tournament.adminId !== userId) {
            throw new ForbiddenException('You can only add teams to your own tournaments');
        }

        const team = await this.prisma.team.create({
            data: dto,
            include: {
                tournament: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return team;
    }

    async findAll(tournamentId?: string) {
        const where = tournamentId ? { tournamentId } : {};

        const teams = await this.prisma.team.findMany({
            where,
            include: {
                tournament: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                _count: {
                    select: {
                        players: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return teams;
    }

    async findOne(id: string) {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: {
                tournament: true,
                players: {
                    orderBy: { jerseyNumber: 'asc' },
                },
            },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        return team;
    }

    async update(id: string, dto: UpdateTeamDto, userId: string, userRole: UserRole) {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: { tournament: true },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        if (userRole !== UserRole.SUPER_ADMIN && team.tournament.adminId !== userId) {
            throw new ForbiddenException('You can only update teams in your own tournaments');
        }

        const updated = await this.prisma.team.update({
            where: { id },
            data: dto,
        });

        return updated;
    }

    async remove(id: string, userId: string, userRole: UserRole) {
        const team = await this.prisma.team.findUnique({
            where: { id },
            include: { tournament: true },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        if (userRole !== UserRole.SUPER_ADMIN && team.tournament.adminId !== userId) {
            throw new ForbiddenException('You can only delete teams from your own tournaments');
        }

        await this.prisma.team.delete({
            where: { id },
        });

        return { message: 'Team deleted successfully' };
    }
}

@Controller('teams')
@UseGuards(JwtAuthGuard)
export class TeamsController {
    constructor(private teamsService: TeamsService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async create(@Body() dto: CreateTeamDto, @Req() req) {
        return this.teamsService.create(dto, req.user.userId, req.user.role);
    }

    @Get()
    async findAll(@Query('tournamentId') tournamentId?: string) {
        return this.teamsService.findAll(tournamentId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.teamsService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async update(@Param('id') id: string, @Body() dto: UpdateTeamDto, @Req() req) {
        return this.teamsService.update(id, dto, req.user.userId, req.user.role);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async remove(@Param('id') id: string, @Req() req) {
        return this.teamsService.remove(id, req.user.userId, req.user.role);
    }
}

@Module({
    controllers: [TeamsController],
    providers: [TeamsService],
    exports: [TeamsService],
})
export class TeamsModule { }
