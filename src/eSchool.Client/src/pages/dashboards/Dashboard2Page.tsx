import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { CreditCard, PackageCheck, RefreshCw, TrendingUp } from 'lucide-react';
import { Card, ChartCard, StatusBadge } from '@/components/ui';

const SALES_PROFIT = [
  { month: 'Aug', sales: 320, profit: 190 },
  { month: 'Sep', sales: 410, profit: 240 },
  { month: 'Oct', sales: 380, profit: 210 },
  { month: 'Nov', sales: 510, profit: 320 },
  { month: 'Dec', sales: 580, profit: 390 },
  { month: 'Jan', sales: 640, profit: 440 },
];

const TOP_PRODUCTS = [
  { name: 'MaterialM Pro Kit', category: 'Design System', sales: '$18,450', status: 'In Stock' },
  { name: 'Cloud Telemetry Suite', category: 'SaaS Add-on', sales: '$12,980', status: 'Trending' },
  { name: 'Enterprise SSO Pack', category: 'Security', sales: '$9,420', status: 'In Stock' },
];

export function Dashboard2Page() {
  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Welcome hero card matching Dashboard 2 */}
      <div className="col-span-12 xl:col-span-6">
        <Card className="relative flex h-full flex-col justify-between overflow-hidden bg-primary text-white">
          <div>
            <h2 className="text-xl font-bold text-white">Welcome Jonathan Deo</h2>
            <p className="mt-1 text-sm text-white/80">Check all the statistics across your storefronts</p>
          </div>

          <div className="mt-8 inline-flex w-fit items-center rounded-full bg-[#111c2d]/15">
            <div className="border-r border-white/15 px-6 py-3 text-center">
              <p className="text-lg font-bold text-white">573</p>
              <p className="text-xs text-white/80">New Leads</p>
            </div>
            <div className="px-6 py-3 text-center">
              <p className="text-lg font-bold text-white">87%</p>
              <p className="text-xs text-white/80">Conversion</p>
            </div>
          </div>
        </Card>
      </div>

      {/* 3 Mini Cards */}
      <div className="col-span-12 xl:col-span-6">
        <div className="grid h-full grid-cols-1 gap-6 sm:grid-cols-3">
          <Card variant="tinted" tone="secondary" className="flex flex-col justify-between">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-secondary text-white">
              <TrendingUp className="h-5 w-5" />
            </span>
            <div className="mt-6">
              <p className="text-xs font-medium text-muted">Sales</p>
              <p className="mt-1 text-2xl font-bold text-ink">$2,356</p>
            </div>
          </Card>

          <Card variant="tinted" tone="error" className="flex flex-col justify-between">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-error text-white">
              <RefreshCw className="h-5 w-5" />
            </span>
            <div className="mt-6">
              <p className="text-xs font-medium text-muted">Refunds</p>
              <p className="mt-1 text-2xl font-bold text-ink">$142</p>
            </div>
          </Card>

          <Card variant="tinted" tone="success" className="flex flex-col justify-between">
            <span className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-success text-white">
              <CreditCard className="h-5 w-5" />
            </span>
            <div className="mt-6">
              <p className="text-xs font-medium text-muted">Earnings</p>
              <p className="mt-1 text-2xl font-bold text-ink">$18.4k</p>
            </div>
          </Card>
        </div>
      </div>

      {/* Sales & Profit Chart */}
      <div className="col-span-12 xl:col-span-8">
        <ChartCard title="Sales & Profit" subtitle="Monthly gross vs net performance">
          <div className="h-[270px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SALES_PROFIT} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--mm-border-color)" />
                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#8b98ac', fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#8b98ac', fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111c2d',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="sales" name="Sales ($k)" fill="var(--mm-primary)" barSize={16} radius={[6, 6, 0, 0]} />
                <Bar dataKey="profit" name="Profit ($k)" fill="var(--mm-secondary)" barSize={16} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Top Performing Products */}
      <div className="col-span-12 xl:col-span-4">
        <Card className="h-full">
          <h3 className="mb-4 text-lg font-semibold text-ink">Top Performing Products</h3>
          <div className="divide-y divide-border">
            {TOP_PRODUCTS.map((item) => (
              <div key={item.name} className="flex items-center justify-between gap-3 py-4">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-light-primary text-primary">
                    <PackageCheck className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{item.name}</p>
                    <p className="text-xs text-muted">{item.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-ink">{item.sales}</p>
                  <StatusBadge label={item.status} tone="success" className="mt-1" />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
