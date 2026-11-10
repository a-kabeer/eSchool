import React, { useMemo, useState } from 'react';
import { Calendar, MessageSquare, Plus, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  Button,
  Card,
  ConfirmationDialog,
  FilterPanel,
  FormInput,
  Modal,
  SearchInput,
  SelectInput,
  StatusBadge,
} from '@/components/ui';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { KanbanColumnId, KanbanTask } from '@/types';

const COLUMNS: { id: KanbanColumnId; title: string; badgeTone: 'neutral' | 'primary' | 'warning' | 'success' }[] = [
  { id: 'backlog', title: 'Backlog', badgeTone: 'neutral' },
  { id: 'in_progress', title: 'In Progress', badgeTone: 'primary' },
  { id: 'review', title: 'In Review', badgeTone: 'warning' },
  { id: 'done', title: 'Done', badgeTone: 'success' },
];

export function KanbanPage() {
  const { tasks, addTask, moveTask, deleteTask } = useAppData();
  const { can } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<KanbanTask | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Product');
  const [priority, setPriority] = useState<KanbanTask['priority']>('Medium');
  const [column, setColumn] = useState<KanbanColumnId>('backlog');
  const [assignee, setAssignee] = useState('Erin Reid');
  const [error, setError] = useState('');

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.assignee.toLowerCase().includes(q)
      );
    });
  }, [tasks, search, priorityFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required');
      return;
    }
    addTask({
      title: title.trim(),
      description: description.trim() || 'Task tracked in MaterialM Kanban board.',
      category: category.trim() || 'General',
      priority,
      column,
      assignee,
      dueDate: '2026-11-24',
      commentsCount: 0,
    });
    showToast('Task added to board', 'success');
    setTitle('');
    setDescription('');
    setError('');
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kanban"
        breadcrumbs={[{ label: 'Home', path: '/dashboards/dashboard3' }, { label: 'Kanban' }]}
      />

      <FilterPanel
        chips={[
          {
            label: 'Priority',
            value: priorityFilter,
            onChange: setPriorityFilter,
            options: [
              { label: 'All', value: 'ALL' },
              { label: 'High', value: 'High' },
              { label: 'Medium', value: 'Medium' },
              { label: 'Low', value: 'Low' },
            ],
          },
        ]}
        rightSlot={
          <Button onClick={() => setModalOpen(true)} disabled={!can('create')}>
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        }
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search tasks..."
          className="w-full sm:w-64"
        />
      </FilterPanel>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
        {COLUMNS.map((col) => {
          const colTasks = filtered.filter((t) => t.column === col.id);
          return (
            <div key={col.id} className="flex flex-col rounded-[24px] bg-subtle p-4">
              <div className="mb-4 flex items-center justify-between px-1">
                <h2 className="text-sm font-bold text-ink">{col.title}</h2>
                <StatusBadge label={`${colTasks.length}`} tone={col.badgeTone} />
              </div>

              <div className="space-y-3.5">
                {colTasks.map((task) => (
                  <Card key={task.id} padding="sm" className="p-4">
                    <div className="mb-2.5 flex items-center justify-between gap-2">
                      <StatusBadge
                        label={task.priority}
                        tone={
                          task.priority === 'High'
                            ? 'error'
                            : task.priority === 'Medium'
                              ? 'warning'
                              : 'success'
                        }
                      />
                      <span className="text-[11px] font-semibold text-primary">
                        {task.category}
                      </span>
                    </div>

                    <h3 className="text-sm font-semibold text-ink">{task.title}</h3>
                    <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted">
                      {task.description}
                    </p>

                    <div className="mt-3.5 flex items-center justify-between text-[11px] text-muted">
                      <span className="inline-flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        {task.dueDate}
                      </span>
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {task.commentsCount}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
                      <select
                        aria-label={`Move ${task.title} to column`}
                        disabled={!can('edit')}
                        value={task.column}
                        onChange={(e) => {
                          moveTask(task.id, e.target.value as KanbanColumnId);
                          showToast(`Moved "${task.title}"`, 'info');
                        }}
                        className="rounded-lg border border-border bg-subtle px-2 py-1 text-[11px] font-semibold text-ink focus:border-primary focus:outline-none disabled:opacity-50"
                      >
                        {COLUMNS.map((opt) => (
                          <option key={opt.id} value={opt.id}>
                            {opt.title}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        disabled={!can('delete')}
                        onClick={() => setDeleteTarget(task)}
                        aria-label={`Delete ${task.title}`}
                        className="rounded-full p-1.5 text-muted hover:bg-light-error hover:text-error disabled:opacity-35"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </Card>
                ))}

                {colTasks.length === 0 && (
                  <div className="rounded-2xl border border-dashed border-border py-8 text-center text-xs text-muted">
                    No tasks in {col.title}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Kanban Task"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="kanban-form">
              Create Task
            </Button>
          </>
        }
      >
        <form id="kanban-form" onSubmit={handleCreate} className="space-y-4">
          <FormInput
            label="Task Title"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={error}
          />
          <FormInput
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Describe acceptance criteria..."
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />
            <FormInput
              label="Assignee"
              value={assignee}
              onChange={(e) => setAssignee(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <SelectInput
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as KanbanTask['priority'])}
              options={[
                { label: 'High', value: 'High' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Low', value: 'Low' },
              ]}
            />
            <SelectInput
              label="Column"
              value={column}
              onChange={(e) => setColumn(e.target.value as KanbanColumnId)}
              options={COLUMNS.map((c) => ({ label: c.title, value: c.id }))}
            />
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Task"
        description={`Delete "${deleteTarget?.title ?? ''}" from the board?`}
        confirmLabel="Delete"
        onConfirm={() => {
          if (deleteTarget) {
            deleteTask(deleteTarget.id);
            showToast('Task removed', 'info');
          }
        }}
      />
    </div>
  );
}
