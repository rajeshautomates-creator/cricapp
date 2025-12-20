"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Trophy,
  Users,
  Calendar,
  BarChart3,
  Plus,
  Play,
  ChevronRight,
  Settings,
  LogOut
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";

const Dashboard = () => {
  const [recentMatches, setRecentMatches] = useState<any[]>([]);
  const [stats, setStats] = useState({
    tournaments: 0,
    teams: 0,
    matches: 0,
    liveMatches: 0
  });
  const [loading, setLoading] = useState(true);
  const { signOut, user, isAdmin } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user && isAdmin) {
      fetchDashboardData();
    }
  }, [user, isAdmin]);

  const fetchDashboardData = async () => {
    try {
      const data = await api.get<any>('/dashboard/stats');
      setStats(data.stats);
      setRecentMatches(data.recentMatches);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.push('/');
  };

  const statCards = [
    { icon: Trophy, label: "Tournaments", value: stats.tournaments.toString(), change: "Your tournaments" },
    { icon: Users, label: "Teams", value: stats.teams.toString(), change: "Total teams" },
    { icon: Calendar, label: "Matches", value: stats.matches.toString(), change: "Scheduled" },
    { icon: Play, label: "Live Now", value: stats.liveMatches.toString(), change: "Active matches" },
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden lg:block relative">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-accent rounded-lg flex items-center justify-center">
              <span className="font-display text-2xl text-accent-foreground">C</span>
            </div>
            <span className="font-display text-xl tracking-wider">SCORE</span>
          </Link>

          <nav className="space-y-1">
            {[
              { icon: BarChart3, label: "Dashboard", href: "/dashboard", active: true },
              { icon: Trophy, label: "Tournaments", href: "/tournaments" },
              { icon: Users, label: "Teams", href: "/teams" },
              { icon: Calendar, label: "Matches", href: "/matches" },
              { icon: Settings, label: "Settings", href: "/dashboard/settings" },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${item.active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 w-64 p-6 border-t border-border">
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground"
            onClick={handleSignOut}
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl mb-1">DASHBOARD</h1>
              <p className="text-muted-foreground">Welcome back, {user?.fullName || 'Admin'}</p>
            </div>
            <Button variant="hero" asChild>
              <Link href="/dashboard/tournaments/new">
                <Plus className="w-5 h-5 mr-2" />
                New Tournament
              </Link>
            </Button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-secondary rounded-xl flex items-center justify-center">
                    <stat.icon className="w-6 h-6 text-accent" />
                  </div>
                  <span className="text-xs text-muted-foreground">{stat.change}</span>
                </div>
                <div className="font-display text-4xl mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Recent Matches & Quick Actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl">RECENT MATCHES</h2>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/matches">
                    View All <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>

              <div className="space-y-4">
                {recentMatches.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No matches yet</p>
                ) : (
                  recentMatches.map((match) => (
                    <div key={match.id} className="flex items-center justify-between p-4 bg-secondary rounded-xl">
                      <div className="flex items-center gap-4">
                        <div className="font-display text-lg">
                          {match.teamA?.shortName || 'TBA'} vs {match.teamB?.shortName || 'TBA'}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {match.status === "LIVE" && (
                          <>
                            <span className="text-sm text-muted-foreground">
                              {match.score?.teamARuns || 0}/{match.score?.teamAWickets || 0}
                            </span>
                            <span className="px-2 py-1 bg-live text-live-foreground text-xs rounded-full animate-pulse-live">LIVE</span>
                          </>
                        )}
                        {match.status === "UPCOMING" && (
                          <span className="text-sm text-muted-foreground">
                            {new Date(match.matchDate).toLocaleDateString()}
                          </span>
                        )}
                        {match.status === "COMPLETED" && (
                          <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded-full">COMPLETED</span>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl">QUICK ACTIONS</h2>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Trophy, label: "New Tournament", color: "bg-primary", href: "/dashboard/tournaments/new" },
                  { icon: Users, label: "Add Team", color: "bg-accent", href: "/teams" },
                  { icon: Calendar, label: "Schedule Match", color: "bg-gold", href: "/schedule-match" },
                  { icon: Play, label: "Start Scoring", color: "bg-live", href: "/matches" },
                ].map((action) => (
                  <Link
                    key={action.label}
                    href={action.href}
                    className="flex flex-col items-center gap-3 p-6 rounded-xl bg-secondary hover:bg-muted transition-colors"
                  >
                    <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center`}>
                      <action.icon className="w-6 h-6 text-foreground" />
                    </div>
                    <span className="text-sm font-medium">{action.label}</span>
                  </Link>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Dashboard;
