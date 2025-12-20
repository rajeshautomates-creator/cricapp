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
import { api } from '@/lib/api';

interface Tournament {
  id: string;
  name: string;
  oversFormat?: number;
}

interface Team {
  id: string;
  name: string;
}

const ScheduleMatch = () => {
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [match, setMatch] = useState({
    tournamentId: '',
    teamAId: '',
    teamBId: '',
    matchDate: '',
    matchTime: '',
    venue: '',
    overs: 20
  });

  useEffect(() => { if (user) fetchTournaments(); }, [user]);
  useEffect(() => { if (match.tournamentId) fetchTeams(match.tournamentId); }, [match.tournamentId]);

  const fetchTournaments = async () => {
    try {
      const data = await api.get<Tournament[]>('/tournaments');
      setTournaments(data);
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
    }
  };

  const fetchTeams = async (tournamentId: string) => {
    try {
      const data = await api.get<Team[]>(`/teams?tournamentId=${tournamentId}`);
      setTeams(data);
      const tournament = tournaments.find(t => t.id === tournamentId);
      if (tournament?.oversFormat) {
        setMatch(prev => ({ ...prev, overs: tournament.oversFormat || 20 }));
      }
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  const handleScheduleMatch = async () => {
    if (!match.tournamentId || !match.teamAId || !match.teamBId || !match.matchDate || !match.venue) {
      toast({ variant: 'destructive', title: 'Error', description: 'Please fill all required fields' });
      return;
    }
    if (match.teamAId === match.teamBId) {
      toast({ variant: 'destructive', title: 'Error', description: 'Select different teams' });
      return;
    }

    setLoading(true);
    try {
      const matchDateTime = match.matchTime
        ? `${match.matchDate}T${match.matchTime}:00`
        : `${match.matchDate}T00:00:00`;

      await api.post('/matches', {
        tournamentId: match.tournamentId,
        teamAId: match.teamAId,
        teamBId: match.teamBId,
        matchDate: matchDateTime,
        venue: match.venue,
        overs: match.overs,
      });

      toast({ title: 'Success', description: 'Match scheduled successfully' });
      router.push('/matches');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to schedule match'
      });
    } finally {
      setLoading(false);
    }
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
              <div className="space-y-2"><Label>Tournament *</Label><Select value={match.tournamentId} onValueChange={(v) => setMatch({ ...match, tournamentId: v, teamAId: '', teamBId: '' })}><SelectTrigger className="bg-secondary h-12"><SelectValue placeholder="Select tournament" /></SelectTrigger><SelectContent>{tournaments.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Team A *</Label><Select value={match.teamAId} onValueChange={(v) => setMatch({ ...match, teamAId: v })} disabled={!match.tournamentId}><SelectTrigger className="bg-secondary h-12"><SelectValue placeholder="Select team" /></SelectTrigger><SelectContent>{teams.map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
                <div className="space-y-2"><Label>Team B *</Label><Select value={match.teamBId} onValueChange={(v) => setMatch({ ...match, teamBId: v })} disabled={!match.teamAId}><SelectTrigger className="bg-secondary h-12"><SelectValue placeholder="Select team" /></SelectTrigger><SelectContent>{teams.filter(t => t.id !== match.teamAId).map(t => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label className="flex items-center gap-2"><Calendar className="w-4 h-4" />Match Date *</Label><Input type="date" value={match.matchDate} onChange={(e) => setMatch({ ...match, matchDate: e.target.value })} className="bg-secondary h-12" /></div>
                <div className="space-y-2"><Label className="flex items-center gap-2"><Clock className="w-4 h-4" />Match Time</Label><Input type="time" value={match.matchTime} onChange={(e) => setMatch({ ...match, matchTime: e.target.value })} className="bg-secondary h-12" /></div>
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
