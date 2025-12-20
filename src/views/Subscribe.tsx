"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Check, Crown, Zap, Eye, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const Subscribe = () => {
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubscribe = async () => {
    if (!user) {
      router.push('/login');
      return;
    }

    // Payment integration coming soon
    toast({
      title: 'Coming Soon!',
      description: 'Payment integration will be available soon. Stay tuned!',
    });
  };

  const features = [
    'Watch all live matches in real-time',
    'Ball-by-ball updates',
    'Live commentary access',
    'Match notifications',
    'Full scorecard access'
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/matches"><ArrowLeft className="w-5 h-5" /></Link>
          </Button>
          <div>
            <h1 className="font-display text-xl">SUBSCRIBE</h1>
            <p className="text-sm text-muted-foreground">Unlock live match access</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-lg mx-auto"
        >
          {/* Subscription Card */}
          <div className="bg-gradient-card border border-border rounded-3xl p-8 text-center relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-40 h-40 bg-primary/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <div className="w-16 h-16 bg-gradient-accent rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Crown className="w-8 h-8 text-accent-foreground" />
              </div>

              <h2 className="font-display text-3xl mb-2">LIVE MATCH ACCESS</h2>
              <p className="text-muted-foreground mb-6">
                Watch every ball, every moment, live
              </p>

              <div className="flex items-baseline justify-center gap-1 mb-8">
                <span className="text-5xl font-display">₹20</span>
                <span className="text-muted-foreground">/month</span>
              </div>

              <div className="space-y-3 mb-8 text-left">
                {features.map((feature, index) => (
                  <motion.div
                    key={feature}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-3"
                  >
                    <div className="w-6 h-6 bg-primary/20 rounded-full flex items-center justify-center">
                      <Check className="w-4 h-4 text-primary" />
                    </div>
                    <span className="text-sm">{feature}</span>
                  </motion.div>
                ))}
              </div>

              <Button
                variant="hero"
                size="lg"
                className="w-full"
                onClick={handleSubscribe}
                disabled={loading}
              >
                {loading ? (
                  <>Processing...</>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Subscribe Now
                  </>
                )}
              </Button>

              <p className="text-xs text-muted-foreground mt-4">
                Cancel anytime. Secure payment via Razorpay.
              </p>
            </div>
          </div>

          {/* Free Features */}
          <div className="mt-8 bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <Eye className="w-5 h-5 text-accent" />
              <h3 className="font-display text-lg">FREE FEATURES</h3>
            </div>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• View completed match scores</li>
              <li>• Browse tournament schedules</li>
              <li>• Team and player information</li>
              <li>• Match summaries and highlights</li>
            </ul>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

export default Subscribe;
