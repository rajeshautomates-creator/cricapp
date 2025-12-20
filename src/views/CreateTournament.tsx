"use client";

import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Trophy, Calendar, MapPin, Save } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

const CreateTournament = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [venue, setVenue] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [oversFormat, setOversFormat] = useState('20');
  const [customOvers, setCustomOvers] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setLoading(true);

    try {
      const finalOvers = oversFormat === 'custom' ? parseInt(customOvers) : parseInt(oversFormat);

      if (isNaN(finalOvers) || finalOvers <= 0) {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Please provide a valid number of overs.'
        });
        setLoading(false);
        return;
      }

      await api.post('/tournaments', {
        name,
        description,
        venue,
        startDate,
        endDate,
        oversFormat: finalOvers,
      });

      toast({ title: 'Success', description: 'Tournament created successfully!' });
      router.push('/tournaments');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: error.message || 'Failed to create tournament',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border p-4">
        <div className="container mx-auto flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild><Link href="/dashboard"><ArrowLeft className="w-5 h-5" /></Link></Button>
          <div><h1 className="font-display text-xl">CREATE TOURNAMENT</h1><p className="text-sm text-muted-foreground">Set up a new cricket tournament</p></div>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-gradient-primary rounded-xl flex items-center justify-center"><Trophy className="w-5 h-5 text-primary-foreground" /></div><h2 className="font-display text-xl">TOURNAMENT DETAILS</h2></div>
              <div className="space-y-4">
                <div className="space-y-2"><Label htmlFor="name">Tournament Name *</Label><Input id="name" placeholder="e.g., IPL 2024" value={name} onChange={(e) => setName(e.target.value)} className="h-12 bg-secondary" required /></div>
                <div className="space-y-2"><Label htmlFor="description">Description</Label><Textarea id="description" placeholder="Brief description..." value={description} onChange={(e) => setDescription(e.target.value)} className="bg-secondary min-h-24" /></div>
                <div className="space-y-2"><Label htmlFor="venue">Venue</Label><div className="relative"><MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" /><Input id="venue" placeholder="e.g., Wankhede Stadium" value={venue} onChange={(e) => setVenue(e.target.value)} className="pl-10 h-12 bg-secondary" /></div></div>
              </div>
            </div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-6"><div className="w-10 h-10 bg-gradient-accent rounded-xl flex items-center justify-center"><Calendar className="w-5 h-5 text-accent-foreground" /></div><h2 className="font-display text-xl">SCHEDULE & FORMAT</h2></div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2"><Label htmlFor="startDate">Start Date *</Label><Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-12 bg-secondary" required /></div>
                  <div className="space-y-2"><Label htmlFor="endDate">End Date *</Label><Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-12 bg-secondary" required /></div>
                </div>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Overs Format *</Label>
                    <Select value={oversFormat} onValueChange={setOversFormat}>
                      <SelectTrigger className="h-12 bg-secondary">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="20">T20 (20 Overs)</SelectItem>
                        <SelectItem value="50">ODI (50 Overs)</SelectItem>
                        <SelectItem value="custom">Custom Format</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {oversFormat === 'custom' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-2"
                    >
                      <Label htmlFor="customOvers">Number of Overs *</Label>
                      <Input
                        id="customOvers"
                        type="number"
                        placeholder="Enter number of overs (e.g., 10, 15)"
                        value={customOvers}
                        onChange={(e) => setCustomOvers(e.target.value)}
                        className="h-12 bg-secondary"
                        required
                      />
                    </motion.div>
                  )}
                </div>
              </div>
            </div>
            <Button type="submit" variant="hero" size="lg" className="w-full" disabled={loading}>{loading ? 'Creating...' : <><Save className="w-5 h-5 mr-2" />Create Tournament</>}</Button>
          </form>
        </motion.div>
      </main>
    </div>
  );
};

export default CreateTournament;
