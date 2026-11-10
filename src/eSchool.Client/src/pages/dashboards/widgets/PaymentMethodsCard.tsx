import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, CreditCard } from 'lucide-react';
import { Card, DropdownMenu, StatusBadge } from '@/components/ui';
import {
  MastercardLogo,
  TransactionMerchantIcon,
  VisaLogo,
} from '@/components/icons/BrandIcons';
import { PAYMENT_TRANSACTIONS } from '@/data/dashboard3Data';
import { useToast } from '@/context/ToastContext';

export function PaymentMethodsCard() {
  const [selectedCard, setSelectedCard] = useState<'visa' | 'mastercard' | null>(null);
  const { showToast } = useToast();

  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-ink">Payment Methods</h3>
          <DropdownMenu
            ariaLabel="Payment methods actions"
            items={[
              {
                id: 'add-card',
                label: 'Issue Virtual Card',
                icon: <CreditCard className="h-4 w-4" />,
                onSelect: () => showToast('Virtual card request queued', 'info'),
              },
              {
                id: 'statement',
                label: 'Download Statement',
                onSelect: () => showToast('Card statement downloaded', 'success'),
              },
            ]}
          />
        </div>

        {/* Two virtual cards */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          {/* Dark Navy Visa Card */}
          <button
            type="button"
            onClick={() => {
              setSelectedCard('visa');
              showToast('Primary Visa card selected', 'info');
            }}
            className={`relative overflow-hidden rounded-[24px] bg-[#1f2a3d] p-6 text-left text-white shadow-[var(--mm-shadow-card)] transition-all ${
              selectedCard === 'visa' ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface' : 'opacity-95 hover:opacity-100'
            }`}
          >
            {/* Subtle circular ornament matching circlr-shape.png */}
            <svg
              aria-hidden="true"
              viewBox="0 0 180 180"
              className="pointer-events-none absolute -bottom-12 -right-8 h-40 w-40 opacity-15"
            >
              <circle cx="90" cy="90" r="85" stroke="#ffffff" strokeWidth="18" fill="none" />
              <circle cx="90" cy="90" r="52" stroke="#ffffff" strokeWidth="14" fill="none" />
            </svg>

            <div className="relative z-10 mb-9 flex items-center justify-between">
              <span className="text-base font-semibold tracking-wide text-white">**** 8942</span>
              <VisaLogo />
            </div>
            <div className="relative z-10">
              <p className="mb-1 text-xs font-medium text-white/70">Balance</p>
              <p className="text-lg font-bold text-white">$26,561.50</p>
            </div>
          </button>

          {/* Soft Light Mastercard Card */}
          <button
            type="button"
            onClick={() => {
              setSelectedCard('mastercard');
              showToast('Corporate Mastercard selected', 'info');
            }}
            className={`relative overflow-hidden rounded-[24px] bg-subtle p-6 text-left transition-all ${
              selectedCard === 'mastercard'
                ? 'ring-2 ring-primary ring-offset-2 ring-offset-surface'
                : 'hover:bg-subtle/80'
            }`}
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 180 180"
              className="pointer-events-none absolute -bottom-12 -right-8 h-40 w-40 opacity-50"
            >
              <circle cx="90" cy="90" r="85" stroke="#ffffff" strokeWidth="18" fill="none" />
              <circle cx="90" cy="90" r="52" stroke="#ffffff" strokeWidth="14" fill="none" />
            </svg>

            <div className="relative z-10 mb-9 flex items-center justify-between">
              <span className="text-base font-semibold tracking-wide text-ink">**** 8942</span>
              <MastercardLogo />
            </div>
            <div className="relative z-10">
              <p className="mb-1 text-xs font-medium text-muted">Balance</p>
              <p className="text-lg font-bold text-ink">$26,561.50</p>
            </div>
          </button>
        </div>
      </div>

      {/* Transactions list */}
      <div className="mt-6">
        <div className="flex items-center justify-between border-b border-border pb-2.5">
          <h4 className="text-base font-semibold text-ink">Transactions</h4>
          <Link
            to="/apps/invoices"
            className="inline-flex items-center gap-0.5 text-sm font-semibold text-primary hover:underline"
          >
            <span>See all</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="divide-y divide-border/75">
          {PAYMENT_TRANSACTIONS.map((tx) => (
            <div
              key={tx.id}
              className="flex flex-wrap items-center justify-between gap-3 py-3.5"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <TransactionMerchantIcon iconKey={tx.iconKey} />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{tx.title}</p>
                  <p className="text-xs font-medium text-muted">{tx.timestamp}</p>
                </div>
              </div>

              <div className="flex items-center gap-6 sm:gap-10">
                <StatusBadge
                  label={tx.status}
                  tone={tx.status === 'Approved' ? 'success' : 'warning'}
                />
                <div className="min-w-[78px] text-right">
                  <p className="text-sm font-semibold text-ink">{tx.amount}</p>
                  <p
                    className={`text-xs font-medium ${
                      tx.amountTone === 'success' ? 'text-success' : 'text-error'
                    }`}
                  >
                    {tx.bonus}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
