import { useMemo, useState } from 'react';
import { Download } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  Button,
  Card,
  DataTable,
  FilterPanel,
  SearchInput,
  StatusBadge,
  type DataTableColumn,
} from '@/components/ui';
import { ProjectTechIcon, TeamAvatarStack } from '@/components/icons/BrandIcons';
import { RECENT_PROJECTS_SAAS } from '@/data/dashboard3Data';
import type { DashboardProject } from '@/types';
import { useToast } from '@/context/ToastContext';

export function DataTablePage() {
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('ALL');
  const [selected, setSelected] = useState<(string | number)[]>([]);
  const { showToast } = useToast();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return RECENT_PROJECTS_SAAS.filter((p) => {
      if (status !== 'ALL' && p.status !== status) return false;
      if (!q) return true;
      return p.name.toLowerCase().includes(q) || p.leader.toLowerCase().includes(q);
    });
  }, [search, status]);

  const columns: DataTableColumn<DashboardProject>[] = [
    {
      key: 'name',
      header: 'Project',
      sortable: true,
      sortValue: (r) => r.name,
      render: (r) => (
        <div className="flex items-center gap-3.5">
          <ProjectTechIcon iconKey={r.iconKey} />
          <span className="font-semibold text-ink">{r.name}</span>
        </div>
      ),
    },
    {
      key: 'leader',
      header: 'Leader',
      sortable: true,
      sortValue: (r) => r.leader,
      render: (r) => <span className="text-muted">{r.leader}</span>,
    },
    {
      key: 'team',
      header: 'Team',
      align: 'right',
      render: (r) => <TeamAvatarStack extraCount={r.teamExtra} />,
    },
    {
      key: 'budget',
      header: 'Budget',
      align: 'right',
      sortable: true,
      sortValue: (r) => r.budgetValue,
      render: (r) => <span className="font-semibold text-ink">{r.budget}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (r) => r.status,
      render: (r) => (
        <StatusBadge
          label={r.status}
          tone={r.status === 'Active' ? 'success' : r.status === 'Review' ? 'warning' : 'primary'}
        />
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Data Table"
        breadcrumbs={[{ label: 'Home', path: '/dashboards/dashboard3' }, { label: 'Data Table' }]}
      />

      <FilterPanel
        chips={[
          {
            label: 'Status',
            value: status,
            onChange: setStatus,
            options: [
              { label: 'All', value: 'ALL' },
              { label: 'Active', value: 'Active' },
              { label: 'Review', value: 'Review' },
              { label: 'Completed', value: 'Completed' },
            ],
          },
        ]}
        rightSlot={
          <Button
            variant="soft"
            tone="primary"
            onClick={() =>
              showToast(`Exported ${filtered.length} records to CSV`, 'success')
            }
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        }
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search projects or leaders..."
          className="w-full sm:w-64"
        />
      </FilterPanel>

      <Card>
        <DataTable
          data={filtered}
          columns={columns}
          rowKey={(r) => r.id}
          selectable
          selectedKeys={selected}
          onSelectionChange={setSelected}
        />
      </Card>
    </div>
  );
}
