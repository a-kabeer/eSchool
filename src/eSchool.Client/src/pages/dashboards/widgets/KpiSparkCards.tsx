import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { Banknote, Download, ExternalLink, Users, Wallet } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AnalyticsCard } from '@/components/ui';
import {
  CURRENT_BALANCE_DONUT,
  FOLLOWERS_SPARK,
  INCOME_SPARK,
} from '@/data/dashboard3Data';
import { useToast } from '@/context/ToastContext';

export function KpiSparkCards() {
  const navigate = useNavigate();
  const { showToast } = useToast();

  return (
    <>
      {/* Total followers */}
      <div className="col-span-12 md:col-span-4">
        <AnalyticsCard
          title="Total followers"
          value="4,562"
          deltaLabel="+23% last month"
          tone="error"
          icon={<Users className="h-[18px] w-[18px]" />}
          menuItems={[
            {
              id: 'view-contacts',
              label: 'View Directory',
              icon: <ExternalLink className="h-4 w-4" />,
              onSelect: () => navigate('/apps/contacts'),
            },
            {
              id: 'export-followers',
              label: 'Export Growth CSV',
              icon: <Download className="h-4 w-4" />,
              onSelect: () => showToast('Followers growth exported', 'success'),
            },
          ]}
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={FOLLOWERS_SPARK} barGap={2}>
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{
                    backgroundColor: '#111c2d',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar
                  dataKey="active"
                  stackId="f"
                  fill="#ff6692"
                  barSize={8}
                  radius={[4, 4, 4, 4]}
                />
                <Bar
                  dataKey="rest"
                  stackId="f"
                  fill="#e7d0d9"
                  barSize={8}
                  radius={[4, 4, 4, 4]}
                />
              </BarChart>
            </ResponsiveContainer>
          }
        />
      </div>

      {/* Total Income */}
      <div className="col-span-12 md:col-span-4">
        <AnalyticsCard
          title="Total Income"
          value="$6,280"
          deltaLabel="+18% last month"
          tone="secondary"
          icon={<Wallet className="h-[18px] w-[18px]" />}
          menuItems={[
            {
              id: 'view-reports',
              label: 'Open Analytics',
              icon: <ExternalLink className="h-4 w-4" />,
              onSelect: () => navigate('/analytics/reports'),
            },
            {
              id: 'export-income',
              label: 'Download Statement',
              icon: <Download className="h-4 w-4" />,
              onSelect: () => showToast('Income statement ready', 'success'),
            },
          ]}
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={INCOME_SPARK}>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111c2d',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  name="Income"
                  stroke="#8965e5"
                  strokeWidth={2.5}
                  fill="transparent"
                />
              </AreaChart>
            </ResponsiveContainer>
          }
        />
      </div>

      {/* Current Balance */}
      <div className="col-span-12 md:col-span-4">
        <AnalyticsCard
          title="Current Balance"
          value="$2,529"
          deltaLabel="+42% last month"
          tone="success"
          icon={<Banknote className="h-[18px] w-[18px]" />}
          menuItems={[
            {
              id: 'view-invoices',
              label: 'Manage Invoices',
              icon: <ExternalLink className="h-4 w-4" />,
              onSelect: () => navigate('/apps/invoices'),
            },
            {
              id: 'export-balance',
              label: 'Export Balance',
              icon: <Download className="h-4 w-4" />,
              onSelect: () => showToast('Balance ledger exported', 'success'),
            },
          ]}
          chart={
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#111c2d',
                    border: 'none',
                    borderRadius: '10px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                  itemStyle={{ color: '#fff' }}
                />
                <Pie
                  data={CURRENT_BALANCE_DONUT}
                  dataKey="value"
                  nameKey="name"
                  cx="55%"
                  cy="55%"
                  innerRadius={29}
                  outerRadius={38}
                  startAngle={90}
                  endAngle={-270}
                  stroke="none"
                >
                  {CURRENT_BALANCE_DONUT.map((seg) => (
                    <Cell key={seg.name} fill={seg.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          }
        />
      </div>
    </>
  );
}
