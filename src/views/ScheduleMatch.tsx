"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, MapPin, Clock, ChevronLeft } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { getStoredData, setStoredData, MockTournament, MockTeam, MockMatch, MockMatchScore, initialTournaments, initialTeams, initialMatches, initialScores } from '@/lib/mockData';

const ScheduleMatch = () => {
  const [tournaments, setTournaments] = useState<MockTournament[]>([]);
  const [teams, setTeams] = useState<MockTeam[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [match, setMatch] = useState({ tournament_id: '', team_a_id: '', team_b_id: '', match_date: '', match_time: '', venue: '', overs: 20 });

  useEffect(() => { if (user) fetchTournaments(); }, [user]);
  useEffect(() => { if (match.tournament_id) fetchTeams(match.tournament_id); }, [match.tournament_id]);

  const fetchTournaments = () => {
    const all = getStoredData<MockTournament[]>('mock_tournaments', initialTournaments).filter(t => t.admin_id === user?.id);
    setTournaments(all);
  };

  const fetchTeams = (tournamentId: string) => {
    const all = getStoredData<MockTeam[]>('mock_teams', initialTeams).filter(t => t.tournament_id === tournamentId);
    setTeams(all);
    const tournament = tournaments.find(t => t.id === tournamentId);
    if (tournament?.overs_format) setMatch(prev => ({ ...prev, overs: tournament.overs_format || 20 }));
  };

  const handleScheduleMatch = () => {
    if (!match.tournament_id || !match.team_a_id || !match.team_b_id || !match.match_date || !match.venue) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill all required fields' }); return;
    }
    if (match.team_a_id === match.team_b_id) {
      toast({ variant: 'destructive', title: 'Error', description: 'Select different teams' }); return;
    }
    setLoading(true);
    const matchDateTime = match.match_time ? `${match.match_date}T${match.match_time}:00` : `${match.match_date}T00:00:00`;
    const newMatch: MockMatch = { id: `match-${Date.now()}`, tournament_id: match.tournament_id, team_a_id: match.team_a_id, team_b_id: match.team_b_id, match_date: matchDateTime, venue: match.venue, overs: match.overs, status: 'upcoming', created_at: new Date().toISOString() };
    const allMatches = getStoredData<MockMatch[]>('mock_matches', initialMatches);
    setStoredData('mock_matches', [...allMatches, newMatch]);
    const allScores = getStoredData<MockMatchScore[]>('mock_scores', initialScores);
    const newScore: MockMatchScore = { id: `score-${Date.now()}`, match_id: newMatch.id, team_a_runs: 0, team_a_wickets: 0, team_a_overs: 0, team_b_runs: 0, team_b_wickets: 0, team_b_overs: 0, current_batting_team_id: null, ball_by_ball: [], updated_at: new Date().toISOString() };
    setStoredData('mock_scores', [...allScores, newScore]);
    toast({ title: 'Success', description: 'Match scheduled successfully' });
    router.push('/matches');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8 pt-24">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"><ChevronLeft className="w-4 h-4" />Back</button>
          <div className="bg-card border border-border rounded-2xl p-8">
            <h1 className="font-display text-4xl mb-2">SCHEDULE MATCH</h1>
            <p className="text-muted-foreground mb-8">Create a new match between two teams</p>
            <div className="space-y-6">
              <div className="space-y-2"><Label>Tournament *</Label><Select value={match.tournament_id} onValueChange={(v) => setMatch({ ...match, tournament_id: v, team_a_id: '', team_b_id: '' })}><SelectTrigger className="bg-secondary h-12"><SelectValue placeholder="Select tournament" /></SelectTrigger><SelectContent>{tournaments.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Team A *</Label><Select value={match.team_a_id} onValueChange={(v) => setMatch({ ...match, team_a_id: v })} disabled={!match.tournament_id}><SelectTrigger className="bg-secondary h-12"><SelectValue placeholder="Select team" /></SelectTrigger><SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Team B *</Label><Select value={match.team_b_id} onValueChange={(v) => setMatch({ ...match, team_b_id: v })} disabled={!match.team_a_id}><SelectTrigger className="bg-secondary h-12"><SelectValue placeholder="Select team" /></SelectTrigger><SelectContent>{teams.filter(t => t.id !== match.team_a_id).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="flex items-center gap-2"><Calendar className="w-4 h-4" />Match Date *</Label><Input type="date" value={match.match_date} onChange={(e) => setMatch({ ...match, match_date: e.target.value })} className="bg-secondary h-12" /></div>
                <div className="space-y-2"><Label className="flex items-center gap-2"><Clock className="w-4 h-4" />Match Time</Label><Input type="time" value={match.match_time} onChange={(e) => setMatch({ ...match, match_time: e.target.value })} className="bg-secondary h-12" /></div>
              </div>
              <div className="space-y-2"><Label className="flex items-center gap-2"><MapPin className="w-4 h-4" />Venue *</Label><Input value={match.venue} onChange={(e) => setMatch({ ...match, venue: e.target.value })} className="bg-secondary h-12" placeholder="Stadium name" /></div>
              <Button variant="hero" size="lg" className="w-full" onClick={handleScheduleMatch} disabled={loading}>{loading ? 'Scheduling...' : 'Schedule Match'}</Button>
            </div>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ScheduleMatch;
