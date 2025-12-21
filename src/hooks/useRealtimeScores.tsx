import { useState, useEffect } from 'react';
import { getStoredData, setStoredData, MockMatchScore, initialScores } from '@/lib/mockData';

export interface BatsmanStats {
  id: string;
  name: string;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
}

export interface BowlerStats {
  id: string;
  name: string;
  overs: number;
  runs: number;
  wickets: number;
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
  this_over: string[];
  ball_by_ball: any[];
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
      const scores = getStoredData<MatchScore[]>('mock_scores', initialScores as any);
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
          this_over: [],
          ball_by_ball: [],
          updated_at: new Date().toISOString()
        };
        const updatedScores = [...scores, newScore];
        setStoredData('mock_scores', updatedScores);
        setScore(newScore);
      }
      setLoading(false);
    };

    fetchScore();
  }, [matchId]);

  const updateScore = async (updates: Partial<MatchScore>) => {
    if (!matchId || !score) return { error: null };

    const updatedScore = {
      ...score,
      ...updates,
      updated_at: new Date().toISOString()
    };

    setScore(updatedScore);

    const scores = getStoredData<MatchScore[]>('mock_scores', initialScores as any);
    const updatedScores = scores.map(s =>
      s.match_id === matchId
        ? { ...s, ...updates, updated_at: new Date().toISOString() }
        : s
    );
    setStoredData('mock_scores', updatedScores);

    return { error: null };
  };

  const addBall = async (ball: {
    runs: number;
    isWicket: boolean;
    isWide: boolean;
    isNoBall: boolean;
    isBye: boolean;
    isLegBye: boolean;
    batsmanId?: string;
    bowlerId?: string;
    batsmanName?: string;
    bowlerName?: string;
  }) => {
    if (!matchId || !score) return { error: null };

    const { striker, nonStriker, current_bowler } = {
      striker: score.current_striker,
      nonStriker: score.current_non_striker,
      current_bowler: score.current_bowler
    };

    // Update striker stats
    let newStriker = striker ? { ...striker } : null;
    if (newStriker && !ball.isWide && !ball.isNoBall && !ball.isBye && !ball.isLegBye) {
      newStriker.runs += ball.runs;
      newStriker.balls += 1;
      if (ball.runs === 4) newStriker.fours += 1;
      if (ball.runs === 6) newStriker.sixes += 1;
    }

    // Update bowler stats
    let newBowler = current_bowler ? { ...current_bowler } : null;
    if (newBowler) {
      if (!ball.isWide && !ball.isNoBall) {
        const balls = Math.round((newBowler.overs % 1) * 10);
        if (balls >= 5) {
          newBowler.overs = Math.floor(newBowler.overs) + 1;
        } else {
          newBowler.overs = Math.floor(newBowler.overs) + (balls + 1) / 10;
        }
      }
      newBowler.runs += ball.runs + (ball.isWide || ball.isNoBall ? 1 : 0);
      if (ball.isWicket) newBowler.wickets += 1;
    }

    // Calculate new team overs
    let newTeamOvers = score.team_a_overs;
    if (!ball.isWide && !ball.isNoBall) {
      const currentBallsInOver = Math.round((score.team_a_overs % 1) * 10);
      if (currentBallsInOver >= 5) {
        newTeamOvers = Math.floor(score.team_a_overs) + 1;
      } else {
        newTeamOvers = Math.floor(score.team_a_overs) + (currentBallsInOver + 1) / 10;
      }
    }

    // Handle strike rotation on runs
    let finalStriker = newStriker;
    let finalNonStriker = nonStriker ? { ...nonStriker } : null;
    if (ball.runs % 2 !== 0 && !ball.isWide && !ball.isNoBall) {
      [finalStriker, finalNonStriker] = [finalNonStriker, finalStriker];
    }

    // Handle over completion strike rotation
    const isOverComplete = !ball.isWide && !ball.isNoBall && Math.round((newTeamOvers % 1) * 10) === 0;
    if (isOverComplete) {
      [finalStriker, finalNonStriker] = [finalNonStriker, finalStriker];
    }

    const ballTag = ball.isWicket ? 'W' :
      ball.isWide ? 'WD' :
        ball.isNoBall ? 'NB' :
          ball.runs.toString();

    const updates: Partial<MatchScore> = {
      team_a_runs: score.team_a_runs + ball.runs + (ball.isWide || ball.isNoBall ? 1 : 0),
      team_a_wickets: ball.isWicket ? score.team_a_wickets + 1 : score.team_a_wickets,
      team_a_overs: newTeamOvers,
      current_striker: finalStriker,
      current_non_striker: finalNonStriker,
      current_bowler: newBowler,
      this_over: isOverComplete ? [] : [...score.this_over, ballTag],
      ball_by_ball: [...score.ball_by_ball, { ...ball, timestamp: new Date().toISOString() }]
    };

    return updateScore(updates);
  };

  return { score, loading, updateScore, addBall };
};
