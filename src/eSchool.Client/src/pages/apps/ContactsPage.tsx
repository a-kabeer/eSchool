import React, { useMemo, useState } from 'react';
import {
  LayoutGrid,
  List,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  Star,
  Trash2,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  Button,
  Card,
  ConfirmationDialog,
  DataTable,
  EmptyState,
  FilterPanel,
  FormInput,
  Modal,
  SearchInput,
  SelectInput,
  StatusBadge,
  type DataTableColumn,
} from '@/components/ui';
import { useAppData } from '@/context/AppDataContext';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import type { ContactRecord } from '@/types';

const TONE_AVATAR = {
  primary: 'bg-light-primary text-primary',
  secondary: 'bg-light-secondary text-secondary',
  success: 'bg-light-success text-success',
  warning: 'bg-light-warning text-warning',
  error: 'bg-light-error text-error',
  info: 'bg-light-info text-info',
  neutral: 'bg-subtle text-muted',
};

export function ContactsPage() {
  const { contacts, addContact, updateContact, deleteContact, toggleContactStar } =
    useAppData();
  const { can } = useAuth();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('ALL');
  const [starredOnly, setStarredOnly] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ContactRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ContactRecord | null>(null);

  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [deptInput, setDeptInput] = useState<ContactRecord['department']>('Design');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return contacts.filter((c) => {
      if (starredOnly && !c.starred) return false;
      if (department !== 'ALL' && c.department !== department) return false;
      if (!q) return true;
      return (
        c.name.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.role.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [contacts, search, department, starredOnly]);

  const openAdd = () => {
    setEditing(null);
    setName('');
    setRole('');
    setDeptInput('Engineering');
    setCompany('MaterialM Labs');
    setEmail('');
    setPhone('+1 (415) 555-0148');
    setLocation('San Francisco, CA');
    setErrors({});
    setModalOpen(true);
  };

  const openEdit = (c: ContactRecord) => {
    setEditing(c);
    setName(c.name);
    setRole(c.role);
    setDeptInput(c.department);
    setCompany(c.company);
    setEmail(c.email);
    setPhone(c.phone);
    setLocation(c.location);
    setErrors({});
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Full name is required';
    if (!role.trim()) errs.role = 'Role is required';
    if (!email.includes('@')) errs.email = 'Valid email is required';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const initials = name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0]?.toUpperCase() ?? '')
      .join('');

    if (editing) {
      updateContact({
        ...editing,
        name: name.trim(),
        role: role.trim(),
        department: deptInput,
        company: company.trim(),
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim(),
        initials: initials || editing.initials,
      });
      showToast(`Updated ${name}`, 'success');
    } else {
      addContact({
        name: name.trim(),
        role: role.trim(),
        department: deptInput,
        company: company.trim() || 'MaterialM Labs',
        email: email.trim(),
        phone: phone.trim(),
        location: location.trim() || 'Remote',
        status: 'Active',
        starred: false,
        initials: initials || 'NM',
        avatarTone: 'primary',
      });
      showToast(`Added ${name} to contacts`, 'success');
    }
    setModalOpen(false);
  };

  const columns: DataTableColumn<ContactRecord>[] = [
    {
      key: 'name',
      header: 'Contact',
      sortable: true,
      sortValue: (c) => c.name,
      render: (c) => (
        <div className="flex items-center gap-3">
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold ${
              TONE_AVATAR[c.avatarTone]
            }`}
          >
            {c.initials}
          </span>
          <div>
            <p className="font-semibold text-ink">{c.name}</p>
            <p className="text-xs text-muted">{c.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: 'Role & Company',
      sortable: true,
      sortValue: (c) => c.role,
      render: (c) => (
        <div>
          <p className="font-medium text-ink">{c.role}</p>
          <p className="text-xs text-muted">{c.company}</p>
        </div>
      ),
    },
    {
      key: 'department',
      header: 'Department',
      sortable: true,
      sortValue: (c) => c.department,
      render: (c) => <StatusBadge label={c.department} tone="primary" />,
    },
    {
      key: 'status',
      header: 'Status',
      render: (c) => (
        <StatusBadge
          label={c.status}
          tone={c.status === 'Active' ? 'success' : c.status === 'Away' ? 'warning' : 'neutral'}
        />
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (c) => (
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => toggleContactStar(c.id)}
            aria-label={`Star ${c.name}`}
            className={`inline-flex h-8 w-8 items-center justify-center rounded-full hover:bg-subtle ${
              c.starred ? 'text-warning' : 'text-muted'
            }`}
          >
            <Star className={`h-4 w-4 ${c.starred ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            disabled={!can('edit')}
            onClick={() => openEdit(c)}
            aria-label={`Edit ${c.name}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-subtle hover:text-primary disabled:opacity-35"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            disabled={!can('delete')}
            onClick={() => setDeleteTarget(c)}
            aria-label={`Delete ${c.name}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-light-error hover:text-error disabled:opacity-35"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Contacts"
        breadcrumbs={[{ label: 'Home', path: '/dashboards/dashboard3' }, { label: 'Contacts' }]}
      />

      <FilterPanel
        chips={[
          {
            label: 'Department',
            value: department,
            onChange: setDepartment,
            options: [
              { label: 'All', value: 'ALL' },
              { label: 'Design', value: 'Design' },
              { label: 'Engineering', value: 'Engineering' },
              { label: 'Sales', value: 'Sales' },
              { label: 'Finance', value: 'Finance' },
            ],
          },
        ]}
        rightSlot={
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setStarredOnly((v) => !v)}
              className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors ${
                starredOnly ? 'bg-light-warning text-warning' : 'bg-subtle text-muted hover:text-ink'
              }`}
            >
              <Star className={`h-3.5 w-3.5 ${starredOnly ? 'fill-current' : ''}`} />
              Starred
            </button>

            <div className="inline-flex rounded-full bg-subtle p-1">
              <button
                type="button"
                aria-label="Grid view"
                onClick={() => setViewMode('grid')}
                className={`rounded-full p-1.5 ${
                  viewMode === 'grid' ? 'bg-surface text-primary shadow-xs' : 'text-muted'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button
                type="button"
                aria-label="Table view"
                onClick={() => setViewMode('table')}
                className={`rounded-full p-1.5 ${
                  viewMode === 'table' ? 'bg-surface text-primary shadow-xs' : 'text-muted'
                }`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            <Button onClick={openAdd} disabled={!can('create')}>
              <Plus className="h-4 w-4" />
              Add Contact
            </Button>
          </div>
        }
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search contacts..."
          className="w-full sm:w-64"
        />
      </FilterPanel>

      {filtered.length === 0 ? (
        <Card>
          <EmptyState
            title="No contacts found"
            description="Try clearing your search or department filter."
            action={
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setDepartment('ALL');
                  setStarredOnly(false);
                }}
              >
                Reset Filters
              </Button>
            }
          />
        </Card>
      ) : viewMode === 'table' ? (
        <Card>
          <DataTable data={filtered} columns={columns} rowKey={(c) => c.id} />
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((c) => (
            <Card key={c.id} className="flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                        TONE_AVATAR[c.avatarTone]
                      }`}
                    >
                      {c.initials}
                    </span>
                    <div className="min-w-0">
                      <h3 className="truncate text-base font-semibold text-ink">{c.name}</h3>
                      <p className="truncate text-xs font-medium text-muted">{c.role}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => toggleContactStar(c.id)}
                    aria-label={`Favorite ${c.name}`}
                    className={`rounded-full p-1.5 hover:bg-subtle ${
                      c.starred ? 'text-warning' : 'text-muted'
                    }`}
                  >
                    <Star className={`h-4 w-4 ${c.starred ? 'fill-current' : ''}`} />
                  </button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <StatusBadge label={c.department} tone="primary" />
                  <StatusBadge
                    label={c.status}
                    tone={
                      c.status === 'Active'
                        ? 'success'
                        : c.status === 'Away'
                          ? 'warning'
                          : 'neutral'
                    }
                  />
                </div>

                <div className="mt-4 space-y-2 text-xs text-muted">
                  <p className="flex items-center gap-2 truncate">
                    <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
                    <span className="truncate">{c.email}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <Phone className="h-3.5 w-3.5 text-success shrink-0" />
                    <span>{c.phone}</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 text-secondary shrink-0" />
                    <span>
                      {c.company} · {c.location}
                    </span>
                  </p>
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-border pt-4">
                <Button
                  variant="soft"
                  tone="primary"
                  size="sm"
                  disabled={!can('edit')}
                  onClick={() => openEdit(c)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                  Edit
                </Button>
                <Button
                  variant="soft"
                  tone="error"
                  size="sm"
                  disabled={!can('delete')}
                  onClick={() => setDeleteTarget(c)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Remove
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? `Edit ${editing.name}` : 'Add Contact'}
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="contact-form">
              {editing ? 'Save Contact' : 'Create Contact'}
            </Button>
          </>
        }
      >
        <form id="contact-form" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              error={errors.name}
            />
            <FormInput
              label="Role / Title"
              required
              value={role}
              onChange={(e) => setRole(e.target.value)}
              error={errors.role}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <SelectInput
              label="Department"
              value={deptInput}
              onChange={(e) => setDeptInput(e.target.value as ContactRecord['department'])}
              options={[
                { label: 'Design', value: 'Design' },
                { label: 'Engineering', value: 'Engineering' },
                { label: 'Sales', value: 'Sales' },
                { label: 'Finance', value: 'Finance' },
                { label: 'Operations', value: 'Operations' },
              ]}
            />
            <FormInput
              label="Company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Email Address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
            />
            <FormInput
              label="Phone"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <FormInput
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </form>
      </Modal>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Remove Contact"
        description={`Remove ${deleteTarget?.name ?? 'this contact'} from the directory?`}
        confirmLabel="Remove"
        onConfirm={() => {
          if (deleteTarget) {
            deleteContact(deleteTarget.id);
            showToast(`Removed ${deleteTarget.name}`, 'info');
          }
        }}
      />
    </div>
  );
}
