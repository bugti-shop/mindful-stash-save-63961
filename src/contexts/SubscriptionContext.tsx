import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

export type SubscriptionTier = 'free' | 'premium';

interface SubscriptionContextType {
  tier: SubscriptionTier;
  isLoading: boolean;
  purchaseMonthly: () => Promise<void>;
  purchaseYearly: () => Promise<void>;
  restorePurchases: () => Promise<void>;
  canUseFeature: (feature: string) => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

const FREE_LIMITS = {
  maxJars: 5,
  maxCategories: 2,
  transactionHistoryDays: 30,
  maxStickyNotes: 5,
  maxCurrencies: 1,
  darkModes: 0,
  calculatorModes: ['monthly'],
  maxReminders: 0,
  maxActiveChallenges: 0,
};

export const SubscriptionProvider = ({ children }: { children: ReactNode }) => {
  const [tier, setTier] = useState<SubscriptionTier>('free');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check stored subscription status
    const storedTier = localStorage.getItem('subscription_tier') as SubscriptionTier;
    if (storedTier) {
      setTier(storedTier);
    }
  }, []);

  const purchaseMonthly = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Integrate with Google Play Billing
      // This is a placeholder implementation
      // Replace with actual Google Play billing integration using:
      // cordova-plugin-purchase or native Android billing library
      
      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTier('premium');
      localStorage.setItem('subscription_tier', 'premium');
      
      toast({
        title: 'Purchase Successful!',
        description: 'Welcome to Premium! Enjoy all features.',
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: 'Unable to complete purchase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const purchaseYearly = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Integrate with Google Play Billing
      // This is a placeholder implementation
      
      // Simulate purchase process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setTier('premium');
      localStorage.setItem('subscription_tier', 'premium');
      
      toast({
        title: 'Purchase Successful!',
        description: 'Welcome to Premium! Enjoy all features for a year!',
      });
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: 'Purchase Failed',
        description: 'Unable to complete purchase. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const restorePurchases = async () => {
    try {
      setIsLoading(true);
      
      // TODO: Integrate with Google Play Billing restore functionality
      
      // Simulate restore process
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: 'Restore Complete',
        description: 'Your purchases have been restored.',
      });
    } catch (error) {
      console.error('Restore error:', error);
      toast({
        title: 'Restore Failed',
        description: 'Unable to restore purchases.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const canUseFeature = (feature: string): boolean => {
    if (tier === 'premium') return true;
    return false;
  };

  return (
    <SubscriptionContext.Provider
      value={{
        tier,
        isLoading,
        purchaseMonthly,
        purchaseYearly,
        restorePurchases,
        canUseFeature,
      }}
    >
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within SubscriptionProvider');
  }
  return context;
};

export { FREE_LIMITS };
