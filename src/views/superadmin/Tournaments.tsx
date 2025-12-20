"use client";

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    Trophy,
    ArrowLeft
} from 'lucide-react';

const SuperAdminTournaments = () => {
    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/superadmin">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-live rounded-lg flex items-center justify-center">
                                <Trophy className="w-5 h-5 text-live-foreground" />
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
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl p-12 text-center"
                >
                    <Trophy className="w-16 h-16 text-live mx-auto mb-6" />
                    <h1 className="font-display text-4xl mb-4">TOURNAMENT MANAGEMENT</h1>
                    <p className="text-muted-foreground max-w-md mx-auto mb-8">
                        Overview and moderation of all platform tournaments. This module is under active development.
                    </p>
                    <Link href="/superadmin">
                        <Button variant="outline">
                            Return to Dashboard
                        </Button>
                    </Link>
                </motion.div>
            </main>
        </div>
    );
};

export default SuperAdminTournaments;
