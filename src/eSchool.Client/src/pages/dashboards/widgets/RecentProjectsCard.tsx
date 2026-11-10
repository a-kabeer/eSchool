import { useMemo, useState } from 'react';
import { Line, LineChart, ResponsiveContainer } from 'recharts';
import { FolderKanban } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Card,
  DropdownMenu,
  Modal,
  SegmentedTabs,
  StatusBadge,
} from '@/components/ui';
import { ProjectTechIcon, TeamAvatarStack } from '@/components/icons/BrandIcons';
import {
  RECENT_PROJECTS_MOBILE,
  RECENT_PROJECTS_OTHERS,
  RECENT_PROJECTS_SAAS,
} from '@/data/dashboard3Data';
import type { DashboardProject, ProjectCategoryTab } from '@/types';
import { useToast } from '@/context/ToastContext';

export function RecentProjectsCard() {
  const [tab, setTab] = useState<ProjectCategoryTab>('saas');
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [activeProject, setActiveProject] = useState<DashboardProject | null>(null);
  const navigate = useNavigate();
  const { showToast } = useToast();

  const rows = useMemo(() => {
    if (tab === 'mobile') return RECENT_PROJECTS_MOBILE;
    if (tab === 'others') return RECENT_PROJECTS_OTHERS;
    return RECENT_PROJECTS_SAAS;
  }, [tab]);

  const allSelected = rows.length > 0 && rows.every((r) => selectedIds.includes(r.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds((prev) => prev.filter((id) => !rows.some((r) => r.id === id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...rows.map((r) => r.id)])));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <>
      <Card>
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold text-ink">Recent Projects</h3>
            {selectedIds.length > 0 && (
              <StatusBadge label={`${selectedIds.length} selected`} tone="primary" />
            )}
          </div>

          <div className="flex items-center gap-2">
            <SegmentedTabs
              value={tab}
              onChange={setTab}
              options={[
                { value: 'saas', label: 'SaaS' },
                { value: 'mobile', label: 'Mobile' },
                { value: 'others', label: 'Others' },
              ]}
            />
            <DropdownMenu
              ariaLabel="Recent Projects options"
              items={[
                {
                  id: 'kanban',
                  label: 'Open Kanban Board',
                  icon: <FolderKanban className="h-4 w-4" />,
                  onSelect: () => navigate('/apps/kanban'),
                },
                {
                  id: 'export',
                  label: 'Export Table CSV',
                  onSelect: () => showToast(`Exported ${rows.length} ${tab.toUpperCase()} projects`, 'success'),
                },
              ]}
            />
          </div>
        </div>

        <div className="overflow-x-auto mm-scrollbar">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border/80">
                <th className="w-12 py-3 pr-3 text-sm font-semibold text-ink">
                  <button
                    type="button"
                    onClick={toggleAll}
                    aria-label="Toggle select all projects"
                    className="inline-flex items-center gap-2"
                  >
                    <span className="sr-only">Select all</span>
                    #
                  </button>
                </th>
                <th className="py-3 px-2.5 text-sm font-semibold text-ink">Name</th>
                <th className="py-3 px-2.5 text-right text-sm font-semibold text-ink">Budget</th>
                <th className="py-3 px-2.5 text-right text-sm font-semibold text-ink">Team</th>
                <th className="py-3 px-2.5 text-right text-sm font-semibold text-ink">Leader</th>
                <th className="py-3 pl-2.5 text-right text-sm font-semibold text-ink whitespace-nowrap">
                  Activity Log
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/75">
              {rows.map((project) => {
                const isChecked = selectedIds.includes(project.id);
                const sparkPoints = project.sparkData.map((val, idx) => ({ idx, val }));
                return (
                  <tr
                    key={project.id}
                    onClick={() => setActiveProject(project)}
                    className={`cursor-pointer transition-colors hover:bg-subtle/60 ${
                      isChecked ? 'bg-light-primary/30' : ''
                    }`}
                  >
                    <td
                      className="py-4 pr-3"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleOne(project.id)}
                        aria-label={`Select ${project.name}`}
                        className="h-[18px] w-[18px] rounded border-border accent-[var(--mm-primary)] cursor-pointer"
                      />
                    </td>
                    <td className="py-4 px-2.5 whitespace-nowrap">
                      <div className="flex items-center gap-3.5">
                        <ProjectTechIcon iconKey={project.iconKey} />
                        <span className="text-[15px] font-semibold text-ink">{project.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-2.5 text-right text-sm font-medium text-ink whitespace-nowrap">
                      {project.budget}
                    </td>
                    <td className="py-4 px-2.5 text-right whitespace-nowrap">
                      <TeamAvatarStack extraCount={project.teamExtra} />
                    </td>
                    <td className="py-4 px-2.5 text-right text-sm font-medium text-muted whitespace-nowrap">
                      {project.leader}
                    </td>
                    <td className="py-4 pl-2.5 whitespace-nowrap">
                      <div className="ml-auto h-7 w-[108px] xl:w-[132px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={sparkPoints}>
                            <Line
                              type="monotone"
                              dataKey="val"
                              stroke={project.sparkColor}
                              strokeWidth={2}
                              dot={false}
                              isAnimationActive={false}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={Boolean(activeProject)}
        onClose={() => setActiveProject(null)}
        title={activeProject?.name ?? 'Project Overview'}
        subtitle={`Lead: ${activeProject?.leader ?? ''}`}
        footer={
          <>
            <Button variant="ghost" onClick={() => setActiveProject(null)}>
              Close
            </Button>
            <Button
              onClick={() => {
                setActiveProject(null);
                navigate('/apps/kanban');
              }}
            >
              Open in Kanban
            </Button>
          </>
        }
      >
        {activeProject && (
          <div className="space-y-4">
            <div className="flex items-center justify-between rounded-2xl bg-subtle p-4">
              <div className="flex items-center gap-3.5">
                <ProjectTechIcon iconKey={activeProject.iconKey} />
                <div>
                  <p className="text-sm font-semibold text-ink">{activeProject.name}</p>
                  <p className="text-xs text-muted uppercase">{activeProject.category} Track</p>
                </div>
              </div>
              <StatusBadge
                label={activeProject.status}
                tone={
                  activeProject.status === 'Active'
                    ? 'success'
                    : activeProject.status === 'Review'
                      ? 'warning'
                      : 'primary'
                }
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs text-muted">Allocated Budget</p>
                <p className="mt-1 text-lg font-bold text-ink">{activeProject.budget}</p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <p className="text-xs text-muted">Project Lead</p>
                <p className="mt-1 text-lg font-bold text-ink">{activeProject.leader}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </>
  );
}
