"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Trophy,
  Plus,
  Search,
  Calendar,
  MapPin,
  Users,
  ChevronRight
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { getStoredData, MockTournament, initialTournaments } from '@/lib/mockData';

const Tournaments = () => {
  const [tournaments, setTournaments] = useState<MockTournament[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { isAdmin, user } = useAuth();

  useEffect(() => {
    fetchTournaments();
  }, [user]);

  const fetchTournaments = () => {
    const allTournaments = getStoredData<MockTournament[]>('mock_tournaments', initialTournaments);
    setTournaments(allTournaments);
    setLoading(false);
  };

  const filteredTournaments = tournaments.filter(tournament => {
    const matchesSearch = tournament.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tournament.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string | null) => {
    switch (status) {
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-4 py-8 pt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-4xl mb-2">TOURNAMENTS</h1>
              <p className="text-muted-foreground">
                Browse and manage cricket tournaments
              </p>
            </div>
            {isAdmin && (
              <Button variant="hero" asChild>
                <Link href="/dashboard/tournaments/new">
                  <Plus className="w-5 h-5 mr-2" />
                  Create Tournament
                </Link>
              </Button>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-card border-border"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'upcoming', 'ongoing', 'completed'].map((status) => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                  className="capitalize"
                >
                  {status}
                </Button>
              ))}
            </div>
          </div>

          {/* Tournaments Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                  <div className="w-16 h-16 bg-secondary rounded-xl mb-4" />
                  <div className="h-6 bg-secondary rounded w-3/4 mb-2" />
                  <div className="h-4 bg-secondary rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : filteredTournaments.length === 0 ? (
            <div className="text-center py-16">
              <Trophy className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-2xl mb-2">NO TOURNAMENTS FOUND</h3>
              <p className="text-muted-foreground mb-6">
                {searchQuery
                  ? 'Try adjusting your search or filters'
                  : 'Create your first tournament to get started'}
              </p>
              {isAdmin && (
                <Button variant="hero" asChild>
                  <Link href="/dashboard/tournaments/new">
                    <Plus className="w-5 h-5 mr-2" />
                    Create Tournament
                  </Link>
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTournaments.map((tournament, index) => (
                <motion.div
                  key={tournament.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all"
                >
                  <Link href={`/tournaments/${tournament.id}`}>
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-16 h-16 bg-gradient-primary rounded-xl flex items-center justify-center">
                        {tournament.logo_url ? (
                          <img
                            src={tournament.logo_url}
                            alt={tournament.name}
                            className="w-12 h-12 object-contain"
                          />
                        ) : (
                          <Trophy className="w-8 h-8 text-primary-foreground" />
                        )}
                      </div>
                      <Badge className={getStatusColor(tournament.status)}>
                        {tournament.status}
                      </Badge>
                    </div>

                    <h3 className="font-display text-xl mb-2 group-hover:text-primary transition-colors">
                      {tournament.name}
                    </h3>

                    {tournament.description && (
                      <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                        {tournament.description}
                      </p>
                    )}

                    <div className="space-y-2 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>
                          {new Date(tournament.start_date).toLocaleDateString()} -{' '}
                          {new Date(tournament.end_date).toLocaleDateString()}
                        </span>
                      </div>
                      {tournament.venue && (
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{tournament.venue}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        <span>{tournament.overs_format || 20} Overs Format</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 mt-4 text-primary">
                      <span className="text-sm font-medium">View Details</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
};

export default Tournaments;
