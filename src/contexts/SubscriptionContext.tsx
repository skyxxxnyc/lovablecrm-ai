import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Product mapping
export const SUBSCRIPTION_PLANS = {
  pro: {
    product_id: 'prod_TC4gvRUqeebQZj',
    price_id: 'price_1SFgX0P6d5asnGUaoNJX793Z',
    name: 'Pro Plan',
    price: 29.00
  }
};

interface SubscriptionContextType {
  isPro: boolean;
  loading: boolean;
  productId: string | null;
  subscriptionEnd: string | null;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType>({
  isPro: false,
  loading: true,
  productId: null,
  subscriptionEnd: null,
  refreshSubscription: async () => {},
});

export const useSubscription = () => useContext(SubscriptionContext);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isPro, setIsPro] = useState(false);
  const [loading, setLoading] = useState(true);
  const [productId, setProductId] = useState<string | null>(null);
  const [subscriptionEnd, setSubscriptionEnd] = useState<string | null>(null);

  const refreshSubscription = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsPro(false);
        setProductId(null);
        setSubscriptionEnd(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-subscription', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (error) {
        console.error('Error checking subscription:', error);
        setIsPro(false);
        setProductId(null);
        setSubscriptionEnd(null);
      } else {
        setIsPro(data.subscribed || false);
        setProductId(data.product_id || null);
        setSubscriptionEnd(data.subscription_end || null);
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
      setIsPro(false);
      setProductId(null);
      setSubscriptionEnd(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSubscription();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      refreshSubscription();
    });

    // Auto-refresh every minute
    const interval = setInterval(refreshSubscription, 60000);

    return () => {
      subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <SubscriptionContext.Provider value={{ isPro, loading, productId, subscriptionEnd, refreshSubscription }}>
      {children}
    </SubscriptionContext.Provider>
  );
};
