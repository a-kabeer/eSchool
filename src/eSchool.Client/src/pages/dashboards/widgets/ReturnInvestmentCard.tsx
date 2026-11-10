import { useState } from 'react';
import { Bar, BarChart, Cell, ResponsiveContainer, Tooltip, XAxis } from 'recharts';
import { Download, RefreshCw, TrendingUp } from 'lucide-react';
import { Card, DropdownMenu } from '@/components/ui';
import { ROI_MONTHS } from '@/data/dashboard3Data';
import { useTheme } from '@/context/ThemeContext';
import { useToast } from '@/context/ToastContext';

export function ReturnInvestmentCard() {
  const { mode } = useTheme();
  const { showToast } = useToast();
  const [activeMonth, setActiveMonth] = useState<string>('FEB');

  const activeEntry = ROI_MONTHS.find((m) => m.month === activeMonth) ?? ROI_MONTHS[1];
  const mutedBarColor = mode === 'dark' ? 'rgba(255, 255, 255, 0.12)' : 'rgba(17, 28, 45, 0.08)';

  return (
    <Card variant="tinted" tone="primary" className="flex h-full flex-col justify-between">
      <div>
        <div className="mb-4 flex items-center justify-between gap-2">
          <h3 className="text-lg font-semibold text-ink">Return On Investment</h3>
          <DropdownMenu
            ariaLabel="Return On Investment actions"
            items={[
              {
                id: 'reset',
                label: 'Focus February',
                icon: <RefreshCw className="h-4 w-4" />,
                onSelect: () => setActiveMonth('FEB'),
              },
              {
                id: 'export',
                label: 'Export ROI Summary',
                icon: <Download className="h-4 w-4" />,
                onSelect: () => showToast('ROI report exported', 'success'),
              },
            ]}
          />
        </div>

        <div className="mb-3 flex items-center gap-5">
          <span className="inline-flex h-11 w-14 items-center justify-center rounded-full bg-surface text-ink shadow-2xs">
            <TrendingUp className="h-5 w-5" />
          </span>
          <div>
            <p className="text-xl font-bold leading-tight text-ink">283%</p>
            <p className="text-xs font-medium text-muted">ROI</p>
          </div>
          <div>
            <p className="text-sm font-bold leading-tight text-primary">+24%</p>
            <p className="text-xs font-medium text-muted">
              {activeEntry.month === 'FEB' ? 'January' : activeEntry.month}
            </p>
          </div>
        </div>
      </div>

      <div className="h-[205px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={ROI_MONTHS} margin={{ top: 10, right: 4, left: 4, bottom: 0 }}>
            <XAxis
              dataKey="month"
              axisLine={false}
              tickLine={false}
              tick={{ fill: '#7f8da1', fontSize: 11, fontWeight: 500 }}
            />
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
              formatter={(value: number) => [`${value}%`, 'Return']}
            />
            <Bar
              dataKey="value"
              radius={[10, 10, 10, 10]}
              barSize={26}
              onClick={(data) => {
                if (data?.month) setActiveMonth(String(data.month));
              }}
            >
              {ROI_MONTHS.map((entry) => (
                <Cell
                  key={entry.month}
                  cursor="pointer"
                  fill={entry.month === activeMonth ? 'var(--mm-primary)' : mutedBarColor}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
