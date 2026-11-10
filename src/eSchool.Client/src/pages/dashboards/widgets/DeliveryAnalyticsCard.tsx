import { useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Rocket } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, DropdownMenu, SegmentedTabs } from '@/components/ui';
import { DELIVERY_RADAR_DATA, DELIVERY_WEEKLY_BARS } from '@/data/dashboard3Data';
import { useToast } from '@/context/ToastContext';

type DeliveryTab = 'email' | 'weekly';

const RATE_ITEMS = [
  { label: 'Open Rate', pct: '22.3%', dotClass: 'bg-primary' },
  { label: 'Click-through Rate', pct: '14.2%', dotClass: 'bg-secondary' },
  { label: 'Conversation Rate', pct: '11.6%', dotClass: 'bg-error' },
];

export function DeliveryAnalyticsCard() {
  const [tab, setTab] = useState<DeliveryTab>('email');
  const navigate = useNavigate();
  const { showToast } = useToast();

  return (
    <Card className="h-full">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-semibold text-ink">Delivery Analytics</h3>
        <div className="flex items-center gap-2">
          <SegmentedTabs
            value={tab}
            onChange={setTab}
            options={[
              { value: 'email', label: 'Email' },
              { value: 'weekly', label: 'From last week' },
            ]}
          />
          <DropdownMenu
            ariaLabel="Delivery Analytics options"
            items={[
              {
                id: 'reports',
                label: 'Detailed Delivery Metrics',
                onSelect: () => navigate('/analytics/reports'),
              },
              {
                id: 'export',
                label: 'Export Engagement Data',
                onSelect: () => showToast('Delivery analytics exported', 'success'),
              },
            ]}
          />
        </div>
      </div>

      {tab === 'email' ? (
        <div className="grid grid-cols-12 items-center gap-6">
          <div className="col-span-12 h-[330px] min-w-0 lg:col-span-7">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={DELIVERY_RADAR_DATA}>
                <PolarGrid stroke="var(--mm-border-color)" />
                <PolarAngleAxis
                  dataKey="month"
                  tick={{ fill: '#8b98ac', fontSize: 13 }}
                />
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
                <Radar
                  name="Sales"
                  dataKey="sales"
                  stroke="#00a1ff"
                  fill="#00a1ff"
                  fillOpacity={0.95}
                  isAnimationActive={false}
                />
                <Radar
                  name="Visits"
                  dataKey="visits"
                  stroke="#f5ccd8"
                  fill="#ffe4ec"
                  fillOpacity={0.85}
                  isAnimationActive={false}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="col-span-12 lg:col-span-5">
            <div className="mb-7 rounded-2xl bg-subtle px-5 py-4.5">
              <Rocket className="h-7 w-7 text-primary" />
              <h4 className="mt-2 text-lg font-semibold text-ink">Welcome Emails!</h4>
              <p className="mt-0.5 text-sm font-medium text-ink/80">Have great potential!</p>
            </div>

            <div className="space-y-4">
              {RATE_ITEMS.map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className={`h-2.5 w-4.5 shrink-0 rounded-full ${item.dotClass}`} />
                  <span className="text-base font-bold text-ink">{item.pct}</span>
                  <span className="text-sm font-medium text-muted">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="h-[330px] w-full min-w-0">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DELIVERY_WEEKLY_BARS} margin={{ top: 10, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--mm-border-color)" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8b98ac', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#8b98ac', fontSize: 12 }}
              />
              <Tooltip
                cursor={{ fill: 'rgba(0, 161, 255, 0.06)' }}
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
                dataKey="thisYear"
                name="This year"
                fill="var(--mm-primary)"
                barSize={12}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="lastYear"
                name="Last year"
                fill="var(--mm-secondary)"
                barSize={12}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </Card>
  );
}
