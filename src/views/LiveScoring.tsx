"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  RotateCcw,
  AlertCircle,
  CircleDot,
  RefreshCw,
  Users,
  Target,
  Trophy,
  UserPlus
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRealtimeScores, BatsmanStats, BowlerStats } from "@/hooks/useRealtimeScores";
import { useToast } from "@/hooks/use-toast";
import { api } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

const LiveScoring = () => {
  const params = useParams();
  const matchId = params?.matchId as string;
  const { score, loading, addBall, updateScore } = useRealtimeScores(matchId || null);
  const [match, setMatch] = useState<any>(null);
  const [isWicketModalOpen, setIsWicketModalOpen] = useState(false);
  const [isSetPlayersOpen, setIsSetPlayersOpen] = useState(false);
  const [availablePlayers, setAvailablePlayers] = useState<any[]>([]);
  const [selectionType, setSelectionType] = useState<'striker' | 'non_striker' | 'bowler' | 'new_batsman'>('striker');
  const { toast } = useToast();

  useEffect(() => {
    if (matchId) {
      fetchMatch();
    }
  }, [matchId]);

  const fetchMatch = async () => {
    try {
      const data = await api.get<any>(`/matches/${matchId}`);
      setMatch(data);
    } catch (error) {
      console.error('Failed to fetch match:', error);
    }
  };

  const handleAddRun = async (runs: number) => {
    if (!score?.current_striker || !score?.current_bowler) {
      setSelectionType(score?.current_striker ? 'bowler' : 'striker');
      setIsSetPlayersOpen(true);
      return;
    }
    await addBall({ runs, isWicket: false, isWide: false, isNoBall: false, isBye: false, isLegBye: false });
  };

  const handleWicket = async () => {
    if (!score?.current_striker) return;
    await addBall({ runs: 0, isWicket: true, isWide: false, isNoBall: false, isBye: false, isLegBye: false });
    setIsWicketModalOpen(true);
  };

  const handleExtra = async (type: 'wide' | 'noball') => {
    if (!score?.current_bowler) {
      setSelectionType('bowler');
      setIsSetPlayersOpen(true);
      return;
    }
    await addBall({ runs: 0, isWicket: false, isWide: type === 'wide', isNoBall: type === 'noball', isBye: false, isLegBye: false });
  };

  const handleSelectPlayer = async (player: any) => {
    if (selectionType === 'striker') {
      await updateScore({ current_striker: { id: player.id, name: player.name, runs: 0, balls: 0, fours: 0, sixes: 0 } });
      if (!score?.current_non_striker) setSelectionType('non_striker');
      else setIsSetPlayersOpen(false);
    } else if (selectionType === 'non_striker') {
      await updateScore({ current_non_striker: { id: player.id, name: player.name, runs: 0, balls: 0, fours: 0, sixes: 0 } });
      setIsSetPlayersOpen(false);
    } else if (selectionType === 'bowler') {
      await updateScore({ current_bowler: { id: player.id, name: player.name, overs: 0, runs: 0, wickets: 0 } });
      setIsSetPlayersOpen(false);
    } else if (selectionType === 'new_batsman') {
      await updateScore({ current_striker: { id: player.id, name: player.name, runs: 0, balls: 0, fours: 0, sixes: 0 } });
      setIsWicketModalOpen(false);
    }
  };

  const openPlayerSelection = (type: 'striker' | 'non_striker' | 'bowler' | 'new_batsman') => {
    setSelectionType(type);
    const teamId = type === 'bowler'
      ? (score?.current_batting_team_id === match?.teamAId ? match?.teamBId : match?.teamAId)
      : score?.current_batting_team_id || match?.teamAId;

    const team = teamId === match?.teamAId ? match?.teamA : match?.teamB;
    setAvailablePlayers(team?.players || []);
    if (type === 'new_batsman') setIsWicketModalOpen(true);
    else setIsSetPlayersOpen(true);
  };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-card border-b border-border p-4 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild><Link href="/matches"><ArrowLeft className="w-5 h-5" /></Link></Button>
            <div>
              <div className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">{match?.tournament?.name || 'Tournament'}</div>
              <div className="font-display text-lg md:text-xl text-primary">{match?.teamA?.shortName || 'TBA'} vs {match?.teamB?.shortName || 'TBA'}</div>
            </div>
          </div>
          <Badge className="bg-live text-live-foreground border-0 animate-pulse-live px-3 py-1 flex items-center gap-1.5 ring-2 ring-live/20">
            <CircleDot className="w-3 h-3" />
            <span className="text-[10px] font-bold tracking-widest uppercase">Live</span>
          </Badge>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* SCOREBOARD CARD */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-3xl overflow-hidden shadow-xl">
              <div className="bg-gradient-to-r from-primary/10 via-background to-accent/10 p-1" />
              <div className="p-6 md:p-8">
                <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                  <div className="flex items-center gap-6">
                    <div className="relative">
                      <div className="w-20 h-20 bg-secondary rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 group-hover:rotate-0 transition-transform">
                        <span className="font-display text-3xl text-primary font-bold">
                          {score?.current_batting_team_id === match?.teamAId ? match?.teamA?.shortName : match?.teamB?.shortName}
                        </span>
                      </div>
                      <div className="absolute -bottom-2 -right-2 bg-live text-[10px] font-bold text-live-foreground px-2 py-0.5 rounded-full shadow-md uppercase tracking-tighter">Batting</div>
                    </div>
                    <div>
                      <div className="font-display text-4xl md:text-6xl flex items-baseline gap-2">
                        <span className="font-bold">{score?.team_a_runs || 0}/{score?.team_a_wickets || 0}</span>
                        <span className="text-lg md:text-2xl text-muted-foreground font-medium">({score?.team_a_overs || 0})</span>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                        <Target className="w-4 h-4 text-accent" />
                        CRR: {score?.team_a_overs ? (score.team_a_runs / score.team_a_overs).toFixed(2) : '0.00'}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 w-full md:w-auto">
                    <div className="bg-secondary/50 rounded-2xl p-4 w-full md:min-w-[180px]">
                      <div className="text-[10px] text-muted-foreground uppercase font-bold mb-2 tracking-widest flex items-center justify-between">
                        <span>This Over</span>
                        <span className="text-accent font-display">{score?.team_a_overs && Math.round((score.team_a_overs % 1) * 10)} / 6</span>
                      </div>
                      <div className="flex gap-1.5 flex-wrap">
                        {score?.this_over?.length === 0 ? (
                          <span className="text-xs text-muted-foreground/50 italic">Waiting...</span>
                        ) : (
                          score?.this_over?.map((ball, i) => (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              key={i}
                              className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs border transition-all
                                ${ball === "W" ? "bg-live text-live-foreground border-live animate-bounce" :
                                  ball === "4" || ball === "6" ? "bg-accent text-accent-foreground border-accent shadow-lg shadow-accent/20" :
                                    "bg-card text-foreground border-border"}`}
                            >
                              {ball}
                            </motion.span>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* BATSMAN STATS SECTION */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <AnimatePresence mode="wait">
                    {[
                      { data: score?.current_striker, type: 'striker' as const, label: 'Striker' },
                      { data: score?.current_non_striker, type: 'non_striker' as const, label: 'Non-striker' }
                    ].map((bat, idx) => (
                      <motion.div
                        key={bat.type}
                        initial={{ opacity: 0, x: idx === 0 ? -20 : 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className={`p-4 rounded-2xl border transition-all ${bat.type === 'striker' ? 'bg-primary/5 border-primary/20 ring-1 ring-primary/10' : 'bg-muted/30 border-border'}`}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${bat.type === 'striker' ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
                            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">{bat.label}</span>
                          </div>
                          <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-primary" onClick={() => openPlayerSelection(bat.type)}>
                            <Users className="w-3 h-3 mr-1" /> Change
                          </Button>
                        </div>
                        {bat.data ? (
                          <div className="flex items-center justify-between">
                            <div className="font-display font-bold text-lg">{bat.data.name}</div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <div className="font-display text-xl font-bold">{bat.data.runs} <span className="text-xs text-muted-foreground font-sans">({bat.data.balls})</span></div>
                                <div className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">4s: {bat.data.fours} • 6s: {bat.data.sixes}</div>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <Button variant="outline" className="w-full border-dashed" size="sm" onClick={() => openPlayerSelection(bat.type)}>
                            <UserPlus className="w-4 h-4 mr-2" /> Select {bat.label}
                          </Button>
                        )}
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>

                {/* BOWLER STATS SECTION */}
                <div className="mt-4">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 rounded-2xl bg-accent/5 border border-accent/20"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-accent" />
                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Current Bowler</span>
                      </div>
                      <Button variant="ghost" size="sm" className="h-6 px-1.5 text-[10px] text-accent" onClick={() => openPlayerSelection('bowler')}>
                        <RefreshCw className="w-3 h-3 mr-1" /> New Bowler
                      </Button>
                    </div>
                    {score?.current_bowler ? (
                      <div className="flex items-center justify-between">
                        <div className="font-display font-bold text-lg">{score.current_bowler.name}</div>
                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <div className="font-display font-bold">{score.current_bowler.overs}</div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Overs</div>
                          </div>
                          <div className="text-center">
                            <div className="font-display font-bold">{score.current_bowler.runs}</div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Runs</div>
                          </div>
                          <div className="text-center">
                            <div className="font-display font-bold text-accent">{score.current_bowler.wickets}</div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Wkts</div>
                          </div>
                          <div className="text-center hidden md:block">
                            <div className="font-display font-bold">{(score.current_bowler.runs / (score.current_bowler.overs || 1)).toFixed(2)}</div>
                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">Econ</div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full border-dashed" size="sm" onClick={() => openPlayerSelection('bowler')}>
                        <UserPlus className="w-4 h-4 mr-2" /> Select Bowler
                      </Button>
                    )}
                  </motion.div>
                </div>
              </div>
            </motion.div>

            {/* DEMO MODE NOTICE */}
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="bg-card/50 border border-border p-4 rounded-2xl flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-accent shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-bold uppercase tracking-wider mb-1">Scoring Mode: Persistent Demo</div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your session is being saved in real-time. Match state will persist even if you refresh or navigate away.
                </p>
              </div>
            </motion.div>
          </div>

          {/* SCORING CONTROLS */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-card border border-border rounded-3xl p-6 shadow-xl sticky top-28">
              <div className="mb-6">
                <h2 className="font-display text-2xl flex items-center gap-2">
                  <CircleDot className="w-5 h-5 text-primary" />
                  CONTROLS
                </h2>
                <p className="text-xs text-muted-foreground">Tap a button to score the ball</p>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-4">
                {[0, 1, 2, 3, 4, 6].map((run) => (
                  <Button
                    key={run}
                    variant={run === 4 || run === 6 ? "hero" : "secondary"}
                    className="h-16 font-display text-3xl transition-transform active:scale-90 hover:scale-[1.02]"
                    onClick={() => handleAddRun(run)}
                  >
                    {run}
                  </Button>
                ))}
              </div>

              <Button
                variant="destructive"
                className="w-full h-16 mb-4 font-display text-2xl flex items-center justify-center gap-3 transition-all hover:bg-destructive/90 shadow-lg shadow-destructive/10"
                onClick={handleWicket}
              >
                OUT
                <div className="w-px h-6 bg-white/20" />
                <Users className="w-5 h-5" />
              </Button>

              <div className="grid grid-cols-2 gap-3 mb-6">
                <Button variant="outline" className="h-12 font-bold ring-1 ring-border" onClick={() => handleExtra('wide')}>WIDE</Button>
                <Button variant="outline" className="h-12 font-bold ring-1 ring-border" onClick={() => handleExtra('noball')}>NO BALL</Button>
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => updateScore({ this_over: score?.this_over.slice(0, -1) })}>
                  <RotateCcw className="w-3 h-3 mr-1" /> Undo Last Ball
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </main>

      {/* PLAYER SELECTION DIALOG */}
      <Dialog open={isSetPlayersOpen} onOpenChange={setIsSetPlayersOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md overflow-hidden p-0 rounded-3xl">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="font-display text-2xl tracking-tight uppercase">
              Select {selectionType.replace('_', ' ')}
            </DialogTitle>
            <DialogDescription>
              Choose a player from the list to continue scoring.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="h-[400px] px-6 pb-6">
            <div className="grid grid-cols-1 gap-2 pt-2">
              {availablePlayers.length === 0 ? (
                <div className="text-center py-10 text-muted-foreground bg-secondary/20 rounded-2xl border border-dashed">
                  No players found in team
                </div>
              ) : (
                availablePlayers.map((player) => (
                  <Button
                    key={player.id}
                    variant="ghost"
                    className="w-full justify-start h-14 rounded-xl border border-transparent hover:border-primary/20 hover:bg-primary/5 transition-all text-left group"
                    onClick={() => handleSelectPlayer(player)}
                  >
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center font-bold text-xs mr-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {player.name.substring(0, 1)}
                    </div>
                    <div>
                      <div className="font-bold">{player.name}</div>
                      <div className="text-[10px] text-muted-foreground uppercase tracking-widest">{player.role || 'All-rounder'}</div>
                    </div>
                  </Button>
                ))
              )}
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>

      {/* WICKET MODAL */}
      <Dialog open={isWicketModalOpen} onOpenChange={setIsWicketModalOpen}>
        <DialogContent className="bg-card border-border sm:max-w-md overflow-hidden p-0 rounded-3xl">
          <div className="bg-live p-8 text-center text-live-foreground">
            <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <h2 className="font-display text-4xl font-bold tracking-tighter mb-2">OUT!!</h2>
            <p className="text-live-foreground/80 font-medium">Select a new batsman to take the crease</p>
          </div>
          <div className="p-6">
            <ScrollArea className="h-[300px]">
              <div className="grid grid-cols-1 gap-2">
                {availablePlayers.map((player) => (
                  <Button
                    key={player.id}
                    variant="outline"
                    className="w-full justify-start h-14 rounded-xl border-border hover:border-live hover:bg-live/5 text-left"
                    onClick={() => {
                      setSelectionType('new_batsman');
                      handleSelectPlayer(player);
                    }}
                  >
                    <div className="font-bold">{player.name}</div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveScoring;
