"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Shield,
    Search,
    UserPlus,
    ArrowLeft
} from 'lucide-react';
import { api } from '@/lib/api';
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

const SuperAdminAdmins = () => {
    const [admins, setAdmins] = useState<AdminUser[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        fetchAdmins();
    }, []);

    const fetchAdmins = async () => {
        try {
            const response = await api.get<{ data: AdminUser[] }>('/users?limit=100');
            const adminList = response.data.filter(u =>
                u.role === UserRole.ADMIN || u.role === UserRole.SUPER_ADMIN
            );
            setAdmins(adminList);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: error.message || 'Failed to fetch admins',
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredAdmins = admins.filter(admin =>
        admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-background">
            <header className="border-b border-border bg-card/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/superadmin">
                            <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        </Link>
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-gradient-live rounded-lg flex items-center justify-center">
                                <Shield className="w-5 h-5 text-live-foreground" />
                            </div>
                            <span className="font-display text-xl tracking-wider">MANAGE ADMINS</span>
                        </div>
                    </div>
                    <Badge className="bg-gradient-live text-live-foreground border-0">
                        <Shield className="w-3 h-3 mr-1" />
                        Super Admin
                    </Badge>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-card border border-border rounded-2xl p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="font-display text-4xl mb-2">ADMIN USERS</h1>
                            <p className="text-muted-foreground">Manage platform administrators</p>
                        </div>
                        <Link href="/superadmin/create-admin">
                            <Button variant="outline">
                                <UserPlus className="w-4 h-4 mr-2" />
                                Add Admin
                            </Button>
                        </Link>
                    </div>

                    <div className="relative mb-6 max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            placeholder="Search admins..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-9 h-12 bg-secondary"
                        />
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <p className="text-muted-foreground text-center py-8">Loading...</p>
                        ) : filteredAdmins.length === 0 ? (
                            <p className="text-muted-foreground text-center py-8">No admins found</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {filteredAdmins.map((admin) => (
                                    <div
                                        key={admin.id}
                                        className="flex items-center justify-between p-6 bg-secondary rounded-2xl border border-border/50"
                                    >
                                        <div>
                                            <div className="font-display text-lg mb-1">{admin.fullName || 'No name'}</div>
                                            <div className="text-sm text-muted-foreground flex items-center gap-2">
                                                {admin.email}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge
                                                className={
                                                    admin.role === UserRole.SUPER_ADMIN
                                                        ? 'bg-live text-live-foreground border-0'
                                                        : 'bg-accent text-accent-foreground border-0'
                                                }
                                            >
                                                {admin.role.toUpperCase()}
                                            </Badge>
                                            {admin.purchase_status && (
                                                <Badge variant="outline" className="capitalize">
                                                    {admin.purchase_status}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </motion.div>
            </main>
        </div>
    );
};

export default SuperAdminAdmins;
