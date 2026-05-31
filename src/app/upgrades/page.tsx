"use client"

import { useState } from 'react';
import { useUser, useFirestore, useDoc } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Star, Zap, Loader2, ArrowRight, Lock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMemoFirebase } from '@/firebase/use-memo-firebase';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export default function UpgradesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  const router = useRouter();
  const [upgradingTo, setUpgradingTo] = useState<string | null>(null);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user) return null;
    return doc(db, 'users', user.uid);
  }, [db, user]);

  const { data: profile } = useDoc(profileRef);

  const handleUpgrade = async (tier: string) => {
    if (tier !== 'standard') {
      toast({
        title: "Coming Soon",
        description: `${tier.charAt(0).toUpperCase() + tier.slice(1)} membership will be available in the next update.`,
      });
      return;
    }
    
    if (!db || !user) return;
    
    setUpgradingTo(tier);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        accountType: tier
      });
      toast({
        title: "Plan Updated",
        description: "You have been switched to the Standard plan.",
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Please try again later.",
      });
    } finally {
      setUpgradingTo(null);
    }
  };

  const tiers = [
    {
      id: 'standard',
      name: 'Standard',
      price: 'Free',
      description: 'The essential Quub experience.',
      icon: Zap,
      color: 'bg-muted/30 text-muted-foreground',
      isComingSoon: false,
      features: [
        'Apply to basic jobs',
        'Standard profile visibility',
        'Basic messaging access',
        'Standard support'
      ]
    },
    {
      id: 'silver',
      name: 'Silver',
      price: '₹499/mo',
      description: 'For growing professionals.',
      icon: Star,
      color: 'bg-slate-100 text-slate-600',
      badge: 'Most Popular',
      isComingSoon: true,
      features: [
        'Priority job applications',
        'Featured profile badge',
        'Unlimited messaging',
        '24/7 Priority support',
        'Exclusive local insights'
      ]
    },
    {
      id: 'gold',
      name: 'Gold',
      price: '₹999/mo',
      description: 'The elite workspace experience.',
      icon: Crown,
      color: 'bg-yellow-50 text-yellow-600',
      isComingSoon: true,
      features: [
        'Early access to elite jobs',
        'Top placement in search',
        'Dedicated success manager',
        'Zero commission fees',
        'Verified elite status badge',
        'White-glove portfolio review'
      ]
    }
  ];

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F9FE] p-4">
        <Card className="max-w-md w-full rounded-[2.5rem] border-none shadow-2xl p-10 text-center space-y-6">
          <h2 className="text-3xl font-black">Join the Elite</h2>
          <p className="text-muted-foreground">Sign in to view upgrade options and supercharge your career.</p>
          <Button onClick={() => router.push('/auth/signin')} className="w-full h-14 rounded-2xl font-black">Sign In</Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F9FE] pt-8 pb-24">
      <div className="container mx-auto px-4 max-w-6xl text-center">
        <div className="space-y-4 mb-16">
          <Badge className="bg-primary/10 text-primary border-none font-black text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-full">Membership Hub</Badge>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-[#111827]">Supercharge Your <br/>Work Life.</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto leading-relaxed">
            Choose the tier that matches your ambition. Premium features and elite access are arriving soon.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-16">
          {tiers.map((tier) => {
            const isCurrent = (profile?.accountType || 'standard') === tier.id;
            const Icon = tier.icon;
            
            return (
              <Card 
                key={tier.id} 
                className={cn(
                  "border-none shadow-sm rounded-[3rem] bg-white overflow-hidden relative group transition-all duration-500 hover:shadow-2xl hover:-translate-y-2",
                  isCurrent && "ring-4 ring-primary ring-offset-4"
                )}
              >
                {(tier.badge || tier.isComingSoon) && (
                  <div className="absolute top-8 right-8 flex gap-2">
                    {tier.isComingSoon && (
                      <Badge className="bg-orange-100 text-orange-600 border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">
                        Coming Soon
                      </Badge>
                    )}
                    {tier.badge && (
                      <Badge className="bg-[#6366f1] text-white border-none font-black text-[9px] uppercase tracking-widest px-3 py-1 rounded-lg">
                        {tier.badge}
                      </Badge>
                    )}
                  </div>
                )}
                
                <CardContent className="p-10 text-left h-full flex flex-col">
                  <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center mb-8", tier.color)}>
                    <Icon className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2 mb-6">
                    <h3 className="text-3xl font-black">{tier.name}</h3>
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-black text-[#111827]">{tier.price}</span>
                      {tier.id !== 'standard' && <span className="text-muted-foreground font-medium text-sm">/month</span>}
                    </div>
                    <p className="text-muted-foreground font-medium text-sm leading-relaxed">{tier.description}</p>
                  </div>

                  <div className="space-y-4 flex-1 mb-10">
                    {tier.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-5 h-5 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-emerald-500" />
                        </div>
                        <span className="text-sm font-bold text-[#4B5563]">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {tier.isComingSoon ? (
                    <Button 
                      disabled
                      className="w-full h-16 rounded-2xl font-black text-lg bg-muted text-muted-foreground cursor-not-allowed border-dashed border-2 flex gap-2"
                    >
                      <Lock className="w-5 h-5" /> Coming Soon
                    </Button>
                  ) : (
                    <Button 
                      onClick={() => handleUpgrade(tier.id)}
                      disabled={isCurrent || upgradingTo !== null}
                      className={cn(
                        "w-full h-16 rounded-2xl font-black text-lg transition-all",
                        isCurrent ? "bg-muted text-muted-foreground cursor-default" : "bg-primary shadow-xl shadow-primary/20 hover:scale-[1.02]"
                      )}
                    >
                      {upgradingTo === tier.id ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : isCurrent ? (
                        "Current Plan"
                      ) : (
                        `Select ${tier.name}`
                      )}
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        <Card className="border-none shadow-none rounded-[3.5rem] bg-gradient-to-br from-[#6366f1] to-[#a855f7] text-white overflow-hidden relative group">
          <CardContent className="p-12 md:p-16 flex flex-col md:flex-row items-center justify-between gap-12 relative z-10 text-left">
            <div className="space-y-6 max-w-xl">
              <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-none">Need a custom plan <br/>for your team?</h2>
              <p className="text-xl text-white/80 font-medium">Get a tailored workspace solution for large agencies and enterprises in Kerala.</p>
              <Button className="bg-white text-primary hover:bg-white/90 rounded-2xl h-16 px-12 font-black text-lg shadow-2xl transition-all">
                Contact Enterprise <ArrowRight className="w-6 h-6 ml-2" />
              </Button>
            </div>
            <div className="hidden lg:flex w-64 h-64 bg-white/10 rounded-[4rem] items-center justify-center backdrop-blur-3xl shrink-0">
              <Star className="w-32 h-32 opacity-40 rotate-12" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
