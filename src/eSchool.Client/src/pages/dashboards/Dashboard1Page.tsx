import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ArrowUpRight,
  Award,
  DollarSign,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { Card, ChartCard, SegmentedTabs, StatCard, StatusBadge } from '@/components/ui';

const REVENUE_DATA = [
  { month: 'Jan', productA: 4200, productB: 2800 },
  { month: 'Feb', productA: 4800, productB: 3200 },
  { month: 'Mar', productA: 4500, productB: 3600 },
  { month: 'Apr', productA: 5900, productB: 4100 },
  { month: 'May', productA: 6400, productB: 4500 },
  { month: 'Jun', productA: 7200, productB: 4900 },
];

const TRAFFIC_DATA = [
  { name: 'Organic', value: 48, color: '#00a1ff' },
  { name: 'Direct', value: 28, color: '#8965e5' },
  { name: 'Referral', value: 24, color: '#00ceb6' },
];

export function Dashboard1Page() {
  const [range, setRange] = useState<'6m' | '12m'>('6m');

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Greeting Banner */}
      <div className="col-span-12 xl:col-span-5">
        <Card className="relative h-full overflow-hidden">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-ink">Congratulations Jonathan</h2>
              <p className="mt-1 text-sm text-muted">You have achieved 38% more sales</p>
            </div>
            <StatusBadge label="Top Performer" tone="primary" />
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-4">
              <span className="inline-flex h-11 w-12 items-center justify-center rounded-full bg-light-primary text-primary">
                <ShoppingBag className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-semibold text-ink">64 new orders</p>
                <p className="text-xs font-medium text-muted">Processing</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex h-11 w-12 items-center justify-center rounded-full bg-light-error text-error">
                <Award className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-semibold text-ink">4 orders</p>
                <p className="text-xs font-medium text-muted">On hold</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="inline-flex h-11 w-12 items-center justify-center rounded-full bg-light-success text-success">
                <DollarSign className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-semibold text-ink">12 orders</p>
                <p className="text-xs font-medium text-muted">Delivered today</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* 4 Compact Stat Cards */}
      <div className="col-span-12 xl:col-span-7">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <StatCard
            title="Monthly Revenue"
            value="$48,290"
            subtitle="$48,290 (+18.4%)"
            tone="primary"
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatCard
            title="Active Customers"
            value="14,820"
            subtitle="14,820 (+9.2%)"
            tone="secondary"
            icon={<Users className="h-5 w-5" />}
          />
          <StatCard
            title="Conversion Rate"
            value="4.86%"
            subtitle="4.86% (+1.1%)"
            tone="success"
            icon={<ArrowUpRight className="h-5 w-5" />}
          />
          <StatCard
            title="Average Order"
            value="$184.50"
            subtitle="$184.50 (+5.4%)"
            tone="warning"
            icon={<ShoppingBag className="h-5 w-5" />}
          />
        </div>
      </div>

      {/* Revenue Forecast */}
      <div className="col-span-12 xl:col-span-8">
        <ChartCard
          title="Revenue Forecast"
          subtitle="Product A vs Product B recurring momentum"
          headerRight={
            <SegmentedTabs
              value={range}
              onChange={setRange}
              options={[
                { value: '6m', label: '6 Months' },
                { value: '12m', label: '12 Months' },
              ]}
            />
          }
        >
          <div className="h-[280px] w-full min-w-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={range === '6m' ? REVENUE_DATA : [...REVENUE_DATA, ...REVENUE_DATA]}
                margin={{ top: 8, right: 12, left: -12, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="d1Area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#00a1ff" stopOpacity={0.22} />
                    <stop offset="95%" stopColor="#00a1ff" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
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
                <Area type="monotone" dataKey="productA" name="Product A" stroke="#00a1ff" strokeWidth={2.5} fill="url(#d1Area)" />
                <Area type="monotone" dataKey="productB" name="Product B" stroke="#8965e5" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      {/* Traffic Split */}
      <div className="col-span-12 xl:col-span-4">
        <ChartCard title="Acquisition Split" subtitle="Live channel distribution" className="h-full">
          <div className="h-[190px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111c2d',
                    border: 'none',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Pie
                  data={TRAFFIC_DATA}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={52}
                  outerRadius={76}
                  paddingAngle={4}
                  stroke="none"
                >
                  {TRAFFIC_DATA.map((item) => (
                    <Cell key={item.name} fill={item.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2.5">
            {TRAFFIC_DATA.map((t) => (
              <div key={t.name} className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-2 text-muted">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                  {t.name}
                </span>
                <span className="font-semibold text-ink">{t.value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>
      </div>

      {/* Weekly Settlements */}
      <div className="col-span-12">
        <ChartCard title="Weekly Settlements" subtitle="Orders settled across the last 6 months">
          <div className="h-[220px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={REVENUE_DATA} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
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
                <Bar dataKey="productA" name="Subscriptions" fill="#00a1ff" barSize={16} radius={[6, 6, 0, 0]} />
                <Bar dataKey="productB" name="One-time" fill="#00ceb6" barSize={16} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
