"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, AlertCircle, CircleDot, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useRealtimeScores } from "@/hooks/useRealtimeScores";
import { useToast } from "@/hooks/use-toast";
import { getStoredData, MockMatch, MockTeam, MockTournament, initialMatches, initialTeams, initialTournaments } from "@/lib/mockData";

const LiveScoring = () => {
  const params = useParams();
  const matchId = params?.matchId as string;
  const { score, loading, addBall } = useRealtimeScores(matchId || null);
  const [match, setMatch] = useState<any>(null);
  const [currentOver, setCurrentOver] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => { if (matchId) fetchMatch(); }, [matchId]);

  const fetchMatch = () => {
    const allMatches = getStoredData<MockMatch[]>('mock_matches', initialMatches);
    const allTeams = getStoredData<MockTeam[]>('mock_teams', initialTeams);
    const allTournaments = getStoredData<MockTournament[]>('mock_tournaments', initialTournaments);
    const m = allMatches.find(m => m.id === matchId);
    if (m) setMatch({ ...m, team_a: allTeams.find(t => t.id === m.team_a_id), team_b: allTeams.find(t => t.id === m.team_b_id), tournament: allTournaments.find(t => t.id === m.tournament_id) });
  };

  const handleAddRun = async (runs: number) => {
    await addBall({ runs, isWicket: false, isWide: false, isNoBall: false, isBye: false, isLegBye: false });
    setCurrentOver(prev => [...prev, runs.toString()]);
  };

  const handleWicket = async () => {
    await addBall({ runs: 0, isWicket: true, isWide: false, isNoBall: false, isBye: false, isLegBye: false });
    setCurrentOver(prev => [...prev, 'W']);
  };

  const handleExtra = async (type: 'wide' | 'noball') => {
    await addBall({ runs: 1, isWicket: false, isWide: type === 'wide', isNoBall: type === 'noball', isBye: false, isLegBye: false });
    setCurrentOver(prev => [...prev, type === 'wide' ? 'WD' : 'NB']);
  };

  const handleEndOver = () => { setCurrentOver([]); toast({ title: 'Over Completed' }); };

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><RefreshCw className="w-8 h-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" asChild><Link href="/matches"><ArrowLeft className="w-5 h-5" /></Link></Button>
            <div><div className="text-sm text-muted-foreground">{match?.tournament?.name || 'Tournament'}</div><div className="font-display text-xl">{match?.team_a?.short_name || 'Team A'} vs {match?.team_b?.short_name || 'Team B'}</div></div>
          </div>
          <Badge className="bg-gradient-live text-live-foreground border-0 animate-pulse-live"><CircleDot className="w-3 h-3 mr-1" />LIVE</Badge>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-2 bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-6">SCOREBOARD</h2>
            <div className="bg-secondary rounded-xl p-6 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"><div className="w-14 h-14 bg-primary rounded-xl flex items-center justify-center"><span className="font-display text-2xl">{match?.team_a?.short_name || 'A'}</span></div><div><div className="font-semibold text-lg">{match?.team_a?.name || 'Team A'}</div><div className="text-sm text-muted-foreground">Batting</div></div></div>
                <div className="text-right"><div className="font-display text-5xl">{score?.team_a_runs || 0}/{score?.team_a_wickets || 0}</div><div className="text-muted-foreground">{score?.team_a_overs || 0} overs</div></div>
              </div>
            </div>
            <div className="bg-muted rounded-xl p-6 opacity-60">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4"><div className="w-14 h-14 bg-secondary rounded-xl flex items-center justify-center"><span className="font-display text-2xl">{match?.team_b?.short_name || 'B'}</span></div><div><div className="font-semibold text-lg">{match?.team_b?.name || 'Team B'}</div><div className="text-sm text-muted-foreground">Yet to bat</div></div></div>
                <div className="text-right"><div className="font-display text-5xl">{score?.team_b_runs || 0}/{score?.team_b_wickets || 0}</div><div className="text-muted-foreground">{score?.team_b_overs || 0} overs</div></div>
              </div>
            </div>
            <div className="mt-6 p-4 bg-secondary rounded-xl">
              <div className="flex items-center justify-between mb-3"><span className="text-sm text-muted-foreground">This Over</span><Button variant="ghost" size="sm" onClick={() => setCurrentOver(prev => prev.slice(0, -1))}><RotateCcw className="w-4 h-4 mr-1" />Undo</Button></div>
              <div className="flex gap-2 flex-wrap">{currentOver.length === 0 ? <span className="text-muted-foreground text-sm">No balls yet</span> : currentOver.map((ball, i) => <span key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm ${ball === "W" ? "bg-live text-live-foreground" : ball === "4" || ball === "6" ? "bg-accent text-accent-foreground" : "bg-card text-foreground"}`}>{ball}</span>)}</div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-6">
            <h2 className="font-display text-2xl mb-6">SCORING</h2>
            <div className="grid grid-cols-3 gap-3 mb-6">{[0, 1, 2, 3, 4, 6].map((run) => <Button key={run} variant={run === 4 || run === 6 ? "hero" : "secondary"} size="lg" onClick={() => handleAddRun(run)} className="h-16 font-display text-2xl">{run}</Button>)}</div>
            <Button variant="destructive" size="lg" className="w-full h-14 mb-4 font-display text-xl" onClick={handleWicket}>WICKET</Button>
            <div className="space-y-2"><span className="text-sm text-muted-foreground">Extras</span><div className="grid grid-cols-2 gap-3"><Button variant="outline" onClick={() => handleExtra('wide')}>Wide</Button><Button variant="outline" onClick={() => handleExtra('noball')}>No Ball</Button></div></div>
            <Button variant="gold" className="w-full mt-6" size="lg" onClick={handleEndOver}>End Over</Button>
          </motion.div>
        </div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="mt-6 bg-card border border-border rounded-2xl p-6">
          <div className="flex items-center gap-2 text-accent mb-2"><AlertCircle className="w-5 h-5" /><span className="font-semibold">Demo Mode</span></div>
          <p className="text-muted-foreground">Scores are stored locally. {match?.team_a?.name} batting • {match?.overs || 20} overs match</p>
        </motion.div>
      </main>
    </div>
  );
};

export default LiveScoring;
