import { Crown, Check, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { Separator } from './ui/separator';

const premiumFeatures = [
  'Unlimited jars & categories',
  'Unlimited transaction history',
  'All Dark modes',
  'Multiple currencies (3)',
  'Advanced calculator (daily/weekly/monthly)',
  'Backup & sync',
  'Unlimited sticky notes',
  'Savings trends & analytics',
  'Custom reminders (3)',
  'Savings challenges (1 active)',
  'No ads',
];

export const PremiumSettings = () => {
  const { tier, isLoading, purchaseMonthly, purchaseYearly, restorePurchases } = useSubscription();

  const isPremium = tier === 'premium';

  return (
    <Card className="border-2 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Crown className="h-6 w-6 text-primary" />
            <CardTitle>Premium Features</CardTitle>
          </div>
          {isPremium && (
            <Badge variant="default" className="gap-1">
              <Sparkles className="h-3 w-3" />
              Active
            </Badge>
          )}
        </div>
        <CardDescription>
          {isPremium
            ? 'You have access to all premium features'
            : 'Unlock the full power of Mindful Stash Save'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Features List */}
        <div className="space-y-3">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="flex items-center gap-3">
              <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary/10">
                <Check className="h-3 w-3 text-primary" />
              </div>
              <span className="text-sm text-foreground/90">{feature}</span>
            </div>
          ))}
        </div>

        {!isPremium && (
          <>
            <Separator />

            {/* Pricing Cards */}
            <div className="space-y-3">
              <div className="rounded-lg border-2 border-primary/50 bg-primary/5 p-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground/70">Monthly</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">$2.99</span>
                      <span className="text-sm text-foreground/60">/month</span>
                    </div>
                  </div>
                  <Badge variant="secondary">Popular</Badge>
                </div>
                <Button
                  onClick={purchaseMonthly}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                >
                  {isLoading ? 'Processing...' : 'Subscribe Monthly'}
                </Button>
              </div>

              <div className="rounded-lg border-2 border-primary bg-primary/10 p-4">
                <div className="mb-3 flex items-baseline justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground/70">Yearly</p>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">$18.99</span>
                      <span className="text-sm text-foreground/60">/year</span>
                    </div>
                    <p className="mt-1 text-xs text-primary font-medium">
                      Save $17! (47% off)
                    </p>
                  </div>
                  <Badge className="bg-primary">Best Value</Badge>
                </div>
                <Button
                  onClick={purchaseYearly}
                  disabled={isLoading}
                  className="w-full"
                  size="lg"
                  variant="default"
                >
                  {isLoading ? 'Processing...' : 'Subscribe Yearly'}
                </Button>
              </div>
            </div>

            <Button
              onClick={restorePurchases}
              variant="ghost"
              className="w-full"
              disabled={isLoading}
            >
              Restore Purchases
            </Button>
          </>
        )}

        {isPremium && (
          <div className="rounded-lg bg-primary/5 p-4 text-center">
            <p className="text-sm text-foreground/70">
              Thank you for being a premium member! 🎉
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
