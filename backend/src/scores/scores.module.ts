// Scores Module with WebSocket integration
import { Module } from '@nestjs/common';
import { Controller, Get, Patch, Param, Body, UseGuards, Req } from '@nestjs/common';
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class UpdateScoreDto {
    @IsInt()
    @Min(0)
    @IsOptional()
    teamARuns?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    teamAWickets?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    teamAOvers?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    teamBRuns?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    teamBWickets?: number;

    @IsInt()
    @Min(0)
    @IsOptional()
    teamBOvers?: number;

    @IsString()
    @IsOptional()
    currentBattingTeamId?: string;
}

@Injectable()
export class ScoresService {
    constructor(private prisma: PrismaService) { }

    async getScoreByMatchId(matchId: string) {
        const score = await this.prisma.matchScore.findUnique({
            where: { matchId },
            include: {
                match: {
                    include: {
                        teamA: true,
                        teamB: true,
                    },
                },
            },
        });

        if (!score) {
            throw new NotFoundException('Match score not found');
        }

        return score;
    }

    async updateScore(matchId: string, dto: UpdateScoreDto, userId: string, userRole: UserRole) {
        const match = await this.prisma.match.findUnique({
            where: { id: matchId },
            include: { tournament: true },
        });

        if (!match) {
            throw new NotFoundException('Match not found');
        }

        if (userRole !== UserRole.SUPER_ADMIN && match.tournament.adminId !== userId) {
            throw new ForbiddenException('You can only update scores for matches in your tournaments');
        }

        const score = await this.prisma.matchScore.update({
            where: { matchId },
            data: dto,
            include: {
                match: {
                    include: {
                        teamA: true,
                        teamB: true,
                    },
                },
            },
        });

        // Emit WebSocket event (if gateway is available)
        // This will be handled by the WebSocket gateway

        return score;
    }
}

@Controller('scores')
@UseGuards(JwtAuthGuard)
export class ScoresController {
    constructor(private scoresService: ScoresService) { }

    @Get('match/:matchId')
    async getScoreByMatchId(@Param('matchId') matchId: string) {
        return this.scoresService.getScoreByMatchId(matchId);
    }

    @Patch('match/:matchId')
    @UseGuards(RolesGuard)
    @Roles(UserRole.ADMIN, UserRole.SUPER_ADMIN)
    async updateScore(@Param('matchId') matchId: string, @Body() dto: UpdateScoreDto, @Req() req) {
        return this.scoresService.updateScore(matchId, dto, req.user.userId, req.user.role);
    }
}

@Module({
    controllers: [ScoresController],
    providers: [ScoresService],
    exports: [ScoresService],
})
export class ScoresModule { }
