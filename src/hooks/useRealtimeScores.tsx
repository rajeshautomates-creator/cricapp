import { useState, useEffect } from 'react';
import { getStoredData, setStoredData, MockMatchScore, initialScores } from '@/lib/mockData';

export interface BatsmanStats {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  strikeRate: number;
}

export interface BowlerStats {
  id: string;
  name: string;
  overs: number;
  runs: number;
  wickets: number;
  economy: number;
}

export interface MatchScore {
  id: string;
  match_id: string;
  team_a_runs: number;
  team_a_wickets: number;
  team_a_overs: number;
  team_b_runs: number;
  team_b_wickets: number;
  team_b_overs: number;
  current_batting_team_id: string | null;
  current_striker: BatsmanStats | null;
  current_non_striker: BatsmanStats | null;
  current_bowler: BowlerStats | null;
  partnership: { runs: number; balls: number };
  this_over: string[];
  ball_by_ball: any[];
  history: MatchScore[];
  updated_at: string;
}

export const useRealtimeScores = (matchId: string | null) => {
  const [score, setScore] = useState<MatchScore | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!matchId) {
      setLoading(false);
      return;
    }

    const fetchScore = () => {
      // Using 'live_scores' instead of 'mock_scores' to move away from demo naming
      const scores = getStoredData<MatchScore[]>('live_scores', []);
      const matchScore = scores.find(s => s.match_id === matchId);

      if (matchScore) {
        setScore(matchScore);
      } else {
        const newScore: MatchScore = {
          id: `score-${Date.now()}`,
          match_id: matchId,
          team_a_runs: 0,
          team_a_wickets: 0,
          team_a_overs: 0,
          team_b_runs: 0,
          team_b_wickets: 0,
          team_b_overs: 0,
          current_batting_team_id: null,
          current_striker: null,
          current_non_striker: null,
          current_bowler: null,
          partnership: { runs: 0, balls: 0 },
          this_over: [],
          ball_by_ball: [],
          history: [],
          updated_at: new Date().toISOString()
        };
        const updatedScores = [...scores, newScore];
        setStoredData('live_scores', updatedScores);
        setScore(newScore);
      }
      setLoading(false);
    };

    fetchScore();
  }, [matchId]);

  const updateScore = async (updates: Partial<MatchScore>, saveToHistory = true) => {
    if (!matchId || !score) return { error: null };

    const newScore = {
      ...score,
      ...updates,
      updated_at: new Date().toISOString()
    };

    if (saveToHistory) {
      const { history, ...currentWithoutHistory } = score;
      newScore.history = [...(score.history || []).slice(-19), currentWithoutHistory as MatchScore];
    }

    setScore(newScore);

    const scores = getStoredData<MatchScore[]>('live_scores', []);
    const updatedScores = scores.map(s =>
      s.match_id === matchId ? newScore : s
    );
    setStoredData('live_scores', updatedScores);

    return { error: null };
  };

  const undo = async () => {
    if (!score || !score.history || score.history.length === 0) return;
    const previousState = score.history[score.history.length - 1];
    const newHistory = score.history.slice(0, -1);

    const restoredScore = { ...previousState, history: newHistory };
    setScore(restoredScore);

    const scores = getStoredData<MatchScore[]>('live_scores', []);
    const updatedScores = scores.map(s =>
      s.match_id === matchId ? restoredScore : s
    );
    setStoredData('live_scores', updatedScores);
  };

  const addBall = async (params: {
    runs: number;
    isWicket: boolean;
    isWide: boolean;
    isNoBall: boolean;
    isBye: boolean;
    isLegBye: boolean;
    dismissalType?: string;
    fielderName?: string;
    outPlayerId?: string;
  }) => {
    if (!matchId || !score) return { error: null };

    const { current_striker, current_non_striker, current_bowler, partnership } = score;

    // Update striker stats
    let newStriker = current_striker ? { ...current_striker } : null;
    if (newStriker && !params.isWide && !params.isBye && !params.isLegBye) {
      newStriker.runs += params.runs;
      if (!params.isNoBall) newStriker.balls += 1;
      if (params.runs === 4) newStriker.fours += 1;
      if (params.runs === 6) newStriker.sixes += 1;
      newStriker.strikeRate = newStriker.balls > 0 ? (newStriker.runs / newStriker.balls) * 100 : 0;
    }

    // Update bowler stats
    let newBowler = current_bowler ? { ...current_bowler } : null;
    if (newBowler) {
      if (!params.isWide && !params.isNoBall) {
        const balls = Math.round((newBowler.overs % 1) * 10);
        if (balls >= 5) {
          newBowler.overs = Math.floor(newBowler.overs) + 1;
        } else {
          newBowler.overs = Math.floor(newBowler.overs) + (balls + 1) / 10;
        }
      }

      const runsConceded = params.runs + (params.isWide || params.isNoBall ? 1 : 0);
      if (!params.isBye && !params.isLegBye) {
        newBowler.runs += runsConceded;
      }

      if (params.isWicket && params.dismissalType !== 'run out') {
        newBowler.wickets += 1;
      }

      const totalBalls = Math.floor(newBowler.overs) * 6 + Math.round((newBowler.overs % 1) * 10);
      newBowler.economy = totalBalls > 0 ? (newBowler.runs / (totalBalls / 6)) : 0;
    }

    // Partnership
    let newPartnership = { ...partnership };
    if (!params.isWide && !params.isNoBall) {
      newPartnership.balls += 1;
    }
    newPartnership.runs += params.runs + (params.isWide || params.isNoBall ? 1 : 0);

    // Calculate team overs
    let newTeamOvers = score.team_a_overs;
    if (!params.isWide && !params.isNoBall) {
      const currentBallsInOver = Math.round((score.team_a_overs % 1) * 10);
      if (currentBallsInOver >= 5) {
        newTeamOvers = Math.floor(score.team_a_overs) + 1;
      } else {
        newTeamOvers = Math.floor(score.team_a_overs) + (currentBallsInOver + 1) / 10;
      }
    }

    // Handle strike rotation
    let finalStriker = newStriker;
    let finalNonStriker = current_non_striker ? { ...current_non_striker } : null;

    if ((params.runs % 2 !== 0 && !params.isWide && !params.isNoBall) ||
      (params.isWide && params.runs % 2 !== 0)) {
      [finalStriker, finalNonStriker] = [finalNonStriker, finalStriker];
    }

    const isOverComplete = !params.isWide && !params.isNoBall && Math.round((newTeamOvers % 1) * 10) === 0;
    if (isOverComplete) {
      [finalStriker, finalNonStriker] = [finalNonStriker, finalStriker];
    }

    // Handle Wicket / Run Out
    if (params.isWicket) {
      newPartnership = { runs: 0, balls: 0 };
      if (params.dismissalType === 'run out' && params.outPlayerId === finalNonStriker?.id) {
        finalNonStriker = null;
      } else {
        finalStriker = null;
      }
    }

    const ballTag = params.isWicket ? 'W' :
      params.isWide ? `WD${params.runs > 0 ? `+${params.runs}` : ''}` :
        params.isNoBall ? `NB${params.runs > 0 ? `+${params.runs}` : ''}` :
          params.isBye ? `${params.runs}B` :
            params.isLegBye ? `${params.runs}LB` :
              params.runs.toString();

    const updates: Partial<MatchScore> = {
      team_a_runs: score.team_a_runs + params.runs + (params.isWide || params.isNoBall ? 1 : 0),
      team_a_wickets: params.isWicket ? score.team_a_wickets + 1 : score.team_a_wickets,
      team_a_overs: newTeamOvers,
      current_striker: finalStriker,
      current_non_striker: finalNonStriker,
      current_bowler: isOverComplete ? null : newBowler,
      partnership: newPartnership,
      this_over: isOverComplete ? [] : [...score.this_over, ballTag],
      ball_by_ball: [...score.ball_by_ball, { ...params, timestamp: new Date().toISOString() }]
    };

    return updateScore(updates);
  };

  return { score, loading, updateScore, addBall, undo };
};
