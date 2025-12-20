"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Trophy,
    Calendar,
    MapPin,
    Users,
    ArrowLeft,
    ChevronRight,
    Clock,
    Shield
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { api } from '@/lib/api';
import { format } from 'date-fns';

interface Team {
    id: string;
    name: string;
    shortName: string | null;
    logoUrl: string | null;
}

interface Match {
    id: string;
    matchDate: string;
    venue: string;
    status: string;
    teamA: {
        name: string;
        shortName: string | null;
    };
    teamB: {
        name: string;
        shortName: string | null;
    };
}

interface TournamentDetails {
    id: string;
    name: string;
    description: string | null;
    logoUrl: string | null;
    startDate: string;
    endDate: string;
    venue: string | null;
    oversFormat: number | null;
    status: string | null;
    admin: {
        fullName: string;
    };
    teams: Team[];
    matches: Match[];
}

const TournamentDetails = () => {
    const { id } = useParams();
    const [tournament, setTournament] = useState<TournamentDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchTournamentDetails();
        }
    }, [id]);

    const fetchTournamentDetails = async () => {
        try {
            const data = await api.get<TournamentDetails>(`/tournaments/${id}`);
            setTournament(data);
        } catch (error) {
            console.error('Failed to fetch tournament details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string | null) => {
        switch (status?.toLowerCase()) {
            case 'ongoing':
                return 'bg-live text-live-foreground';
            case 'upcoming':
                return 'bg-accent text-accent-foreground';
            case 'completed':
                return 'bg-muted text-muted-foreground';
            default:
                return 'bg-secondary text-secondary-foreground';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-background">
                <Navbar />
                <main className="container mx-auto px-4 py-32 flex items-center justify-center">
                    <div className="text-center">
                        <Trophy className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
                        <p className="text-muted-foreground animate-pulse">Loading tournament details...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!tournament) {
        return (
            <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
                <div className="text-center space-y-6 max-w-md">
                    <div className="relative inline-block">
                        <Trophy className="w-24 h-24 text-muted mx-auto opacity-20" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl font-display opacity-10">404</span>
                        </div>
                    </div>
                    <h1 className="text-4xl font-display tracking-tight">TOURNAMENT NOT FOUND</h1>
                    <p className="text-muted-foreground">
                        The tournament you're looking for doesn't exist or has been removed.
                    </p>
                    <Button variant="hero" asChild size="lg" className="w-full">
                        <Link href="/tournaments">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Return to Tournaments
                        </Link>
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-24">
                {/* Breadcrumbs */}
                <div className="mb-8">
                    <Link href="/tournaments" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Tournaments
                    </Link>
                </div>

                {/* Hero Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-3xl overflow-hidden mb-8"
                >
                    <div className="relative h-48 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 flex items-center justify-center">
                        <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]" />
                        <Trophy className="w-24 h-24 text-primary/20" />
                    </div>
                    <div className="p-8 relative -mt-12">
                        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                            <div className="flex items-start gap-6">
                                <div className="w-24 h-24 bg-card border-4 border-background rounded-2xl flex items-center justify-center shadow-xl">
                                    {tournament.logoUrl ? (
                                        <img src={tournament.logoUrl} alt={tournament.name} className="w-16 h-16 object-contain" />
                                    ) : (
                                        <Trophy className="w-12 h-12 text-primary" />
                                    )}
                                </div>
                                <div>
                                    <div className="flex items-center gap-3 mb-2">
                                        <Badge className={getStatusColor(tournament.status)}>{tournament.status}</Badge>
                                        <Badge variant="outline" className="border-primary/30 text-primary">
                                            <Users className="w-3 h-3 mr-1" />
                                            {tournament.oversFormat} Overs
                                        </Badge>
                                    </div>
                                    <h1 className="font-display text-4xl md:text-5xl mb-2">{tournament.name.toUpperCase()}</h1>
                                    <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm">
                                        <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4" /> {format(new Date(tournament.startDate), 'PPP')} - {format(new Date(tournament.endDate), 'PPP')}</span>
                                        {tournament.venue && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {tournament.venue}</span>}
                                        <span className="flex items-center gap-1.5"><Shield className="w-4 h-4 text-accent" /> Organized by {tournament.admin.fullName}</span>
                                    </div>
                                </div>
                            </div>
                            {tournament.status === 'Ongoing' && (
                                <Button variant="hero" size="lg">
                                    <Clock className="w-5 h-5 mr-2" />
                                    Live Matches
                                </Button>
                            )}
                        </div>
                        {tournament.description && (
                            <p className="mt-8 text-muted-foreground leading-relaxed max-w-3xl">
                                {tournament.description}
                            </p>
                        )}
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Teams Section */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-display text-2xl flex items-center gap-2">
                                <Users className="w-6 h-6 text-primary" />
                                TEAMS ({tournament.teams.length})
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-3">
                            {tournament.teams.length === 0 ? (
                                <div className="bg-card border border-border border-dashed rounded-2xl p-8 text-center text-muted-foreground">
                                    No teams registered yet
                                </div>
                            ) : (
                                tournament.teams.map((team) => (
                                    <Link key={team.id} href={`/teams/${team.id}`}>
                                        <div className="group bg-card border border-border rounded-xl p-4 flex items-center justify-between hover:border-primary/50 transition-all">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-secondary rounded-lg flex items-center justify-center font-display text-sm font-bold">
                                                    {team.logoUrl ? <img src={team.logoUrl} alt={team.name} className="w-6 h-6 object-contain" /> : (team.shortName || team.name.substring(0, 2))}
                                                </div>
                                                <div>
                                                    <div className="font-medium group-hover:text-primary transition-colors">{team.name}</div>
                                                    <div className="text-xs text-muted-foreground">{team.shortName || 'TBD'}</div>
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Matches Section */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="font-display text-2xl flex items-center gap-2">
                                <Trophy className="w-6 h-6 text-accent" />
                                MATCHES ({tournament.matches.length})
                            </h2>
                        </div>
                        <div className="grid grid-cols-1 gap-4">
                            {tournament.matches.length === 0 ? (
                                <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center text-muted-foreground flex flex-col items-center gap-4">
                                    <Calendar className="w-12 h-12 opacity-20" />
                                    <p>No matches scheduled yet for this tournament</p>
                                </div>
                            ) : (
                                tournament.matches.map((match) => (
                                    <Link key={match.id} href={`/matches/${match.id}`}>
                                        <div className="group bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/50 transition-all">
                                            <div className="p-6">
                                                <div className="flex items-center justify-between mb-4">
                                                    <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{format(new Date(match.matchDate), 'PPP p')}</Badge>
                                                    <Badge className={getStatusColor(match.status)}>{match.status}</Badge>
                                                </div>
                                                <div className="flex items-center justify-around gap-4 text-center">
                                                    <div className="flex-1">
                                                        <div className="w-12 h-12 bg-secondary rounded-full mx-auto mb-2 flex items-center justify-center font-display font-bold">
                                                            {match.teamA.shortName || match.teamA.name.substring(0, 2)}
                                                        </div>
                                                        <div className="font-display text-sm truncate">{match.teamA.name}</div>
                                                    </div>
                                                    <div className="font-display text-2xl text-primary flex flex-col items-center">
                                                        VS
                                                        <div className="h-0.5 w-8 bg-gradient-to-r from-transparent via-primary/50 to-transparent mt-1" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="w-12 h-12 bg-secondary rounded-full mx-auto mb-2 flex items-center justify-center font-display font-bold">
                                                            {match.teamB.shortName || match.teamB.name.substring(0, 2)}
                                                        </div>
                                                        <div className="font-display text-sm truncate">{match.teamB.name}</div>
                                                    </div>
                                                </div>
                                                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
                                                    <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {match.venue}</span>
                                                    <span className="flex items-center gap-1 text-accent font-medium group-hover:underline">Match Details <ChevronRight className="w-3 h-3" /></span>
                                                </div>
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default TournamentDetails;
