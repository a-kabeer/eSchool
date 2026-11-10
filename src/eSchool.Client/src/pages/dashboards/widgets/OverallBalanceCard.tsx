import { useState } from 'react';
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
} from 'recharts';
import {
  ArrowDown,
  CircleDollarSign,
  Flag,
  PieChart as PieChartIcon,
  TrendingUp,
} from 'lucide-react';
import { Card, SegmentedTabs } from '@/components/ui';
import {
  OVERALL_BALANCE_INCOME,
  OVERALL_BALANCE_ORDERS,
  OVERALL_BALANCE_STATS,
} from '@/data/dashboard3Data';

type BalanceTab = 'orders' | 'income';

const STAT_META = {
  warning: {
    box: 'bg-light-warning text-warning',
    Icon: TrendingUp,
  },
  error: {
    box: 'bg-light-error text-error',
    Icon: CircleDollarSign,
  },
  success: {
    box: 'bg-light-success text-success',
    Icon: Flag,
  },
  primary: {
    box: 'bg-light-primary text-primary',
    Icon: PieChartIcon,
  },
};

export function OverallBalanceCard() {
  const [tab, setTab] = useState<BalanceTab>('orders');

  return (
    <Card className="h-full">
      <div className="grid grid-cols-12 gap-6">
        {/* Main Chart Column */}
        <div className="col-span-12 xl:col-span-8 xl:border-r xl:border-border xl:pr-6">
          <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-sm font-normal text-muted">Overall Balance</p>
              <h2 className="my-1 text-[30px] leading-tight font-bold tracking-tight text-ink">
                $2,538,942
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-light-success px-2.5 py-1 text-xs font-semibold text-success">
                  <ArrowDown className="h-3 w-3" />
                  16.3%
                </span>
                <span className="text-xs font-medium text-muted">last 12 months</span>
              </div>
            </div>

            <SegmentedTabs
              value={tab}
              onChange={setTab}
              options={[
                { value: 'orders', label: 'Orders' },
                { value: 'income', label: 'Income' },
              ]}
            />
          </div>

          <div className="h-[220px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              {tab === 'orders' ? (
                <LineChart
                  data={OVERALL_BALANCE_ORDERS}
                  margin={{ top: 10, right: 12, left: 12, bottom: 0 }}
                >
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8b98ac', fontSize: 12 }}
                    dy={8}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111c2d',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="previous"
                    name="Previous"
                    stroke="#dfe5ef"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="current"
                    name="Current"
                    stroke="var(--mm-primary)"
                    strokeWidth={3}
                    dot={false}
                    activeDot={{ r: 5, fill: 'var(--mm-primary)' }}
                  />
                </LineChart>
              ) : (
                <AreaChart
                  data={OVERALL_BALANCE_INCOME}
                  margin={{ top: 10, right: 12, left: 12, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--mm-primary)" stopOpacity={0.22} />
                      <stop offset="95%" stopColor="var(--mm-primary)" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="month"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#8b98ac', fontSize: 12 }}
                    dy={8}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111c2d',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="lastYear"
                    name="Last Year"
                    stroke="#cbd5e1"
                    strokeWidth={2}
                    fill="transparent"
                  />
                  <Area
                    type="monotone"
                    dataKey="thisYear"
                    name="This Year"
                    stroke="var(--mm-primary)"
                    strokeWidth={2.5}
                    fill="url(#incomeGrad)"
                  />
                </AreaChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right 4 Metric Tiles */}
        <div className="col-span-12 flex flex-col justify-between gap-3 xl:col-span-4">
          {OVERALL_BALANCE_STATS.map((stat) => {
            const { box, Icon } = STAT_META[stat.tone];
            return (
              <div
                key={stat.id}
                className="flex items-center gap-3.5 rounded-2xl bg-subtle px-4 py-3.5 transition-colors hover:bg-subtle/80"
              >
                <span
                  className={`inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-full ${box}`}
                >
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted">{stat.label}</p>
                  <p className="text-sm font-bold text-ink">{stat.value}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
