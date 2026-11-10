import { Link } from 'react-router-dom';
import {
  ArrowUp,
  CreditCard,
  Droplets,
  Info,
  TrendingUp,
  Wallet,
} from 'lucide-react';
import { Card, DropdownMenu } from '@/components/ui';
import { EARNING_REPORTS_DATA } from '@/data/dashboard3Data';
import type { SemanticTone } from '@/types';
import { useToast } from '@/context/ToastContext';

const ICONS = {
  card: CreditCard,
  wallet: Wallet,
  trend: TrendingUp,
  drops: Droplets,
};

const TONE_BOX: Record<SemanticTone, string> = {
  primary: 'bg-light-primary text-primary',
  error: 'bg-light-error text-error',
  secondary: 'bg-light-secondary text-secondary',
  warning: 'bg-light-warning text-warning',
  success: 'bg-light-success text-success',
  info: 'bg-light-info text-info',
  neutral: 'bg-subtle text-muted',
};

export function EarningReportsCard() {
  const { showToast } = useToast();

  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <div className="mb-2 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-ink">Earning Reports</h3>
          <DropdownMenu
            ariaLabel="Earning Reports options"
            items={[
              {
                id: 'refresh',
                label: 'Refresh Markets',
                onSelect: () => showToast('Market figures refreshed', 'info'),
              },
              {
                id: 'export',
                label: 'Export Earnings CSV',
                onSelect: () => showToast('Earnings report downloaded', 'success'),
              },
            ]}
          />
        </div>

        <ul className="divide-y divide-border">
          {EARNING_REPORTS_DATA.map((item) => {
            const Icon = ICONS[item.iconKey];
            return (
              <li key={item.id} className="flex items-center justify-between gap-3 py-4.5">
                <div className="flex items-center gap-3.5 min-w-0">
                  <span
                    className={`inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-full ${
                      TONE_BOX[item.tone]
                    }`}
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{item.title}</p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs font-medium text-muted">
                      <span>{item.subtitle}</span>
                      <Info
                        className="h-3.5 w-3.5 text-muted/80"
                        aria-label="Additional payout channels included"
                      />
                    </p>
                  </div>
                </div>

                <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-light-success px-3.5 py-1.5 text-xs font-semibold text-success">
                  <ArrowUp className="h-3 w-3" />
                  {item.badge}
                </span>
              </li>
            );
          })}
        </ul>
      </div>

      <Link
        to="/analytics/reports"
        className="mt-6 block text-center text-sm font-semibold text-ink transition-colors hover:text-primary"
      >
        View more markets
      </Link>
    </Card>
  );
}
