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
  Search,
  ArrowLeft,
  UserCheck,
  UserX,
  Mail,
  Calendar
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface UserData {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  created_at: string;
  role: string;
  is_verified: boolean | null;
}

const SuperAdminUsers = () => {
  const [users, setUsers] = useState<UserData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to fetch users',
      });
      setLoading(false);
      return;
    }

    const userIds = profiles?.map(p => p.user_id) || [];

    const { data: roles } = await supabase
      .from('user_roles')
      .select('user_id, role')
      .in('user_id', userIds);

    const usersWithRoles: UserData[] = profiles?.map(p => ({
      id: p.id,
      user_id: p.user_id,
      email: p.email,
      full_name: p.full_name,
      created_at: p.created_at,
      is_verified: p.is_verified,
      role: roles?.find(r => r.user_id === p.user_id)?.role || 'viewer',
    })) || [];

    setUsers(usersWithRoles);
    setLoading(false);
  };

  const promoteToAdmin = async (userId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: 'admin' })
      .eq('user_id', userId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to promote user',
      });
    } else {
      toast({
        title: 'Success',
        description: 'User promoted to admin',
      });
      fetchUsers();
    }
  };

  const demoteToViewer = async (userId: string) => {
    const { error } = await supabase
      .from('user_roles')
      .update({ role: 'viewer' })
      .eq('user_id', userId);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to demote user',
      });
    } else {
      toast({
        title: 'Success',
        description: 'User demoted to viewer',
      });
      fetchUsers();
    }
  };

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-live text-live-foreground';
      case 'admin':
        return 'bg-accent text-accent-foreground';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/superadmin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-display text-xl tracking-wider">MANAGE USERS</span>
            </div>
          </div>
          <Badge className="bg-gradient-live text-live-foreground border-0">
            <Shield className="w-3 h-3 mr-1" />
            Super Admin
          </Badge>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="font-display text-4xl mb-2">ALL USERS</h1>
              <p className="text-muted-foreground">
                {users.length} total users
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative mb-6 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search users by name or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 bg-card"
            />
          </div>

          {/* Users List */}
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Loading...</div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">No users found</div>
            ) : (
              <div className="divide-y divide-border">
                {filteredUsers.map((user) => (
                  <motion.div
                    key={user.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="p-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-card rounded-full flex items-center justify-center">
                        <span className="font-display text-lg">
                          {user.full_name?.charAt(0) || user.email?.charAt(0) || '?'}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{user.full_name || 'No name'}</div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Mail className="w-3 h-3" />
                          {user.email}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                          <Calendar className="w-3 h-3" />
                          Joined {format(new Date(user.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getRoleBadgeColor(user.role)}>
                        {user.role}
                      </Badge>
                      {user.role === 'viewer' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => promoteToAdmin(user.user_id)}
                        >
                          <UserCheck className="w-4 h-4 mr-1" />
                          Promote
                        </Button>
                      )}
                      {user.role === 'admin' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => demoteToViewer(user.user_id)}
                        >
                          <UserX className="w-4 h-4 mr-1" />
                          Demote
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SuperAdminUsers;
