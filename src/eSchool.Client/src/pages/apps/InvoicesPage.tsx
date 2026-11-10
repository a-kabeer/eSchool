import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CheckCircle2,
  Clock3,
  Eye,
  LayoutList,
  Pencil,
  Plus,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import {
  Button,
  Card,
  ConfirmationDialog,
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
import type { InvoiceRecord, InvoiceStatus } from '@/types';

function computeTotal(inv: InvoiceRecord): number {
  return inv.items.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
}

const STATUS_TONE: Record<InvoiceStatus, 'secondary' | 'success' | 'warning'> = {
  Shipped: 'secondary',
  Delivered: 'success',
  Pending: 'warning',
};

export function InvoicesPage() {
  const { invoices, addInvoice, updateInvoice, deleteInvoice } = useAppData();
  const { can } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedKeys, setSelectedKeys] = useState<(string | number)[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<InvoiceRecord | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<InvoiceRecord | null>(null);

  // Form state
  const [billFrom, setBillFrom] = useState('');
  const [billTo, setBillTo] = useState('');
  const [billToEmail, setBillToEmail] = useState('');
  const [itemName, setItemName] = useState('');
  const [unitPrice, setUnitPrice] = useState('90');
  const [quantity, setQuantity] = useState('1');
  const [status, setStatus] = useState<InvoiceStatus>('Pending');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const counts = useMemo(() => {
    return {
      total: invoices.length,
      shipped: invoices.filter((i) => i.status === 'Shipped').length,
      delivered: invoices.filter((i) => i.status === 'Delivered').length,
      pending: invoices.filter((i) => i.status === 'Pending').length,
    };
  }, [invoices]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return invoices.filter((inv) => {
      const matchesStatus = statusFilter === 'ALL' || inv.status === statusFilter;
      const matchesSearch =
        !q ||
        String(inv.id).includes(q) ||
        inv.invoiceNumber.toLowerCase().includes(q) ||
        inv.billFrom.toLowerCase().includes(q) ||
        inv.billTo.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [invoices, search, statusFilter]);

  const openCreateModal = () => {
    setEditingInvoice(null);
    setBillFrom('MaterialM Inc.');
    setBillTo('');
    setBillToEmail('');
    setItemName('Dashboard Pro License');
    setUnitPrice('90');
    setQuantity('1');
    setStatus('Pending');
    setFormErrors({});
    setModalOpen(true);
  };

  const openEditModal = (inv: InvoiceRecord) => {
    setEditingInvoice(inv);
    setBillFrom(inv.billFrom);
    setBillTo(inv.billTo);
    setBillToEmail(inv.billToEmail);
    setItemName(inv.items[0]?.itemName ?? 'Service Package');
    setUnitPrice(String(inv.items[0]?.unitPrice ?? 90));
    setQuantity(String(inv.items[0]?.quantity ?? 1));
    setStatus(inv.status);
    setFormErrors({});
    setModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!billFrom.trim()) errs.billFrom = 'Sender name is required';
    if (!billTo.trim()) errs.billTo = 'Recipient name is required';
    if (!itemName.trim()) errs.itemName = 'Line item description is required';
    const priceNum = Number(unitPrice);
    const qtyNum = Number(quantity);
    if (!Number.isFinite(priceNum) || priceNum <= 0) errs.unitPrice = 'Enter a valid positive amount';
    if (!Number.isFinite(qtyNum) || qtyNum < 1) errs.quantity = 'Quantity must be at least 1';

    if (Object.keys(errs).length > 0) {
      setFormErrors(errs);
      return;
    }

    if (editingInvoice) {
      updateInvoice({
        ...editingInvoice,
        billFrom: billFrom.trim(),
        billTo: billTo.trim(),
        billToEmail: billToEmail.trim() || editingInvoice.billToEmail,
        status,
        items: [
          {
            id: editingInvoice.items[0]?.id ?? 'li-1',
            itemName: itemName.trim(),
            unitPrice: priceNum,
            quantity: qtyNum,
          },
        ],
      });
      showToast(`Updated ${editingInvoice.invoiceNumber}`, 'success');
    } else {
      const nextNum = invoices.reduce((m, i) => Math.max(m, i.id), 100) + 1;
      addInvoice({
        invoiceNumber: `INV-${nextNum}`,
        billFrom: billFrom.trim(),
        billFromEmail: 'billing@materialm.io',
        billFromAddress: '214 Market St, San Francisco, CA',
        billTo: billTo.trim(),
        billToEmail: billToEmail.trim() || 'accounts@client.io',
        billToAddress: '500 Boylston St, Boston, MA',
        orderDate: new Date().toISOString().slice(0, 10),
        dueDate: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
        status,
        items: [{ id: 'li-1', itemName: itemName.trim(), unitPrice: priceNum, quantity: qtyNum }],
      });
      showToast(`Created invoice INV-${nextNum}`, 'success');
    }
    setModalOpen(false);
  };

  const columns: DataTableColumn<InvoiceRecord>[] = [
    {
      key: 'id',
      header: 'Id',
      sortable: true,
      sortValue: (row) => row.id,
      render: (row) => <span className="font-semibold text-ink">{row.id}</span>,
    },
    {
      key: 'billFrom',
      header: 'Bill From',
      sortable: true,
      sortValue: (row) => row.billFrom,
      render: (row) => <span className="font-medium text-ink">{row.billFrom}</span>,
    },
    {
      key: 'billTo',
      header: 'Bill To',
      sortable: true,
      sortValue: (row) => row.billTo,
      render: (row) => <span className="text-ink">{row.billTo}</span>,
    },
    {
      key: 'total',
      header: 'Total Cost',
      sortable: true,
      sortValue: (row) => computeTotal(row),
      render: (row) => <span className="font-semibold text-ink">${computeTotal(row)}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      sortValue: (row) => row.status,
      render: (row) => (
        <StatusBadge label={row.status} tone={STATUS_TONE[row.status]} variant="solid" />
      ),
    },
    {
      key: 'actions',
      header: 'Action',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            disabled={!can('edit')}
            onClick={() => openEditModal(row)}
            aria-label={`Edit invoice ${row.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-subtle hover:text-primary disabled:opacity-35"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <Link
            to={`/apps/invoices/${row.id}`}
            aria-label={`View invoice ${row.id}`}
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-subtle hover:text-primary"
          >
            <Eye className="h-4 w-4" />
          </Link>
          <button
            type="button"
            disabled={!can('delete')}
            onClick={() => setDeleteTarget(row)}
            aria-label={`Delete invoice ${row.id}`}
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
        title="Invoice"
        breadcrumbs={[{ label: 'Home', path: '/dashboards/dashboard3' }, { label: 'Invoice' }]}
      />

      {/* 4 Tinted KPI Summary Cards matching ref_invoice.png */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total"
          value={`${counts.total}`}
          subtitle={`${counts.total} invoices`}
          tone="primary"
          icon={<LayoutList className="h-5 w-5" />}
          onClick={() => setStatusFilter('ALL')}
        />
        <StatCard
          title="Shipped"
          value={`${counts.shipped}`}
          subtitle={`${counts.shipped} invoices`}
          tone="secondary"
          icon={<ShoppingBag className="h-5 w-5" />}
          onClick={() => setStatusFilter('Shipped')}
        />
        <StatCard
          title="Delivered"
          value={`${counts.delivered}`}
          subtitle={`${counts.delivered} invoices`}
          tone="success"
          icon={<Truck className="h-5 w-5" />}
          onClick={() => setStatusFilter('Delivered')}
        />
        <StatCard
          title="Pending"
          value={`${counts.pending}`}
          subtitle={`${counts.pending} invoices`}
          tone="warning"
          icon={<Clock3 className="h-5 w-5" />}
          onClick={() => setStatusFilter('Pending')}
        />
      </div>

      {/* Filter & Search Bar */}
      <FilterPanel
        chips={[
          {
            label: 'Status',
            value: statusFilter,
            onChange: setStatusFilter,
            options: [
              { label: 'All', value: 'ALL' },
              { label: 'Shipped', value: 'Shipped' },
              { label: 'Delivered', value: 'Delivered' },
              { label: 'Pending', value: 'Pending' },
            ],
          },
        ]}
        onReset={
          search || statusFilter !== 'ALL'
            ? () => {
                setSearch('');
                setStatusFilter('ALL');
              }
            : undefined
        }
        rightSlot={
          <Button onClick={openCreateModal} disabled={!can('create')}>
            <Plus className="h-4 w-4" />
            Add Invoice
          </Button>
        }
      >
        <SearchInput
          value={search}
          onChange={setSearch}
          placeholder="Search Invoice"
          className="w-full sm:w-64"
        />
      </FilterPanel>

      {/* Main Invoice Table Card */}
      <Card>
        {selectedKeys.length > 0 && (
          <div className="mb-4 flex items-center justify-between rounded-2xl bg-light-primary/60 px-4 py-2.5 text-xs font-semibold text-primary">
            <span className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              {selectedKeys.length} invoice(s) selected
            </span>
            <button
              type="button"
              onClick={() => setSelectedKeys([])}
              className="underline"
            >
              Clear selection
            </button>
          </div>
        )}

        <DataTable
          data={filtered}
          columns={columns}
          rowKey={(r) => r.id}
          selectable
          selectedKeys={selectedKeys}
          onSelectionChange={setSelectedKeys}
          onRowClick={(row) => navigate(`/apps/invoices/${row.id}`)}
          emptyTitle="No invoices match your filter"
          emptyDescription="Adjust your search query or create a new invoice."
          emptyAction={
            <Button onClick={openCreateModal} disabled={!can('create')}>
              Create Invoice
            </Button>
          }
        />
      </Card>

      {/* Create / Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingInvoice ? `Edit ${editingInvoice.invoiceNumber}` : 'Create New Invoice'}
        subtitle="Fill out billing details and line item cost"
        footer={
          <>
            <Button variant="ghost" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" form="invoice-form">
              {editingInvoice ? 'Save Changes' : 'Create Invoice'}
            </Button>
          </>
        }
      >
        <form id="invoice-form" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Bill From"
              required
              value={billFrom}
              onChange={(e) => setBillFrom(e.target.value)}
              error={formErrors.billFrom}
            />
            <FormInput
              label="Bill To"
              required
              value={billTo}
              onChange={(e) => setBillTo(e.target.value)}
              error={formErrors.billTo}
            />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FormInput
              label="Client Email"
              type="email"
              value={billToEmail}
              onChange={(e) => setBillToEmail(e.target.value)}
              placeholder="accounts@client.io"
            />
            <SelectInput
              label="Invoice Status"
              value={status}
              onChange={(e) => setStatus(e.target.value as InvoiceStatus)}
              options={[
                { label: 'Pending', value: 'Pending' },
                { label: 'Shipped', value: 'Shipped' },
                { label: 'Delivered', value: 'Delivered' },
              ]}
            />
          </div>
          <FormInput
            label="Item / Service Description"
            required
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            error={formErrors.itemName}
          />
          <div className="grid grid-cols-2 gap-4">
            <FormInput
              label="Unit Price ($)"
              type="number"
              min="1"
              step="0.01"
              required
              value={unitPrice}
              onChange={(e) => setUnitPrice(e.target.value)}
              error={formErrors.unitPrice}
            />
            <FormInput
              label="Quantity"
              type="number"
              min="1"
              required
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              error={formErrors.quantity}
            />
          </div>
          <div className="flex items-center justify-between rounded-2xl bg-subtle px-4 py-3 text-sm">
            <span className="font-medium text-muted">Calculated Total</span>
            <span className="text-lg font-bold text-ink">
              ${(Number(unitPrice || 0) * Number(quantity || 0)).toFixed(2)}
            </span>
          </div>
        </form>
      </Modal>

      <ConfirmationDialog
        open={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title="Delete Invoice"
        description={`Are you sure you want to permanently remove ${deleteTarget?.invoiceNumber ?? 'this invoice'}?`}
        confirmLabel="Delete Invoice"
        onConfirm={() => {
          if (deleteTarget) {
            deleteInvoice(deleteTarget.id);
            showToast(`Deleted ${deleteTarget.invoiceNumber}`, 'info');
          }
        }}
      />
    </div>
  );
}
