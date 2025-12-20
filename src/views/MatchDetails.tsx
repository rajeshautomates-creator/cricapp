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
    ArrowLeft,
    Users,
    CircleDot,
    Clock,
    Share2
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

interface MatchScore {
    teamARuns: number;
    teamAWickets: number;
    teamAOvers: number;
    teamBRuns: number;
    teamBWickets: number;
    teamBOvers: number;
    ballByBall: any[];
}

interface MatchDetails {
    id: string;
    matchDate: string;
    venue: string;
    status: string;
    overs: number | null;
    result: string | null;
    tournament: {
        id: string;
        name: string;
    };
    teamA: Team;
    teamB: Team;
    score: MatchScore | null;
}

const MatchDetails = () => {
    const { id } = useParams();
    const [match, setMatch] = useState<MatchDetails | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchMatchDetails();
            // Poll for updates if match is LIVE
            const interval = setInterval(() => {
                if (match?.status === 'LIVE') {
                    fetchMatchDetails();
                }
            }, 30000); // 30 seconds polling
            return () => clearInterval(interval);
        }
    }, [id, match?.status]);

    const fetchMatchDetails = async () => {
        try {
            const data = await api.get<MatchDetails>(`/matches/${id}`);
            setMatch(data);
        } catch (error) {
            console.error('Failed to fetch match details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string | null) => {
        switch (status?.toUpperCase()) {
            case 'LIVE':
                return 'bg-live text-live-foreground animate-pulse';
            case 'UPCOMING':
                return 'bg-accent text-accent-foreground';
            case 'COMPLETED':
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
                        <CircleDot className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
                        <p className="text-muted-foreground">Loading match details...</p>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    if (!match) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <Trophy className="w-24 h-24 text-muted opacity-20 mb-6" />
                <h1 className="text-4xl font-display mb-4">MATCH NOT FOUND</h1>
                <Button variant="hero" asChild>
                    <Link href="/matches">Return to Matches</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background">
            <Navbar />

            <main className="container mx-auto px-4 py-24">
                {/* Breadcrumbs */}
                <div className="mb-8 flex items-center justify-between">
                    <Link href="/matches" className="flex items-center text-sm text-muted-foreground hover:text-primary transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-1" />
                        Back to Matches
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => {
                        navigator.clipboard.writeText(window.location.href);
                        // Add toast notification if available
                    }}>
                        <Share2 className="w-4 h-4 mr-2" />
                        Share Match
                    </Button>
                </div>

                {/* Match Header / Scorecard */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-3xl overflow-hidden mb-8"
                >
                    <div className="bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 p-6 md:p-10">
                        <div className="text-center mb-10">
                            <Link href={`/tournaments/${match.tournament.id}`} className="text-accent hover:underline font-medium text-sm mb-2 inline-block">
                                {match.tournament.name.toUpperCase()}
                            </Link>
                            <div className="flex items-center justify-center gap-3">
                                <Badge className={getStatusColor(match.status)}>
                                    {match.status === 'LIVE' && <CircleDot className="w-3 h-3 mr-1 animate-pulse" />}
                                    {match.status}
                                </Badge>
                                {match.overs && (
                                    <Badge variant="outline">{match.overs} Overs Match</Badge>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row items-center justify-around gap-12 max-w-5xl mx-auto">
                            {/* Team A */}
                            <div className="flex-1 text-center md:text-right space-y-4">
                                <div className="w-24 h-24 bg-card rounded-2xl border border-border flex items-center justify-center mx-auto md:ml-auto">
                                    {match.teamA.logoUrl ? (
                                        <img src={match.teamA.logoUrl} alt={match.teamA.name} className="w-16 h-16 object-contain" />
                                    ) : (
                                        <span className="font-display text-3xl">{match.teamA.shortName || match.teamA.name.substring(0, 2)}</span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-display text-2xl md:text-3xl">{match.teamA.name}</h2>
                                    <p className="text-muted-foreground">{match.teamA.shortName}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="font-display text-4xl md:text-5xl text-primary">
                                        {match.score?.teamARuns || 0}/{match.score?.teamAWickets || 0}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{match.score?.teamAOvers || 0} Overs</p>
                                </div>
                            </div>

                            {/* VS Divider */}
                            <div className="flex flex-col items-center">
                                <div className="font-display text-4xl text-muted opacity-30">VS</div>
                                <div className="h-20 w-px bg-gradient-to-b from-transparent via-border to-transparent my-4" />
                            </div>

                            {/* Team B */}
                            <div className="flex-1 text-center md:text-left space-y-4">
                                <div className="w-24 h-24 bg-card rounded-2xl border border-border flex items-center justify-center mx-auto md:mr-auto">
                                    {match.teamB.logoUrl ? (
                                        <img src={match.teamB.logoUrl} alt={match.teamB.name} className="w-16 h-16 object-contain" />
                                    ) : (
                                        <span className="font-display text-3xl">{match.teamB.shortName || match.teamB.name.substring(0, 2)}</span>
                                    )}
                                </div>
                                <div>
                                    <h2 className="font-display text-2xl md:text-3xl">{match.teamB.name}</h2>
                                    <p className="text-muted-foreground">{match.teamB.shortName}</p>
                                </div>
                                <div className="space-y-1">
                                    <div className="font-display text-4xl md:text-5xl text-accent">
                                        {match.score?.teamBRuns || 0}/{match.score?.teamBWickets || 0}
                                    </div>
                                    <p className="text-sm text-muted-foreground">{match.score?.teamBOvers || 0} Overs</p>
                                </div>
                            </div>
                        </div>

                        {match.result && (
                            <div className="mt-12 text-center bg-primary/10 border border-primary/20 rounded-2xl p-4 max-w-md mx-auto">
                                <p className="font-display text-primary flex items-center justify-center gap-2">
                                    <Trophy className="w-5 h-5" />
                                    {match.result.toUpperCase()}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="bg-muted/30 border-t border-border p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-sm text-muted-foreground max-w-5xl mx-auto">
                            <div className="flex items-center justify-center md:justify-start gap-2">
                                <Calendar className="w-4 h-4 text-primary" />
                                {format(new Date(match.matchDate), 'PPP p')}
                            </div>
                            <div className="flex items-center justify-center gap-2">
                                <MapPin className="w-4 h-4 text-primary" />
                                {match.venue}
                            </div>
                            <div className="flex items-center justify-center md:justify-end gap-2">
                                <Clock className="w-4 h-4 text-primary" />
                                Last Updated: {format(new Date(), 'pp')}
                            </div>
                        </div>
                    </div>
                </motion.div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Commentary / Recent Balls */}
                    <div className="lg:col-span-2 space-y-6">
                        <h3 className="font-display text-2xl flex items-center gap-2">
                            <Users className="w-6 h-6 text-primary" />
                            MATCH INFO
                        </h3>
                        <div className="bg-card border border-border rounded-2xl p-8 text-center text-muted-foreground">
                            Detailed stats and ball-by-ball commentary coming soon.
                        </div>
                    </div>

                    {/* Sidebar Info */}
                    <div className="space-y-6">
                        <div className="bg-card border border-border rounded-2xl p-6">
                            <h4 className="font-display text-xl mb-4">TOURNAMENT</h4>
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                                    <Trophy className="w-6 h-6 text-primary" />
                                </div>
                                <div>
                                    <div className="font-semibold">{match.tournament.name}</div>
                                    <Link href={`/tournaments/${match.tournament.id}`} className="text-xs text-primary hover:underline">
                                        View Full Tournament
                                    </Link>
                                </div>
                            </div>
                            <Button variant="outline" className="w-full" asChild>
                                <Link href="/matches">View All Matches</Link>
                            </Button>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default MatchDetails;
