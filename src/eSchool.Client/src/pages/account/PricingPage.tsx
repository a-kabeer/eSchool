import { useState } from 'react';
import { Check } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button, Card, SegmentedTabs, StatusBadge } from '@/components/ui';
import { useToast } from '@/context/ToastContext';

const PLANS = [
  {
    name: 'Silver',
    monthly: 0,
    yearly: 0,
    badge: null,
    features: ['3 Users', '5 Projects', '2GB Cloud Storage', 'Community Support'],
  },
  {
    name: 'Bronze',
    monthly: 10.99,
    yearly: 8.99,
    badge: 'Popular',
    features: ['15 Users', 'Unlimited Projects', '50GB Cloud Storage', 'Priority Email Support'],
  },
  {
    name: 'Gold',
    monthly: 22.99,
    yearly: 18.99,
    badge: null,
    features: ['Unlimited Users', 'Custom SSO & RBAC', '1TB Cloud Storage', '24/7 Dedicated SLA'],
  },
];

export function PricingPage() {
  const [billing, setBilling] = useState<'monthly' | 'yearly'>('monthly');
  const { showToast } = useToast();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Pricing"
        breadcrumbs={[{ label: 'Home', path: '/dashboards/dashboard3' }, { label: 'Pricing' }]}
      />

      <div className="flex flex-col items-center text-center">
        <h2 className="text-2xl font-bold text-ink">
          Flexible Plans Tailored to Fit Your Community&apos;s Unique Needs
        </h2>
        <div className="mt-4 flex items-center gap-3">
          <SegmentedTabs
            value={billing}
            onChange={setBilling}
            options={[
              { value: 'monthly', label: 'Monthly' },
              { value: 'yearly', label: 'Yearly (Save 20%)' },
            ]}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {PLANS.map((plan) => {
          const price = billing === 'monthly' ? plan.monthly : plan.yearly;
          return (
            <Card key={plan.name} className="flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted">
                    {plan.name}
                  </span>
                  {plan.badge && <StatusBadge label={plan.badge} tone="warning" />}
                </div>

                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-ink">
                    {price === 0 ? 'Free' : `$${price}`}
                  </span>
                  {price > 0 && <span className="text-sm text-muted">/mo</span>}
                </div>

                <ul className="mt-6 space-y-3">
                  {plan.features.map((feat) => (
                    <li key={feat} className="flex items-center gap-2.5 text-sm text-ink">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-light-primary text-primary">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      {feat}
                    </li>
                  ))}
                </ul>
              </div>

              <Button
                className="mt-7 w-full"
                variant={plan.badge ? 'primary' : 'outline'}
                onClick={() => showToast(`Selected ${plan.name} plan (${billing})`, 'success')}
              >
                Choose {plan.name}
              </Button>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
