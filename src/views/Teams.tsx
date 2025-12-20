"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Users,
  Plus,
  Search,
  ChevronRight,
  Trophy,
  User,
  Trash2
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { api } from '@/lib/api';

interface Tournament {
  id: string;
  name: string;
}

interface Team {
  id: string;
  name: string;
  shortName: string | null;
  logoUrl: string | null;
  captain: string | null;
  coach: string | null;
  tournamentId: string;
  tournament?: { name: string };
  playersCount?: number;
}

const Teams = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [tournaments, setTournaments] = useState<Tournament[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTournament, setSelectedTournament] = useState<string>('all');
  const searchParams = useSearchParams();
  const { isAdmin, user } = useAuth();
  const { toast } = useToast();

  const [newTeam, setNewTeam] = useState({
    name: '',
    shortName: '',
    captain: '',
    coach: '',
    tournamentId: ''
  });

  useEffect(() => {
    if (user) {
      Promise.all([fetchTournaments(), fetchTeams()]);
    }
  }, [user]);

  const fetchTournaments = async () => {
    try {
      const data = await api.get<Tournament[]>('/tournaments');
      // For Admins, we might want to only show their own tournaments if the backend returns all.
      // Assuming the backend returns tournaments relative to the user's role or all public ones.
      setTournaments(data);

      const tournamentParam = searchParams?.get('tournament');
      if (tournamentParam) {
        setSelectedTournament(tournamentParam);
        setNewTeam(prev => ({ ...prev, tournamentId: tournamentParam }));
      }
    } catch (error) {
      console.error('Failed to fetch tournaments:', error);
    }
  };

  const fetchTeams = async () => {
    try {
      const data = await api.get<any[]>('/teams');
      const teamsWithDetails: Team[] = data.map(team => ({
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        logoUrl: team.logoUrl,
        captain: team.captain,
        coach: team.coach,
        tournamentId: team.tournamentId,
        tournament: team.tournament ? { name: team.tournament.name } : undefined,
        playersCount: team._count?.players || 0
      }));
      setTeams(teamsWithDetails);
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTeam = async () => {
    if (!newTeam.name || !newTeam.tournamentId) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please fill in all required fields'
      });
      return;
    }

    try {
      await api.post('/teams', {
        name: newTeam.name,
        shortName: newTeam.shortName || null,
        captain: newTeam.captain || null,
        coach: newTeam.coach || null,
        tournamentId: newTeam.tournamentId,
      });

      toast({
        title: 'Success',
        description: 'Team created successfully'
      });
      setNewTeam({ name: '', shortName: '', captain: '', coach: '', tournamentId: '' });
      setIsDialogOpen(false);
      fetchTeams();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create team'
      });
    }
  };

  const handleDeleteTeam = async (teamId: string) => {
    if (!confirm('Are you sure you want to delete this team?')) return;

    try {
      await api.delete(`/teams/${teamId}`);
      toast({
        title: 'Success',
        description: 'Team deleted successfully'
      });
      fetchTeams();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to delete team'
      });
    }
  };

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTournament = selectedTournament === 'all' || team.tournamentId === selectedTournament;
    return matchesSearch && matchesTournament;
  });

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
              <h1 className="font-display text-4xl mb-2">TEAMS</h1>
              <p className="text-muted-foreground">
                Manage teams and players
              </p>
            </div>
            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Team
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">CREATE TEAM</DialogTitle>
                    <DialogDescription>
                      Enter the details below to add a new team to your tournament.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label>Tournament *</Label>
                      <Select
                        value={newTeam.tournamentId}
                        onValueChange={(value) => setNewTeam({ ...newTeam, tournamentId: value })}
                      >
                        <SelectTrigger className="bg-secondary">
                          <SelectValue placeholder="Select tournament" />
                        </SelectTrigger>
                        <SelectContent>
                          {tournaments.map((t) => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Team Name *</Label>
                      <Input
                        value={newTeam.name}
                        onChange={(e) => setNewTeam({ ...newTeam, name: e.target.value })}
                        className="bg-secondary"
                        placeholder="Mumbai Indians"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Short Name</Label>
                      <Input
                        value={newTeam.shortName}
                        onChange={(e) => setNewTeam({ ...newTeam, shortName: e.target.value })}
                        className="bg-secondary"
                        placeholder="MI"
                        maxLength={5}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Captain</Label>
                        <Input
                          value={newTeam.captain}
                          onChange={(e) => setNewTeam({ ...newTeam, captain: e.target.value })}
                          className="bg-secondary"
                          placeholder="Captain name"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Coach</Label>
                        <Input
                          value={newTeam.coach}
                          onChange={(e) => setNewTeam({ ...newTeam, coach: e.target.value })}
                          className="bg-secondary"
                          placeholder="Coach name"
                        />
                      </div>
                    </div>
                    <Button variant="hero" className="w-full" onClick={handleCreateTeam}>
                      Create Team
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search teams..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 bg-card border-border"
              />
            </div>
            <Select value={selectedTournament} onValueChange={setSelectedTournament}>
              <SelectTrigger className="w-full sm:w-[200px] h-12 bg-card">
                <SelectValue placeholder="All Tournaments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tournaments</SelectItem>
                {tournaments.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Teams Grid */}
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
          ) : filteredTeams.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-2xl mb-2">NO TEAMS FOUND</h3>
              <p className="text-muted-foreground mb-6">
                {tournaments.length === 0
                  ? 'Create a tournament first, then add teams'
                  : 'Add teams to your tournaments'}
              </p>
              {isAdmin && tournaments.length > 0 && (
                <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Team
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map((team, index) => (
                <motion.div
                  key={team.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="group bg-card border border-border rounded-2xl p-6 hover:border-primary/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-16 h-16 bg-gradient-accent rounded-xl flex items-center justify-center">
                      {team.logoUrl ? (
                        <img
                          src={team.logoUrl}
                          alt={team.name}
                          className="w-12 h-12 object-contain"
                        />
                      ) : (
                        <span className="font-display text-2xl text-accent-foreground">
                          {team.shortName || team.name.substring(0, 2).toUpperCase()}
                        </span>
                      )}
                    </div>
                    <Badge className="bg-secondary text-secondary-foreground">
                      {team.playersCount} Players
                    </Badge>
                  </div>

                  <h3 className="font-display text-xl mb-1">{team.name}</h3>
                  {team.shortName && (
                    <p className="text-sm text-muted-foreground mb-3">{team.shortName}</p>
                  )}

                  <div className="space-y-2 text-sm text-muted-foreground mb-4">
                    {team.captain && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span>Captain: {team.captain}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Trophy className="w-4 h-4" />
                      <span>{team.tournament?.name}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-border">
                    <Link
                      href={`/teams/${team.id}/players`}
                      className="flex items-center gap-2 text-primary hover:underline"
                    >
                      <span className="text-sm font-medium">Manage Players</span>
                      <ChevronRight className="w-4 h-4" />
                    </Link>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDeleteTeam(team.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
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

export default Teams;
