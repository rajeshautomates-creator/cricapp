import { Module, Controller, Get, UseGuards, Req, Injectable } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PrismaService } from '../prisma/prisma.service';
import { UserRole, MatchStatus } from '@prisma/client';

@Injectable()
export class DashboardService {
    constructor(private prisma: PrismaService) { }

    async getAdminStats(userId: string, userRole: UserRole) {
        const isSuperAdmin = userRole === UserRole.SUPER_ADMIN;

        const whereTournament = isSuperAdmin ? {} : { adminId: userId };

        const tournaments = await this.prisma.tournament.findMany({
            where: whereTournament,
            select: { id: true },
        });

        const tournamentIds = tournaments.map((t) => t.id);

        const [tournamentCount, teamCount, matchCount, liveMatchCount] = await Promise.all([
            this.prisma.tournament.count({ where: whereTournament }),
            this.prisma.team.count({ where: { tournamentId: { in: tournamentIds } } }),
            this.prisma.match.count({ where: { tournamentId: { in: tournamentIds } } }),
            this.prisma.match.count({
                where: {
                    tournamentId: { in: tournamentIds },
                    status: MatchStatus.LIVE,
                },
            }),
        ]);

        const recentMatches = await this.prisma.match.findMany({
            where: { tournamentId: { in: tournamentIds } },
            take: 5,
            orderBy: { matchDate: 'desc' },
            include: {
                teamA: true,
                teamB: true,
                score: true,
            },
        });

        return {
            stats: {
                tournaments: tournamentCount,
                teams: teamCount,
                matches: matchCount,
                liveMatches: liveMatchCount,
            },
            recentMatches,
        };
    }
}

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
    constructor(private dashboardService: DashboardService) { }

    @Get('stats')
    async getStats(@Req() req) {
        return this.dashboardService.getAdminStats(req.user.userId, req.user.role);
    }
}

@Module({
    controllers: [DashboardController],
    providers: [DashboardService],
    exports: [DashboardService],
})
export class DashboardModule { }
