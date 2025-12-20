"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Settings,
  CreditCard,
  Save,
  ArrowLeft,
  IndianRupee,
  Calendar,
  Key
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const SuperAdminSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const [settings, setSettings] = useState({
    viewerSubscriptionAmount: 20,
    viewerValidityDays: 30,
    adminPurchaseAmount: 999,
    adminValidityDays: 365,
    razorpayKeyId: '',
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    const { data, error } = await supabase
      .from('payment_settings')
      .select('*')
      .limit(1)
      .maybeSingle();

    if (data) {
      setSettings({
        viewerSubscriptionAmount: data.viewer_subscription_amount || 20,
        viewerValidityDays: data.viewer_validity_days || 30,
        adminPurchaseAmount: data.admin_purchase_amount || 999,
        adminValidityDays: data.admin_validity_days || 365,
        razorpayKeyId: data.razorpay_key_id || '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);

    // Check if record exists
    const { data: existing } = await supabase
      .from('payment_settings')
      .select('id')
      .limit(1)
      .maybeSingle();

    let error;
    if (existing) {
      ({ error } = await supabase
        .from('payment_settings')
        .update({
          viewer_subscription_amount: settings.viewerSubscriptionAmount,
          viewer_validity_days: settings.viewerValidityDays,
          admin_purchase_amount: settings.adminPurchaseAmount,
          admin_validity_days: settings.adminValidityDays,
          razorpay_key_id: settings.razorpayKeyId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', existing.id));
    } else {
      ({ error } = await supabase
        .from('payment_settings')
        .insert({
          viewer_subscription_amount: settings.viewerSubscriptionAmount,
          viewer_validity_days: settings.viewerValidityDays,
          admin_purchase_amount: settings.adminPurchaseAmount,
          admin_validity_days: settings.adminValidityDays,
          razorpay_key_id: settings.razorpayKeyId,
        }));
    }

    setSaving(false);

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save settings',
      });
    } else {
      toast({
        title: 'Settings saved',
        description: 'Payment settings have been updated successfully.',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

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
              <div className="w-10 h-10 bg-gradient-live rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-live-foreground" />
              </div>
              <span className="font-display text-xl tracking-wider">SETTINGS</span>
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
          className="max-w-2xl mx-auto"
        >
          <h1 className="font-display text-4xl mb-2">PAYMENT SETTINGS</h1>
          <p className="text-muted-foreground mb-8">
            Configure pricing and payment gateway settings
          </p>

          <div className="space-y-8">
            {/* Viewer Subscription */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <CreditCard className="w-5 h-5 text-primary" />
                <h2 className="font-display text-xl">VIEWER SUBSCRIPTION</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="viewerAmount">Subscription Amount (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="viewerAmount"
                      type="number"
                      value={settings.viewerSubscriptionAmount}
                      onChange={(e) => setSettings({ ...settings, viewerSubscriptionAmount: Number(e.target.value) })}
                      className="pl-9 h-12 bg-secondary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="viewerDays">Validity (Days)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="viewerDays"
                      type="number"
                      value={settings.viewerValidityDays}
                      onChange={(e) => setSettings({ ...settings, viewerValidityDays: Number(e.target.value) })}
                      className="pl-9 h-12 bg-secondary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Admin Purchase */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Shield className="w-5 h-5 text-accent" />
                <h2 className="font-display text-xl">ADMIN LICENSE</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="adminAmount">License Amount (₹)</Label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="adminAmount"
                      type="number"
                      value={settings.adminPurchaseAmount}
                      onChange={(e) => setSettings({ ...settings, adminPurchaseAmount: Number(e.target.value) })}
                      className="pl-9 h-12 bg-secondary"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminDays">Validity (Days)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="adminDays"
                      type="number"
                      value={settings.adminValidityDays}
                      onChange={(e) => setSettings({ ...settings, adminValidityDays: Number(e.target.value) })}
                      className="pl-9 h-12 bg-secondary"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Gateway */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <Key className="w-5 h-5 text-gold" />
                <h2 className="font-display text-xl">RAZORPAY INTEGRATION</h2>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="razorpayKey">Razorpay Key ID</Label>
                  <Input
                    id="razorpayKey"
                    type="text"
                    placeholder="rzp_live_xxxxxxxxxxxxx"
                    value={settings.razorpayKeyId}
                    onChange={(e) => setSettings({ ...settings, razorpayKeyId: e.target.value })}
                    className="h-12 bg-secondary font-mono"
                  />
                  <p className="text-xs text-muted-foreground">
                    Enter your Razorpay Key ID. The secret key should be configured in environment variables.
                  </p>
                </div>
              </div>
            </div>

            {/* Save Button */}
            <Button
              onClick={handleSave}
              disabled={saving}
              variant="hero"
              size="lg"
              className="w-full"
            >
              {saving ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Save Settings
                </>
              )}
            </Button>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default SuperAdminSettings;
