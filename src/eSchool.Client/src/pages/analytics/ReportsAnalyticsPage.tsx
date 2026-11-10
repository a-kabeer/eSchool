import { useState } from 'react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button, ChartCard, SegmentedTabs } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

const MONTHLY_SERIES = [
  { month: 'Jan', revenue: 42000, expenses: 24000, growth: 18 },
  { month: 'Feb', revenue: 51000, expenses: 26500, growth: 24 },
  { month: 'Mar', revenue: 48000, expenses: 25000, growth: 21 },
  { month: 'Apr', revenue: 62000, expenses: 29500, growth: 31 },
  { month: 'May', revenue: 68500, expenses: 31000, growth: 36 },
  { month: 'Jun', revenue: 74200, expenses: 32400, growth: 42 },
];

const CHANNEL_RADAR = [
  { channel: 'Email', score: 86, target: 74 },
  { channel: 'Search', score: 92, target: 80 },
  { channel: 'Social', score: 68, target: 72 },
  { channel: 'Direct', score: 78, target: 70 },
  { channel: 'Partner', score: 84, target: 65 },
];

const DONUT_MIX = [
  { name: 'Enterprise SaaS', value: 44, color: '#00a1ff' },
  { name: 'Mid-Market', value: 31, color: '#8965e5' },
  { name: 'Self-Serve', value: 25, color: '#00ceb6' },
];

export function ReportsAnalyticsPage() {
  const [quarter, setQuarter] = useState<'h1' | 'q2'>('h1');
  const { can } = useAuth();
  const { showToast } = useToast();

  const chartData = quarter === 'q2' ? MONTHLY_SERIES.slice(3) : MONTHLY_SERIES;

  const handleExport = () => {
    const csv = [
      'Month,Revenue,Expenses,Growth%',
      ...chartData.map((r) => `${r.month},${r.revenue},${r.expenses},${r.growth}`),
    ].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `materialm-analytics-${quarter}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Analytics CSV downloaded', 'success');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Analytics & Reports"
        breadcrumbs={[
          { label: 'Home', path: '/dashboards/dashboard3' },
          { label: 'Analytics & Reports' },
        ]}
        actions={
          <div className="flex items-center gap-3">
            <SegmentedTabs
              value={quarter}
              onChange={setQuarter}
              options={[
                { value: 'h1', label: 'Jan – Jun' },
                { value: 'q2', label: 'Q2 Only' },
              ]}
            />
            <Button size="sm" disabled={!can('export')} onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-8">
          <ChartCard
            title="Revenue vs Operating Expenses"
            subtitle="Smooth multi-series trend across active markets"
          >
            <div className="h-[290px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 12, left: -6, bottom: 0 }}>
                  <defs>
                    <linearGradient id="repRev" x1="0" y1="0" x2="0" y2="1">
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
                  <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#00a1ff" strokeWidth={2.5} fill="url(#repRev)" />
                  <Area type="monotone" dataKey="expenses" name="Expenses" stroke="#ff6692" strokeWidth={2} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="col-span-12 xl:col-span-4">
          <ChartCard title="Revenue Segment Mix" subtitle="Share by customer tier" className="h-full">
            <div className="h-[200px] w-full">
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
                    data={DONUT_MIX}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={52}
                    outerRadius={78}
                    paddingAngle={4}
                    stroke="none"
                  >
                    {DONUT_MIX.map((item) => (
                      <Cell key={item.name} fill={item.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2.5">
              {DONUT_MIX.map((m) => (
                <div key={m.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-muted">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: m.color }} />
                    {m.name}
                  </span>
                  <span className="font-semibold text-ink">{m.value}%</span>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <ChartCard title="Growth Velocity (%)" subtitle="Month-over-month net expansion">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
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
                  <Line type="monotone" dataKey="growth" name="Growth %" stroke="#00ceb6" strokeWidth={3} dot={{ r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="col-span-12 lg:col-span-6">
          <ChartCard title="Channel Effectiveness Radar" subtitle="Actual score vs quarterly benchmark">
            <div className="h-[260px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="74%" data={CHANNEL_RADAR}>
                  <PolarGrid stroke="var(--mm-border-color)" />
                  <PolarAngleAxis dataKey="channel" tick={{ fill: '#8b98ac', fontSize: 12 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#111c2d',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontSize: '12px',
                    }}
                  />
                  <Radar name="Actual" dataKey="score" stroke="#00a1ff" fill="#00a1ff" fillOpacity={0.55} />
                  <Radar name="Target" dataKey="target" stroke="#8965e5" fill="#8965e5" fillOpacity={0.28} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        <div className="col-span-12">
          <ChartCard title="Monthly Payout Volume" subtitle="Settled volume comparison">
            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
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
                  <Bar dataKey="revenue" name="Gross Volume" fill="#00a1ff" barSize={18} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expenses" name="Operating Spend" fill="#ffae1f" barSize={18} radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  );
}
