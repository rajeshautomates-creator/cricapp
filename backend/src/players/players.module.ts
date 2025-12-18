// Players Module
import { Module } from '@nestjs/common';
import { Controller, Get, Post, Patch, Delete, Param, Body, UseGuards, Req, Query } from '@nestjs/common';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IsString, IsOptional, IsInt } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class CreatePlayerDto {
    @IsString()
    name: string;

    @IsString()
    @IsOptional()
    role?: string;

    @IsString()
    @IsOptional()
    battingStyle?: string;

    @IsString()
    @IsOptional()
    bowlingStyle?: string;

    @IsInt()
    @IsOptional()
    jerseyNumber?: number;

    @IsString()
    teamId: string;
}

export class UpdatePlayerDto {
    @IsString()
    @IsOptional()
    name?: string;

    @IsString()
    @IsOptional()
    role?: string;

    @IsString()
    @IsOptional()
    battingStyle?: string;

    @IsString()
    @IsOptional()
    bowlingStyle?: string;

    @IsInt()
    @IsOptional()
    jerseyNumber?: number;
}

@Injectable()
export class PlayersService {
    constructor(private prisma: PrismaService) { }

    async create(dto: CreatePlayerDto, userId: string, userRole: UserRole) {
        const team = await this.prisma.team.findUnique({
            where: { id: dto.teamId },
            include: { tournament: true },
        });

        if (!team) {
            throw new NotFoundException('Team not found');
        }

        if (userRole !== UserRole.SUPER_ADMIN && team.tournament.adminId !== userId) {
            throw new ForbiddenException('You can only add players to teams in your tournaments');
        }

        const player = await this.prisma.player.create({
            data: dto,
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });

        return player;
    }

    async findAll(teamId?: string) {
        const where = teamId ? { teamId } : {};

        const players = await this.prisma.player.findMany({
            where,
            include: {
                team: {
                    select: {
                        id: true,
                        name: true,
                        shortName: true,
                    },
                },
            },
            orderBy: { jerseyNumber: 'asc' },
        });

        return players;
    }

    async findOne(id: string) {
        const player = await this.prisma.player.findUnique({
            where: { id },
            include: {
                team: {
                    include: {
                        tournament: true,
                    },
                },
            },
        });

        if (!player) {
            throw new NotFoundException('Player not found');
        }

        return player;
    }

    async update(id: string, dto: UpdatePlayerDto, userId: string, userRole: UserRole) {
        const player = await this.prisma.player.findUnique({
            where: { id },
            include: {
                team: {
                    include: { tournament: true },
                },
            },
        });

        if (!player) {
            throw new NotFoundException('Player not found');
        }

        if (userRole !== UserRole.SUPER_ADMIN && player.team.tournament.adminId !== userId) {
            throw new ForbiddenException('You can only update players in your tournaments');
        }

        const updated = await this.prisma.player.update({
            where: { id },
            data: dto,
        });

        return updated;
    }

    async remove(id: string, userId: string, userRole: UserRole) {
        const player = await this.prisma.player.findUnique({
            where: { id },
            include: {
                team: {
                    include: { tournament: true },
                },
            },
        });

        if (!player) {
            throw new NotFoundException('Player not found');
        }

        if (userRole !== UserRole.SUPER_ADMIN && player.team.tournament.adminId !== userId) {
            throw new ForbiddenException('You can only delete players from your tournaments');
        }

        await this.prisma.player.delete({
            where: { id },
        });

        return { message: 'Player deleted successfully' };
    }
}

@Controller('players')
@UseGuards(JwtAuthGuard)
export class PlayersController {
    constructor(private playersService: PlayersService) { }

    @Post()
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async create(@Body() dto: CreatePlayerDto, @Req() req) {
        return this.playersService.create(dto, req.user.userId, req.user.role);
    }

    @Get()
    async findAll(@Query('teamId') teamId?: string) {
        return this.playersService.findAll(teamId);
    }

    @Get(':id')
    async findOne(@Param('id') id: string) {
        return this.playersService.findOne(id);
    }

    @Patch(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async update(@Param('id') id: string, @Body() dto: UpdatePlayerDto, @Req() req) {
        return this.playersService.update(id, dto, req.user.userId, req.user.role);
    }

    @Delete(':id')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async remove(@Param('id') id: string, @Req() req) {
        return this.playersService.remove(id, req.user.userId, req.user.role);
    }
}

@Module({
    controllers: [PlayersController],
    providers: [PlayersService],
    exports: [PlayersService],
})
export class PlayersModule { }
