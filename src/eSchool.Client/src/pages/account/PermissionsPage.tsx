import { Check, ShieldCheck, X } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, StatusBadge } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { ROLE_PERMISSION_MATRICES } from '@/data/mockStoreData';
import type { UserRole } from '@/types';

export function PermissionsPage() {
  const { user, setRole } = useAuth();
  const { showToast } = useToast();

  const activeMatrix =
    ROLE_PERMISSION_MATRICES.find((r) => r.role === user.role) ?? ROLE_PERMISSION_MATRICES[0];

  const handleSelectRole = (role: UserRole) => {
    setRole(role);
    showToast(`Active role switched to ${role}`, 'info', 'Module permissions updated live.');
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Role Base Access"
        breadcrumbs={[
          { label: 'Home', path: '/dashboards/dashboard3' },
          { label: 'Role Base Access' },
        ]}
      />

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {ROLE_PERMISSION_MATRICES.map((item) => {
          const isCurrent = item.role === user.role;
          return (
            <Card
              key={item.role}
              className={`cursor-pointer transition-all ${
                isCurrent ? 'ring-2 ring-primary' : 'hover:-translate-y-0.5'
              }`}
              onClick={() => handleSelectRole(item.role)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-light-primary text-primary">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <h2 className="text-base font-bold text-ink">{item.role}</h2>
                </div>
                {isCurrent && <StatusBadge label="Active Role" tone="primary" variant="solid" />}
              </div>
              <p className="mt-3 text-xs leading-relaxed text-muted">{item.description}</p>
            </Card>
          );
        })}
      </div>

      <Card>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold text-ink">
              Permission Matrix — {activeMatrix.role}
            </h3>
            <p className="text-sm text-muted">
              Select a role card above to test live CRUD guardrails across Invoices, Contacts,
              Kanban, and Tickets.
            </p>
          </div>
          <StatusBadge label={`Current: ${user.role}`} tone="success" />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase text-muted">
                <th className="py-3 pr-4">Application Module</th>
                <th className="py-3 px-4 text-center">View</th>
                <th className="py-3 px-4 text-center">Create</th>
                <th className="py-3 px-4 text-center">Edit</th>
                <th className="py-3 px-4 text-center">Delete</th>
                <th className="py-3 pl-4 text-center">Export</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/75 text-sm">
              {activeMatrix.permissions.map((row) => (
                <tr key={row.module}>
                  <td className="py-4 pr-4 font-semibold text-ink">{row.module}</td>
                  {(['view', 'create', 'edit', 'delete', 'export'] as const).map((cap) => {
                    const allowed = row[cap];
                    return (
                      <td key={cap} className="py-4 px-4 text-center">
                        <span
                          className={`inline-flex h-7 w-7 items-center justify-center rounded-full ${
                            allowed
                              ? 'bg-light-success text-success'
                              : 'bg-light-error text-error'
                          }`}
                        >
                          {allowed ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
