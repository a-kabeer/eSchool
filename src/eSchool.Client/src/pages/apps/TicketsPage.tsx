import React, { useMemo, useState } from 'react';
import { CheckCircle2, Clock3, LifeBuoy, MessageSquarePlus, Plus, Ticket } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  Button,
  Card,
  DataTable,
  FilterPanel,
  FormInput,
  Modal,
  SearchInput,
  SelectInput,
  StatCard,
  StatusBadge,
  type DataTableColumn,
} from '@/components/ui';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { TicketPriority, TicketRecord, TicketStatus } from '@/types';

export function TicketsPage() {
  const { tickets, addTicket, updateTicketStatus, addTicketReply } = useAppData();
  const { can, user } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [createOpen, setCreateOpen] = useState(false);
  const [activeTicketId, setActiveTicketId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  const [subject, setSubject] = useState('');
  const [requester, setRequester] = useState('');
  const [priority, setPriority] = useState<TicketPriority>('Medium');
  const [body, setBody] = useState('');
  const [err, setErr] = useState('');

  const activeTicket = tickets.find((t) => t.id === activeTicketId) ?? null;

  const stats = useMemo(() => {
    return {
      total: tickets.length,
      open: tickets.filter((t) => t.status === 'Open').length,
      progress: tickets.filter((t) => t.status === 'In Progress').length,
      closed: tickets.filter((t) => t.status === 'Closed').length,
    };
  }, [tickets]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tickets.filter((t) => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (!q) return true;
      return (
        t.id.toLowerCase().includes(q) ||
        t.subject.toLowerCase().includes(q) ||
        t.requester.toLowerCase().includes(q)
      );
    });
  }, [tickets, search, statusFilter]);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !requester.trim()) {
      setErr('Subject and requester are required');
      return;
    }
    addTicket(
      {
        subject: subject.trim(),
        requester: requester.trim(),
        requesterEmail: 'client@partner.io',
        assignee: 'Erin Reid',
        priority,
        status: 'Open',
      },
      body.trim() || 'Submitted via MaterialM Support Queue.'
    );
    showToast('Support ticket created', 'success');
    setSubject('');
    setRequester('');
    setBody('');
    setErr('');
    setCreateOpen(false);
  };

  const columns: DataTableColumn<TicketRecord>[] = [
    {
      key: 'id',
      header: 'Ticket ID',
      sortable: true,
      sortValue: (t) => t.id,
      render: (t) => <span className="font-bold text-primary">{t.id}</span>,
    },
    {
      key: 'subject',
      header: 'Subject',
      sortable: true,
      sortValue: (t) => t.subject,
      render: (t) => (
        <div>
          <p className="font-semibold text-ink">{t.subject}</p>
          <p className="text-xs text-muted">{t.requester}</p>
        </div>
      ),
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (t) => (
        <StatusBadge
          label={t.priority}
          tone={
            t.priority === 'Critical' || t.priority === 'High'
              ? 'error'
              : t.priority === 'Medium'
                ? 'warning'
                : 'info'
          }
        />
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (t) => (
        <StatusBadge
          label={t.status}
          tone={
            t.status === 'Closed' ? 'success' : t.status === 'In Progress' ? 'primary' : 'warning'
          }
          variant="solid"
        />
      ),
    },
    {
      key: 'assignee',
      header: 'Assignee',
      render: (t) => <span className="text-muted">{t.assignee}</span>,
    },
    {
      key: 'updated',
      header: 'Updated',
      align: 'right',
      render: (t) => <span className="text-xs text-muted">{t.updatedAt}</span>,
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Support Tickets"
        breadcrumbs={[{ label: 'Home', path: '/dashboards/dashboard3' }, { label: 'Tickets' }]}
      />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Tickets"
          value={`${stats.total}`}
          subtitle={`${stats.total} active queue`}
          tone="primary"
          icon={<Ticket className="h-5 w-5" />}
          onClick={() => setStatusFilter('ALL')}
        />
        <StatCard
          title="Open"
          value={`${stats.open}`}
          subtitle={`${stats.open} awaiting response`}
          tone="warning"
          icon={<LifeBuoy className="h-5 w-5" />}
          onClick={() => setStatusFilter('Open')}
        />
        <StatCard
          title="In Progress"
          value={`${stats.progress}`}
          subtitle={`${stats.progress} assigned`}
          tone="secondary"
          icon={<Clock3 className="h-5 w-5" />}
          onClick={() => setStatusFilter('In Progress')}
        />
        <StatCard
          title="Closed"
          value={`${stats.closed}`}
          subtitle={`${stats.closed} resolved`}
          tone="success"
          icon={<CheckCircle2 className="h-5 w-5" />}
          onClick={() => setStatusFilter('Closed')}
        />
      </div>

      <FilterPanel
        chips={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All', value: 'ALL' },
              { label: 'Open', value: 'Open' },
              { label: 'In Progress', value: 'In Progress' },
              { label: 'Closed', value: 'Closed' },
            ],
          },
        ]}
        rightSlot={
          <Button onClick={() => setCreateOpen(true)} disabled={!can('create')}>
            <Plus className="h-4 w-4" />
            New Ticket
          </Button>
        }
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search tickets..."
          className="w-full sm:w-64"
        />
      </FilterPanel>

      <Card>
        <DataTable
          data={filtered}
          columns={columns}
          rowKey={(t) => t.id}
          onRowClick={(t) => setActiveTicketId(t.id)}
        />
      </Card>

      <Modal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        title="Create Support Ticket"
        footer={
          <>
            <Button variant="ghost" onClick={() => setCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="ticket-form">
              Submit Ticket
            </Button>
          </>
        }
      >
        <form id="ticket-form" onSubmit={handleCreate} className="space-y-4">
          <FormInput
            label="Subject"
            required
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            error={err}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Requester Organization"
              required
              value={requester}
              onChange={(e) => setRequester(e.target.value)}
            />
            <SelectInput
              label="Priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value as TicketPriority)}
              options={[
                { label: 'Critical', value: 'Critical' },
                { label: 'High', value: 'High' },
                { label: 'Medium', value: 'Medium' },
                { label: 'Low', value: 'Low' },
              ]}
            />
          </div>
          <FormInput
            label="Details"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Describe the issue or request..."
          />
        </form>
      </Modal>

      <Modal
        open={Boolean(activeTicket)}
        onClose={() => setActiveTicketId(null)}
        title={activeTicket ? `${activeTicket.id} — ${activeTicket.subject}` : 'Ticket'}
        subtitle={activeTicket ? `Requester: ${activeTicket.requester}` : undefined}
        size="lg"
      >
        {activeTicket && (
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-subtle p-4">
              <div className="flex items-center gap-2">
                <StatusBadge label={activeTicket.priority} tone="warning" />
                <StatusBadge label={activeTicket.status} tone="primary" variant="solid" />
              </div>
              <SelectInput
                label="Change Status"
                disabled={!can('edit')}
                value={activeTicket.status}
                onChange={(e) => {
                  updateTicketStatus(activeTicket.id, e.target.value as TicketStatus);
                  showToast(`Ticket status updated`, 'success');
                }}
                options={[
                  { label: 'Open', value: 'Open' },
                  { label: 'In Progress', value: 'In Progress' },
                  { label: 'Closed', value: 'Closed' },
                ]}
              />
            </div>

            <div className="space-y-3">
              {activeTicket.messages.map((m, idx) => (
                <div key={idx} className="rounded-2xl border border-border p-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-ink">{m.sender}</span>
                    <span className="text-muted">{m.time}</span>
                  </div>
                  <p className="mt-2 text-sm text-ink">{m.body}</p>
                </div>
              ))}
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!replyText.trim()) return;
                addTicketReply(activeTicket.id, user.name, replyText.trim());
                setReplyText('');
                showToast('Reply sent', 'success');
              }}
              className="flex flex-col gap-3 sm:flex-row"
            >
              <input
                type="text"
                disabled={!can('edit')}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Write a reply to this ticket..."
                className="h-10 flex-1 rounded-xl border border-border bg-surface px-3.5 text-sm text-ink focus:border-primary focus:outline-none"
              />
              <Button type="submit" disabled={!can('edit') || !replyText.trim()}>
                <MessageSquarePlus className="h-4 w-4" />
                Send Reply
              </Button>
            </form>
          </div>
        )}
      </Modal>
    </div>
  );
}
