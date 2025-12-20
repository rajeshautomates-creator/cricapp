"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Users,
  CreditCard,
  Trophy,
  Settings,
  LogOut,
  BarChart3,
  ChevronRight,
  Search,
  UserPlus,
  DollarSign,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { UserRole } from '@/types/auth';

interface AdminUser {
  id: string;
  email: string;
  fullName: string | null;
  createdAt: string;
  role: UserRole;
  purchase_status?: string | null;
}

interface Stats {
  totalUsers: number;
  totalAdmins: number;
  activeSubscribers: number;
  totalTournaments: number;
  totalRevenue: number;
}

const SuperAdminDashboard = () => {
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    totalAdmins: 0,
    activeSubscribers: 0,
    totalTournaments: 0,
    totalRevenue: 0
  });
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { signOut, user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get<Stats>('/users/stats'),
        api.get<{ data: AdminUser[] }>('/users?limit=50')
      ]);

      setStats({
        ...statsRes,
        totalRevenue: statsRes.totalRevenue || 0 // Backend currently doesn't return revenue in stats, handle it
      });

      const adminList = usersRes.data.filter(u =>
        u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN
      );
      setAdmins(adminList);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to fetch dashboard data',
      });
    } finally {
      setLoading(false);
    }
  };

  const promoteToAdmin = async (userId: string) => {
    try {
      await api.patch(`/users/${userId}/role`, { role: UserRole.ADMIN });
      toast({
        title: 'Success',
        description: 'User promoted to admin'
      });
      fetchData();
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to promote user'
      });
    }
  };

  const filteredAdmins = admins.filter(admin =>
    admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.totalUsers, color: 'text-primary' },
    { icon: Shield, label: 'Active Admins', value: stats.totalAdmins, color: 'text-accent' },
    { icon: CreditCard, label: 'Subscribers', value: stats.activeSubscribers, color: 'text-gold' },
    { icon: Trophy, label: 'Tournaments', value: stats.totalTournaments, color: 'text-live' },
    { icon: DollarSign, label: 'Total Revenue', value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, color: 'text-primary' }
  ];

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border hidden lg:block">
        <div className="p-6">
          <Link href="/" className="flex items-center gap-2 mb-8">
            <div className="w-10 h-10 bg-gradient-live rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-live-foreground" />
            </div>
            <span className="font-display text-xl tracking-wider">SUPER ADMIN</span>
          </Link>

          <nav className="space-y-1">
            {[
              { icon: BarChart3, label: 'Dashboard', href: '/superadmin', exact: true },
              { icon: Users, label: 'Manage Users', href: '/superadmin/users' },
              { icon: Shield, label: 'Manage Admins', href: '/superadmin/admins' },
              { icon: CreditCard, label: 'Subscriptions', href: '/superadmin/subscriptions' },
              { icon: Trophy, label: 'Tournaments', href: '/superadmin/tournaments' },
              { icon: Settings, label: 'Settings', href: '/superadmin/settings' },
            ].map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${typeof window !== 'undefined' && (item.exact ? window.location.pathname === item.href : window.location.pathname.startsWith(item.href))
                  ? 'bg-live text-live-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
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
            onClick={signOut}
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
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl mb-1">SUPER ADMIN</h1>
              <p className="text-muted-foreground">Platform management dashboard</p>
            </div>
            <Badge className="bg-gradient-live text-live-foreground border-0">
              <Shield className="w-3 h-3 mr-1" />
              Super Admin
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-card border border-border rounded-2xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  <span className="text-sm text-muted-foreground">{stat.label}</span>
                </div>
                <div className="font-display text-3xl">{stat.value}</div>
              </motion.div>
            ))}
          </div>

          {/* Admin Management */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display text-2xl">ADMIN USERS</h2>
                <Button variant="outline" size="sm">
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Admin
                </Button>
              </div>

              <div className="relative mb-4">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search admins..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 bg-secondary"
                />
              </div>

              <div className="space-y-3 max-h-96 overflow-auto">
                {loading ? (
                  <p className="text-muted-foreground text-center py-4">Loading...</p>
                ) : filteredAdmins.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No admins found</p>
                ) : (
                  filteredAdmins.map((admin) => (
                    <div
                      key={admin.id}
                      className="flex items-center justify-between p-4 bg-secondary rounded-xl"
                    >
                      <div>
                        <div className="font-medium">{admin.fullName || 'No name'}</div>
                        <div className="text-sm text-muted-foreground">{admin.email}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          className={
                            admin.role === UserRole.SUPER_ADMIN
                              ? 'bg-live text-live-foreground'
                              : 'bg-accent text-accent-foreground'
                          }
                        >
                          {admin.role}
                        </Badge>
                        {admin.purchase_status && (
                          <Badge variant="outline" className="capitalize">
                            {admin.purchase_status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-card border border-border rounded-2xl p-6"
            >
              <h2 className="font-display text-2xl mb-6">QUICK ACTIONS</h2>

              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: UserPlus, label: 'Create Admin', color: 'bg-primary', href: '/superadmin/create-admin' },
                  { icon: CreditCard, label: 'Payment Settings', color: 'bg-accent', href: '/superadmin/settings' },
                  { icon: Trophy, label: 'All Tournaments', color: 'bg-gold', href: '/superadmin/tournaments' },
                  { icon: TrendingUp, label: 'Analytics', color: 'bg-live', href: '/superadmin/analytics' }
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

              {/* Recent Activity */}
              <div className="mt-8">
                <h3 className="font-display text-lg mb-4">RECENT ACTIVITY</h3>
                <div className="space-y-3">
                  {[
                    { text: 'New subscriber joined', time: '5 min ago' },
                    { text: 'Admin created tournament', time: '1 hour ago' },
                    { text: 'Payment received ₹999', time: '2 hours ago' },
                  ].map((activity, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between p-3 bg-secondary rounded-lg"
                    >
                      <span className="text-sm">{activity.text}</span>
                      <span className="text-xs text-muted-foreground">{activity.time}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SuperAdminDashboard;
