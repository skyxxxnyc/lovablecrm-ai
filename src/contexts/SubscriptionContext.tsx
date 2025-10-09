import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SubscriptionContextType {
  isPro: boolean;
  loading: boolean;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isPro: false,
  loading: true,
  refreshSubscription: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);

  const refreshSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsPro(false);
        return;
      }

      // TODO: When Stripe integration is complete, check actual subscription status
      // For now, all users are on free tier
      setIsPro(false);
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsPro(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshSubscription();
    });

    return () => subscription.unsubscribe();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ isPro, loading, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
