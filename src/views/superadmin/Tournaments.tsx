"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    Trophy,
    ArrowLeft,
    Users,
    Calendar,
    User,
    ChevronRight,
    Loader2
} from 'lucide-react';
import { api } from '@/lib/api';

interface Tournament {
    id: string;
    name: string;
    status: string;
    admin: {
        fullName: string;
    };
    _count: {
        teams: number;
        matches: number;
    };
    createdAt: string;
}

const SuperAdminTournaments = () => {
    const [tournaments, setTournaments] = useState<Tournament[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchTournaments();
    }, []);

    const fetchTournaments = async () => {
        try {
            const data = await api.get<Tournament[]>('/tournaments');
            setTournaments(data);
        } catch (error) {
            console.error('Failed to fetch tournaments:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status?.toUpperCase()) {
            case 'ONGOING': return 'bg-live text-live-foreground';
            case 'COMPLETED': return 'bg-muted text-muted-foreground';
            default: return 'bg-secondary text-secondary-foreground';
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/superadmin">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-accent-foreground" />
                            </div>
                            <span className="font-display text-xl tracking-wider">ALL TOURNAMENTS</span>
                        </div>
                    </div>
                    <Badge className="bg-gradient-live text-live-foreground border-0">
                        <Shield className="w-3 h-3 mr-1" />
                        Super Admin
                    </Badge>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
                        <p className="text-muted-foreground">Loading tournaments...</p>
                    </div>
                ) : tournaments.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-card border border-border rounded-2xl p-12 text-center"
                    >
                        <Trophy className="w-16 h-16 text-muted mx-auto mb-6 opacity-20" />
                        <h2 className="text-2xl font-display mb-2">NO TOURNAMENTS YET</h2>
                        <p className="text-muted-foreground">No tournaments have been created on the platform.</p>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tournaments.map((tournament, index) => (
                            <motion.div
                                key={tournament.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="group relative bg-card border border-border rounded-2xl overflow-hidden hover:border-primary transition-all duration-300"
                            >
                                <div className="p-6">
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                            <Trophy className="w-6 h-6 text-primary" />
                                        </div>
                                        <Badge className={`${getStatusColor(tournament.status)} border-0`}>
                                            {tournament.status || 'UPCOMING'}
                                        </Badge>
                                    </div>

                                    <h3 className="font-display text-xl mb-2 group-hover:text-primary transition-colors">
                                        {tournament.name}
                                    </h3>

                                    <div className="space-y-3 mb-6">
                                        <div className="flex items-center text-sm text-muted-foreground">
                                            <User className="w-4 h-4 mr-2" />
                                            Admin: {tournament.admin?.fullName || 'Unknown'}
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                            <span className="flex items-center">
                                                <Users className="w-4 h-4 mr-1.5" />
                                                {tournament._count.teams} Teams
                                            </span>
                                            <span className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1.5" />
                                                {tournament._count.matches} Matches
                                            </span>
                                        </div>
                                    </div>

                                    <Link href={`/tournaments/${tournament.id}`}>
                                        <Button variant="secondary" className="w-full group-hover:bg-primary group-hover:text-primary-foreground">
                                            Manage Tournament
                                            <ChevronRight className="w-4 h-4 ml-2" />
                                        </Button>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
};

export default SuperAdminTournaments;
