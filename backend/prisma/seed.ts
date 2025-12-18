import { PrismaClient, UserRole, MatchStatus, TournamentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Clear existing data
    await prisma.matchScore.deleteMany();
    await prisma.match.deleteMany();
    await prisma.player.deleteMany();
    await prisma.team.deleteMany();
    await prisma.tournament.deleteMany();
    await prisma.viewerSubscription.deleteMany();
    await prisma.adminPurchase.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.user.deleteMany();
    await prisma.paymentSettings.deleteMany();

    console.log('✅ Cleared existing data');

    // Hash password for demo accounts
    const hashedPassword = await bcrypt.hash('demo123', 10);

    // Create Super Admin
    const superAdmin = await prisma.user.create({
        data: {
            email: 'superadmin@demo.com',
            password: hashedPassword,
            fullName: 'Super Admin',
            role: UserRole.SUPER_ADMIN,
        },
    });
    console.log('✅ Created Super Admin');

    // Create Demo Admin with purchase
    const demoAdmin = await prisma.user.create({
        data: {
            email: 'demo@admin.com',
            password: hashedPassword,
            fullName: 'Demo Admin',
            role: UserRole.ADMIN,
            adminPurchase: {
                create: {
                    amount: 500,
                    status: 'completed',
                    purchaseDate: new Date(),
                    expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
                },
            },
        },
    });
    console.log('✅ Created Demo Admin with active purchase');

    // Create Demo Viewer with subscription
    const demoViewer = await prisma.user.create({
        data: {
            email: 'demo@viewer.com',
            password: hashedPassword,
            fullName: 'Demo Viewer',
            role: UserRole.VIEWER,
            viewerSubscription: {
                create: {
                    amount: 20,
                    isActive: true,
                    startDate: new Date(),
                    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
                },
            },
        },
    });
    console.log('✅ Created Demo Viewer with active subscription');

    // Create Payment Settings
    await prisma.paymentSettings.create({
        data: {
            viewerSubscriptionAmount: 20.00,
            viewerValidityDays: 30,
            adminPurchaseAmount: 500.00,
            adminValidityDays: 365,
            razorpayKeyId: '',
        },
    });
    console.log('✅ Created Payment Settings');

    // Create Sample Tournaments
    const ipl2024 = await prisma.tournament.create({
        data: {
            name: 'IPL 2024',
            description: 'Indian Premier League - The biggest T20 cricket league in the world',
            startDate: new Date('2024-03-22'),
            endDate: new Date('2024-05-26'),
            venue: 'Multiple Venues',
            oversFormat: 20,
            status: TournamentStatus.ONGOING,
            adminId: demoAdmin.id,
        },
    });

    const worldCup2024 = await prisma.tournament.create({
        data: {
            name: 'Cricket World Cup 2024',
            description: 'ICC Cricket World Cup Championship',
            startDate: new Date('2024-06-01'),
            endDate: new Date('2024-07-15'),
            venue: 'West Indies & USA',
            oversFormat: 50,
            status: TournamentStatus.UPCOMING,
            adminId: demoAdmin.id,
        },
    });

    console.log('✅ Created 2 tournaments');

    // Create IPL Teams
    const teams = await Promise.all([
        prisma.team.create({
            data: {
                name: 'Mumbai Indians',
                shortName: 'MI',
                captain: 'Hardik Pandya',
                coach: 'Mark Boucher',
                tournamentId: ipl2024.id,
            },
        }),
        prisma.team.create({
            data: {
                name: 'Chennai Super Kings',
                shortName: 'CSK',
                captain: 'MS Dhoni',
                coach: 'Stephen Fleming',
                tournamentId: ipl2024.id,
            },
        }),
        prisma.team.create({
            data: {
                name: 'Royal Challengers Bangalore',
                shortName: 'RCB',
                captain: 'Faf du Plessis',
                coach: 'Andy Flower',
                tournamentId: ipl2024.id,
            },
        }),
        prisma.team.create({
            data: {
                name: 'Kolkata Knight Riders',
                shortName: 'KKR',
                captain: 'Shreyas Iyer',
                coach: 'Chandrakant Pandit',
                tournamentId: ipl2024.id,
            },
        }),
    ]);

    const [mi, csk, rcb, kkr] = teams;
    console.log('✅ Created 4 teams');

    // Create Players
    await Promise.all([
        // Mumbai Indians
        prisma.player.create({
            data: {
                name: 'Rohit Sharma',
                role: 'batsman',
                battingStyle: 'right-handed',
                jerseyNumber: 45,
                teamId: mi.id,
            },
        }),
        prisma.player.create({
            data: {
                name: 'Hardik Pandya',
                role: 'all-rounder',
                battingStyle: 'right-handed',
                bowlingStyle: 'medium',
                jerseyNumber: 33,
                teamId: mi.id,
            },
        }),
        prisma.player.create({
            data: {
                name: 'Jasprit Bumrah',
                role: 'bowler',
                battingStyle: 'right-handed',
                bowlingStyle: 'fast',
                jerseyNumber: 93,
                teamId: mi.id,
            },
        }),

        // Chennai Super Kings
        prisma.player.create({
            data: {
                name: 'MS Dhoni',
                role: 'wicket-keeper',
                battingStyle: 'right-handed',
                jerseyNumber: 7,
                teamId: csk.id,
            },
        }),
        prisma.player.create({
            data: {
                name: 'Ravindra Jadeja',
                role: 'all-rounder',
                battingStyle: 'left-handed',
                bowlingStyle: 'spin',
                jerseyNumber: 8,
                teamId: csk.id,
            },
        }),

        // RCB
        prisma.player.create({
            data: {
                name: 'Virat Kohli',
                role: 'batsman',
                battingStyle: 'right-handed',
                jerseyNumber: 18,
                teamId: rcb.id,
            },
        }),
        prisma.player.create({
            data: {
                name: 'Glenn Maxwell',
                role: 'all-rounder',
                battingStyle: 'right-handed',
                bowlingStyle: 'spin',
                jerseyNumber: 32,
                teamId: rcb.id,
            },
        }),

        // KKR
        prisma.player.create({
            data: {
                name: 'Andre Russell',
                role: 'all-rounder',
                battingStyle: 'right-handed',
                bowlingStyle: 'fast',
                jerseyNumber: 12,
                teamId: kkr.id,
            },
        }),
    ]);

    console.log('✅ Created 8 players');

    // Create Matches
    const liveMatch = await prisma.match.create({
        data: {
            tournamentId: ipl2024.id,
            teamAId: mi.id,
            teamBId: csk.id,
            matchDate: new Date(),
            venue: 'Wankhede Stadium, Mumbai',
            overs: 20,
            status: MatchStatus.LIVE,
        },
    });

    const upcomingMatch = await prisma.match.create({
        data: {
            tournamentId: ipl2024.id,
            teamAId: rcb.id,
            teamBId: kkr.id,
            matchDate: new Date(Date.now() + 86400000), // Tomorrow
            venue: 'M. Chinnaswamy Stadium, Bangalore',
            overs: 20,
            status: MatchStatus.UPCOMING,
        },
    });

    const completedMatch = await prisma.match.create({
        data: {
            tournamentId: ipl2024.id,
            teamAId: csk.id,
            teamBId: kkr.id,
            matchDate: new Date(Date.now() - 86400000), // Yesterday
            venue: 'MA Chidambaram Stadium, Chennai',
            overs: 20,
            status: MatchStatus.COMPLETED,
            result: 'CSK won by 13 runs',
        },
    });

    console.log('✅ Created 3 matches');

    // Create Match Scores
    await prisma.matchScore.create({
        data: {
            matchId: liveMatch.id,
            teamARuns: 145,
            teamAWickets: 3,
            teamAOvers: 15.2,
            teamBRuns: 0,
            teamBWickets: 0,
            teamBOvers: 0,
            currentBattingTeamId: mi.id,
            ballByBall: [],
        },
    });

    await prisma.matchScore.create({
        data: {
            matchId: upcomingMatch.id,
            ballByBall: [],
        },
    });

    await prisma.matchScore.create({
        data: {
            matchId: completedMatch.id,
            teamARuns: 178,
            teamAWickets: 6,
            teamAOvers: 20,
            teamBRuns: 165,
            teamBWickets: 8,
            teamBOvers: 20,
            ballByBall: [],
        },
    });

    console.log('✅ Created match scores');

    console.log('\n🎉 Database seeded successfully!');
    console.log('\n📝 Demo Accounts:');
    console.log('  Super Admin: superadmin@demo.com / demo123');
    console.log('  Admin: demo@admin.com / demo123');
    console.log('  Viewer: demo@viewer.com / demo123');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
