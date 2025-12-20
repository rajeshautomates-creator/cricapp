// Mock data for demonstration purposes

export interface MockUser {
  id: string;
  email: string;
  full_name: string;
  role: 'superadmin' | 'admin' | 'viewer';
  hasActiveSubscription: boolean;
}

export interface MockTournament {
  id: string;
  name: string;
  description: string | null;
  logo_url: string | null;
  start_date: string;
  end_date: string;
  venue: string | null;
  overs_format: number | null;
  status: string | null;
  admin_id: string;
  created_at: string;
}

export interface MockTeam {
  id: string;
  name: string;
  short_name: string | null;
  logo_url: string | null;
  captain: string | null;
  coach: string | null;
  tournament_id: string;
  created_at: string;
}

export interface MockPlayer {
  id: string;
  name: string;
  role: string | null;
  batting_style: string | null;
  bowling_style: string | null;
  jersey_number: number | null;
  team_id: string;
  created_at: string;
}

export interface MockMatch {
  id: string;
  tournament_id: string;
  team_a_id: string;
  team_b_id: string;
  match_date: string;
  venue: string;
  overs: number | null;
  status: string | null;
  created_at: string;
}

export interface MockMatchScore {
  id: string;
  match_id: string;
  team_a_runs: number;
  team_a_wickets: number;
  team_a_overs: number;
  team_b_runs: number;
  team_b_wickets: number;
  team_b_overs: number;
  current_batting_team_id: string | null;
  ball_by_ball: any[];
  updated_at: string;
}

// Empty arrays for production (no demo data)
export const initialTournaments: MockTournament[] = [];
export const initialTeams: MockTeam[] = [];
export const initialPlayers: MockPlayer[] = [];
export const initialMatches: MockMatch[] = [];
export const initialScores: MockMatchScore[] = [];
export const mockAdminUsers: any[] = [];
export const mockViewerSubscriptions: any[] = [];

// Payment settings (for initial setup only)
export const initialPaymentSettings = {
  viewer_subscription_amount: 20,
  viewer_validity_days: 30,
  admin_purchase_amount: 500,
  admin_validity_days: 365,
  razorpay_key_id: ''
};

// Helper to get data from localStorage with fallback to initial data
export const getStoredData = <T>(key: string, fallback: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : fallback;
  } catch {
    return fallback;
  }
};

// Helper to store data in localStorage
export const setStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Failed to store data:', error);
  }
};

// Initialize empty data structures in localStorage if not present
export const initializeMockData = () => {
  if (!localStorage.getItem('mock_tournaments')) {
    setStoredData('mock_tournaments', []);
  }
  if (!localStorage.getItem('mock_teams')) {
    setStoredData('mock_teams', []);
  }
  if (!localStorage.getItem('mock_players')) {
    setStoredData('mock_players', []);
  }
  if (!localStorage.getItem('mock_matches')) {
    setStoredData('mock_matches', []);
  }
  if (!localStorage.getItem('mock_scores')) {
    setStoredData('mock_scores', []);
  }
  if (!localStorage.getItem('mock_payment_settings')) {
    setStoredData('mock_payment_settings', initialPaymentSettings);
  }
};
