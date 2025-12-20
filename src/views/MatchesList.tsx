"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, MapPin, Play, Plus, Clock } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { getStoredData, MockMatch, MockTeam, MockTournament, MockMatchScore, initialMatches, initialTeams, initialTournaments, initialScores } from '@/lib/mockData';

const MatchesList = () => {
  const [matches, setMatches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const { isAdmin, hasActiveSubscription, isSuperAdmin } = useAuth();

  useEffect(() => {
    fetchMatches();
  }, []);

  const fetchMatches = () => {
    const allMatches = getStoredData<MockMatch[]>('mock_matches', initialMatches);
    const allTeams = getStoredData<MockTeam[]>('mock_teams', initialTeams);
    const allTournaments = getStoredData<MockTournament[]>('mock_tournaments', initialTournaments);
    const allScores = getStoredData<MockMatchScore[]>('mock_scores', initialScores);

    const matchesWithDetails = allMatches
      .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
      .map(match => ({
        ...match,
        team_a: allTeams.find(t => t.id === match.team_a_id),
        team_b: allTeams.find(t => t.id === match.team_b_id),
        tournament: allTournaments.find(t => t.id === match.tournament_id),
        scores: allScores.find(s => s.match_id === match.id)
      }));

    setMatches(matchesWithDetails);
    setLoading(false);
  };

  const filteredMatches = matches.filter(m => activeTab === 'all' || m.status === activeTab);
  const canViewLive = isAdmin || isSuperAdmin || hasActiveSubscription;

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'live': return 'bg-live text-live-foreground animate-pulse-live';
      case 'upcoming': return 'bg-accent text-accent-foreground';
      case 'completed': return 'bg-muted text-muted-foreground';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
              <div>
                <h1 className="font-display text-5xl md:text-6xl mb-2">MATCHES</h1>
                <p className="text-muted-foreground">Track live scores and browse all matches</p>
              </div>
              {isAdmin && (
                <Button variant="hero" asChild>
                  <Link href="/schedule-match"><Plus className="w-5 h-5 mr-2" />Schedule Match</Link>
                </Button>
              )}
            </div>

            <div className="mb-8">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="bg-card border border-border">
                  <TabsTrigger value="all" className="data-[state=active]:bg-primary">All</TabsTrigger>
                  <TabsTrigger value="live" className="data-[state=active]:bg-live">Live</TabsTrigger>
                  <TabsTrigger value="upcoming" className="data-[state=active]:bg-accent">Upcoming</TabsTrigger>
                  <TabsTrigger value="completed" className="data-[state=active]:bg-secondary">Completed</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                    <div className="h-6 bg-secondary rounded w-3/4 mb-4" />
                    <div className="h-4 bg-secondary rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : filteredMatches.length === 0 ? (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-display text-2xl mb-2">NO MATCHES FOUND</h3>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredMatches.map((match, index) => (
                  <motion.div key={match.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }} className="bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs text-muted-foreground">{match.tournament?.name}</span>
                      <Badge className={getStatusBadge(match.status)}>{match.status?.toUpperCase()}</Badge>
                    </div>
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                            <span className="font-display text-sm text-primary-foreground">{match.team_a?.short_name || 'TBA'}</span>
                          </div>
                          <span className="font-medium">{match.team_a?.name || 'TBA'}</span>
                        </div>
                        {match.scores && <span className="font-display text-xl">{match.scores.team_a_runs}/{match.scores.team_a_wickets}</span>}
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
                            <span className="font-display text-sm text-accent-foreground">{match.team_b?.short_name || 'TBA'}</span>
                          </div>
                          <span className="font-medium">{match.team_b?.name || 'TBA'}</span>
                        </div>
                        {match.scores && <span className="font-display text-xl">{match.scores.team_b_runs}/{match.scores.team_b_wickets}</span>}
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-muted-foreground border-t border-border pt-4">
                      <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /><span>{new Date(match.match_date).toLocaleDateString()}</span><Clock className="w-4 h-4 ml-2" /><span>{new Date(match.match_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                      <div className="flex items-center gap-2"><MapPin className="w-4 h-4" /><span>{match.venue}</span></div>
                    </div>
                    {match.status === 'live' && (
                      <div className="mt-4">
                        <Button variant="hero" size="sm" className="w-full" asChild>
                          <Link href={isAdmin ? `/live-scoring/${match.id}` : `/matches/${match.id}`}>
                            <Play className="w-4 h-4 mr-2" />
                            {isAdmin ? 'Score Match' : 'Watch Live'}
                          </Link>
                        </Button>
                      </div>
                    )}
                    {match.status === 'upcoming' && (
                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link href={isAdmin ? `/live-scoring/${match.id}` : `/matches/${match.id}`}>
                            <Play className="w-4 h-4 mr-2" />
                            {isAdmin ? 'Start Match' : 'View Details'}
                          </Link>
                        </Button>
                      </div>
                    )}
                    {match.status === 'completed' && (
                      <div className="mt-4">
                        <Button variant="outline" size="sm" className="w-full" asChild>
                          <Link href={`/matches/${match.id}`}>
                            View Results
                          </Link>
                        </Button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MatchesList;
