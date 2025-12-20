"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  User,
  Plus,
  ChevronLeft,
  Trash2,
  Users
} from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import {
  getStoredData,
  setStoredData,
  MockPlayer,
  MockTeam,
  initialPlayers,
  initialTeams
} from '@/lib/mockData';

const Players = () => {
  const params = useParams();
  const teamId = params?.teamId as string;
  const [players, setPlayers] = useState<MockPlayer[]>([]);
  const [team, setTeam] = useState<MockTeam | null>(null);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isAdmin } = useAuth();
  const { toast } = useToast();

  const [newPlayer, setNewPlayer] = useState({
    name: '',
    role: 'batsman',
    batting_style: 'right-handed',
    bowling_style: '',
    jersey_number: ''
  });

  useEffect(() => {
    if (teamId) {
      fetchTeam();
      fetchPlayers();
    }
  }, [teamId]);

  const fetchTeam = () => {
    const allTeams = getStoredData<MockTeam[]>('mock_teams', initialTeams);
    const foundTeam = allTeams.find(t => t.id === teamId);
    if (foundTeam) {
      setTeam(foundTeam);
    }
  };

  const fetchPlayers = () => {
    const allPlayers = getStoredData<MockPlayer[]>('mock_players', initialPlayers)
      .filter(p => p.team_id === teamId)
      .sort((a, b) => (a.jersey_number || 0) - (b.jersey_number || 0));
    setPlayers(allPlayers);
    setLoading(false);
  };

  const handleCreatePlayer = () => {
    if (!newPlayer.name) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Player name is required'
      });
      return;
    }

    const allPlayers = getStoredData<MockPlayer[]>('mock_players', initialPlayers);
    const newPlayerData: MockPlayer = {
      id: `player-${Date.now()}`,
      name: newPlayer.name,
      role: newPlayer.role || null,
      batting_style: newPlayer.batting_style || null,
      bowling_style: newPlayer.bowling_style || null,
      jersey_number: newPlayer.jersey_number ? parseInt(newPlayer.jersey_number) : null,
      team_id: teamId!,
      created_at: new Date().toISOString()
    };

    setStoredData('mock_players', [...allPlayers, newPlayerData]);

    toast({
      title: 'Success',
      description: 'Player added successfully'
    });
    setNewPlayer({
      name: '',
      role: 'batsman',
      batting_style: 'right-handed',
      bowling_style: '',
      jersey_number: ''
    });
    setIsDialogOpen(false);
    fetchPlayers();
  };

  const handleDeletePlayer = (playerId: string) => {
    const allPlayers = getStoredData<MockPlayer[]>('mock_players', initialPlayers);
    const updated = allPlayers.filter(p => p.id !== playerId);
    setStoredData('mock_players', updated);

    toast({
      title: 'Success',
      description: 'Player removed successfully'
    });
    fetchPlayers();
  };

  const getRoleBadge = (role: string | null) => {
    switch (role) {
      case 'batsman':
        return 'bg-primary text-primary-foreground';
      case 'bowler':
        return 'bg-accent text-accent-foreground';
      case 'all-rounder':
        return 'bg-gold text-foreground';
      case 'wicket-keeper':
        return 'bg-live text-live-foreground';
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
          {/* Back Button */}
          <Link
            href="/teams"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Teams
          </Link>

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-4xl mb-2">
                {team?.name || 'TEAM'} PLAYERS
              </h1>
              <p className="text-muted-foreground">
                {players.length} players in squad
              </p>
            </div>
            {isAdmin && (
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="hero">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Player
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-card border-border">
                  <DialogHeader>
                    <DialogTitle className="font-display text-2xl">ADD PLAYER</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Player Name *</Label>
                        <Input
                          value={newPlayer.name}
                          onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
                          className="bg-secondary"
                          placeholder="Virat Kohli"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Jersey Number</Label>
                        <Input
                          type="number"
                          value={newPlayer.jersey_number}
                          onChange={(e) => setNewPlayer({ ...newPlayer, jersey_number: e.target.value })}
                          className="bg-secondary"
                          placeholder="18"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Role</Label>
                      <Select
                        value={newPlayer.role}
                        onValueChange={(value) => setNewPlayer({ ...newPlayer, role: value })}
                      >
                        <SelectTrigger className="bg-secondary">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="batsman">Batsman</SelectItem>
                          <SelectItem value="bowler">Bowler</SelectItem>
                          <SelectItem value="all-rounder">All-rounder</SelectItem>
                          <SelectItem value="wicket-keeper">Wicket-keeper</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Batting Style</Label>
                        <Select
                          value={newPlayer.batting_style}
                          onValueChange={(value) => setNewPlayer({ ...newPlayer, batting_style: value })}
                        >
                          <SelectTrigger className="bg-secondary">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="right-handed">Right-handed</SelectItem>
                            <SelectItem value="left-handed">Left-handed</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label>Bowling Style</Label>
                        <Select
                          value={newPlayer.bowling_style}
                          onValueChange={(value) => setNewPlayer({ ...newPlayer, bowling_style: value })}
                        >
                          <SelectTrigger className="bg-secondary">
                            <SelectValue placeholder="Select style" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="fast">Fast</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="spin">Spin</SelectItem>
                            <SelectItem value="none">None</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button variant="hero" className="w-full" onClick={handleCreatePlayer}>
                      Add Player
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>

          {/* Players Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="bg-card border border-border rounded-2xl p-6 animate-pulse">
                  <div className="w-16 h-16 bg-secondary rounded-full mb-4 mx-auto" />
                  <div className="h-6 bg-secondary rounded w-3/4 mx-auto mb-2" />
                  <div className="h-4 bg-secondary rounded w-1/2 mx-auto" />
                </div>
              ))}
            </div>
          ) : players.length === 0 ? (
            <div className="text-center py-16">
              <Users className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-display text-2xl mb-2">NO PLAYERS YET</h3>
              <p className="text-muted-foreground mb-6">
                Add players to this team
              </p>
              {isAdmin && (
                <Button variant="hero" onClick={() => setIsDialogOpen(true)}>
                  <Plus className="w-5 h-5 mr-2" />
                  Add Player
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {players.map((player, index) => (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-6 text-center"
                >
                  <div className="w-20 h-20 bg-gradient-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    {player.jersey_number ? (
                      <span className="font-display text-3xl text-primary-foreground">
                        {player.jersey_number}
                      </span>
                    ) : (
                      <User className="w-10 h-10 text-primary-foreground" />
                    )}
                  </div>

                  <h3 className="font-display text-xl mb-2">{player.name}</h3>

                  <div className="flex justify-center gap-2 mb-4">
                    <Badge className={getRoleBadge(player.role)}>
                      {player.role || 'Player'}
                    </Badge>
                  </div>

                  <div className="text-sm text-muted-foreground space-y-1">
                    {player.batting_style && (
                      <p>Bats: {player.batting_style}</p>
                    )}
                    {player.bowling_style && player.bowling_style !== 'none' && (
                      <p>Bowls: {player.bowling_style}</p>
                    )}
                  </div>

                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="mt-4 text-destructive hover:text-destructive"
                      onClick={() => handleDeletePlayer(player.id)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </Button>
                  )}
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

export default Players;
