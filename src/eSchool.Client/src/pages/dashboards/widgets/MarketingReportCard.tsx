import { useState } from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import {
  MousePointerClick,
  PieChart as PieChartIcon,
  Play,
  Send,
  TrendingUp,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, DropdownMenu, Modal, StatusBadge } from '@/components/ui';
import { MARKETING_GAUGE_SEGMENTS, MARKETING_METRICS } from '@/data/dashboard3Data';

const METRIC_ICONS = {
  TrendingUp,
  PieChart: PieChartIcon,
  MousePointerClick,
};

export function MarketingReportCard() {
  const [insightsOpen, setInsightsOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <>
      <Card className="flex h-full flex-col justify-between">
        <div>
          <div className="mb-4 flex items-center justify-between gap-2">
            <h3 className="text-lg font-semibold text-ink">Marketing Report</h3>
            <DropdownMenu
              ariaLabel="Marketing Report options"
              items={[
                {
                  id: 'insights',
                  label: 'Open Insights Brief',
                  onSelect: () => setInsightsOpen(true),
                },
                {
                  id: 'analytics',
                  label: 'Full Campaign Analytics',
                  onSelect: () => navigate('/analytics/reports'),
                },
              ]}
            />
          </div>

          <div className="grid grid-cols-12 items-center gap-5 pb-5">
            <div className="col-span-12 sm:col-span-6">
              <ul className="space-y-5">
                {MARKETING_METRICS.map((item) => {
                  const Icon = METRIC_ICONS[item.icon];
                  return (
                    <li key={item.id} className="flex items-center gap-3.5">
                      <span className="inline-flex h-10 w-12 shrink-0 items-center justify-center rounded-full bg-subtle text-muted">
                        <Icon className="h-[18px] w-[18px]" />
                      </span>
                      <div>
                        <p className="text-xs font-medium text-muted">{item.label}</p>
                        <p className="text-lg font-bold leading-snug text-ink">{item.value}</p>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="col-span-12 flex flex-col items-center text-center sm:col-span-6">
              <div className="h-[115px] w-full max-w-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload?.length) return null;
                        const item = payload[0]?.payload as { count?: string; name?: string } | undefined;
                        return (
                          <div className="rounded-xl bg-[#111c2d] px-3 py-1.5 text-xs text-white shadow-md">
                            {item?.name}: <span className="font-semibold">{item?.count}</span>
                          </div>
                        );
                      }}
                    />
                    <Pie
                      data={MARKETING_GAUGE_SEGMENTS}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="88%"
                      startAngle={180}
                      endAngle={0}
                      innerRadius={58}
                      outerRadius={76}
                      paddingAngle={2}
                      stroke="none"
                    >
                      {MARKETING_GAUGE_SEGMENTS.map((seg) => (
                        <Cell key={seg.name} fill={seg.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-2 text-3xl font-bold tracking-tight text-ink">275</p>
              <p className="mt-1.5 max-w-[190px] text-xs font-medium leading-relaxed text-muted">
                Learn insights how to manage all aspects of your startup.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-2xl bg-subtle px-4 py-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <Send className="h-6 w-6 shrink-0 text-primary" />
            <p className="text-xs font-medium leading-relaxed text-muted">
              Learn insights how to manage all aspects of your startup.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setInsightsOpen(true)}
            aria-label="Play startup insights overview"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-white shadow-xs transition-transform hover:scale-105"
          >
            <Play className="h-4 w-4 fill-current" />
          </button>
        </div>
      </Card>

      <Modal
        open={insightsOpen}
        onClose={() => setInsightsOpen(false)}
        title="Startup Marketing Insights"
        subtitle="Attribution & conversion funnel breakdown"
        footer={
          <>
            <Button variant="ghost" onClick={() => setInsightsOpen(false)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setInsightsOpen(false);
                navigate('/analytics/reports');
              }}
            >
              View Full Report
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-subtle p-4">
              <p className="text-xs text-muted">Campaign Score</p>
              <p className="mt-1 text-2xl font-bold text-ink">275 / 300</p>
              <StatusBadge label="Top 8% Benchmark" tone="success" className="mt-2" />
            </div>
            <div className="rounded-2xl bg-subtle p-4">
              <p className="text-xs text-muted">Organic Search Lift</p>
              <p className="mt-1 text-2xl font-bold text-ink">+2.9k</p>
              <StatusBadge label="+14.2% MoM" tone="primary" className="mt-2" />
            </div>
          </div>
          <p className="text-sm leading-relaxed text-muted">
            High-intent search queries and welcome email sequences contributed 68% of qualified
            pipeline conversions this month. Focusing spend on top-performing organic keywords keeps
            customer acquisition cost 22% below target.
          </p>
        </div>
      </Modal>
    </>
  );
}
