import React, { useEffect, useState } from 'react';
import {
  Package,
  CheckCircle2,
  UserCheck,
  Tag
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, Button, StatusBadge, Modal } from '@/components/ui';
import { useToast } from '@/context/ToastContext';

interface CustodyLog {
  employeeName: string;
  employeeCode: string;
  issuedDate: string;
  returnedDate?: string;
  remarks: string;
}

interface InventoryItem {
  id: string;
  assetTag: string;
  itemName: string;
  category: string;
  serialNumber: string;
  location: string;
  purchaseDate: string;
  purchaseCost: number;
  status: 'Available' | 'Issued' | 'UnderMaintenance' | 'Scrapped';
  currentCustodian?: string;
  custodyLogs: CustodyLog[];
}

const API_V1 = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5050/api/v1'
  : '/api/v1';

export function InventoryPage() {
  const { showToast } = useToast();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Modal
  const [custodyModalOpen, setCustodyModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<InventoryItem | null>(null);

  const [custodyForm, setCustodyForm] = useState({
    employeeName: 'Prof. Tariq Mehmood',
    employeeCode: 'EMP-1001',
    remarks: 'Assigned for Senior Physics Lab Simulation Station'
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_V1}/operations/inventory`);
      if (res.ok) {
        const data = await res.json();
        setItems(data.items || []);
      }
    } catch {
      showToast('Error loading inventory assets', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAssignCustody = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset) return;

    try {
      const res = await fetch(`${API_V1}/operations/inventory/custody-issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assetId: selectedAsset.id,
          ...custodyForm
        })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Custody assignment failed');
      }

      const result = await res.json();
      showToast(result.message, 'success');
      setCustodyModalOpen(false);
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Error assigning custody', 'error');
    }
  };

  const openCustodyModal = (item: InventoryItem) => {
    setSelectedAsset(item);
    setCustodyModalOpen(true);
  };

  // KPIs
  const totalAssets = items.length;
  const issuedAssets = items.filter((i) => i.status === 'Issued').length;
  const availableAssets = items.filter((i) => i.status === 'Available').length;
  const totalValue = items.reduce((acc, i) => acc + i.purchaseCost, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Unified Serialized Asset Custody (INVENTORY_UNITS)"
        breadcrumbs={[{ label: 'eSchool' }, { label: 'Operations' }, { label: 'Inventory' }]}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Total Fixed Assets</p>
              <p className="text-2xl font-bold text-ink mt-1">{totalAssets} Units</p>
            </div>
            <div className="p-2.5 rounded-xl bg-light-primary text-primary">
              <Package className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">Serialized IT, Labs & Generator assets</p>
        </Card>

        <Card className="p-4 bg-surface border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">In Staff Custody</p>
              <p className="text-2xl font-bold text-warning mt-1">{issuedAssets}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-light-warning text-warning">
              <UserCheck className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">Assigned to academic custodians</p>
        </Card>

        <Card className="p-4 bg-surface border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Available in Stock</p>
              <p className="text-2xl font-bold text-success mt-1">{availableAssets}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-light-success text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">Central stores ready for issuance</p>
        </Card>

        <Card className="p-4 bg-surface border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Asset Capital Cost</p>
              <p className="text-2xl font-bold text-primary mt-1">PKR {totalValue.toLocaleString()}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-light-primary text-primary">
              <Tag className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">Balance Sheet fixed assets gross</p>
        </Card>
      </div>

      {/* Asset Table */}
      <Card className="bg-surface border border-border overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <h2 className="font-bold text-ink text-sm sm:text-base">
            Serialized Assets & Custody Log (Retiring Legacy Free-Text Tracking)
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-app text-muted border-b border-border text-[11px] uppercase tracking-wider font-semibold">
              <tr>
                <th className="px-5 py-3.5">Asset Tag</th>
                <th className="px-5 py-3.5">Item Name & Serial</th>
                <th className="px-5 py-3.5">Category & Location</th>
                <th className="px-5 py-3.5">Purchase Cost</th>
                <th className="px-5 py-3.5">Current Custodian</th>
                <th className="px-5 py-3.5">Status</th>
                <th className="px-5 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    Loading inventory units...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-muted">
                    No serialized assets registered.
                  </td>
                </tr>
              ) : (
                items.map((i) => (
                  <tr key={i.id} className="hover:bg-subtle/50 transition-colors">
                    <td className="px-5 py-4 font-mono font-bold text-primary">{i.assetTag}</td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-ink">{i.itemName}</div>
                      <div className="text-[11px] text-muted font-mono mt-0.5">S/N: {i.serialNumber}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-medium text-ink">{i.category}</div>
                      <div className="text-[11px] text-muted">{i.location}</div>
                    </td>
                    <td className="px-5 py-4 font-mono font-semibold text-ink">
                      PKR {i.purchaseCost.toLocaleString()}
                    </td>
                    <td className="px-5 py-4">
                      {i.currentCustodian ? (
                        <div className="text-xs font-semibold text-ink">{i.currentCustodian}</div>
                      ) : (
                        <span className="text-xs text-muted italic">Central Store</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <StatusBadge
                        label={i.status}
                        tone={i.status === 'Issued' ? 'warning' : 'success'}
                        variant="soft"
                      />
                    </td>
                    <td className="px-5 py-4 text-right">
                      {i.status === 'Available' ? (
                        <Button tone="primary" size="sm" onClick={() => openCustodyModal(i)}>
                          Assign Custody
                        </Button>
                      ) : (
                        <span className="text-xs font-semibold text-muted flex items-center justify-end gap-1">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" /> In Custody
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Custody Modal */}
      <Modal open={custodyModalOpen} onClose={() => setCustodyModalOpen(false)} title="Assign Asset Custody to Faculty / Staff">
        {selectedAsset && (
          <form onSubmit={handleAssignCustody} className="space-y-4">
            <div className="p-3 bg-app rounded-lg border border-border">
              <span className="font-mono text-xs font-bold text-primary">{selectedAsset.assetTag}</span>
              <h4 className="font-bold text-ink text-sm">{selectedAsset.itemName}</h4>
              <p className="text-xs text-muted font-mono mt-0.5">S/N: {selectedAsset.serialNumber}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Employee Full Name *</label>
                <input
                  type="text"
                  required
                  value={custodyForm.employeeName}
                  onChange={(e) => setCustodyForm({ ...custodyForm, employeeName: e.target.value })}
                  className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-muted mb-1">Employee Code *</label>
                <input
                  type="text"
                  required
                  value={custodyForm.employeeCode}
                  onChange={(e) => setCustodyForm({ ...custodyForm, employeeCode: e.target.value })}
                  className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary font-mono"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Assignment Remarks / Purpose</label>
              <textarea
                rows={2}
                value={custodyForm.remarks}
                onChange={(e) => setCustodyForm({ ...custodyForm, remarks: e.target.value })}
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button tone="secondary" onClick={() => setCustodyModalOpen(false)}>
                Cancel
              </Button>
              <Button tone="primary" type="submit">
                Confirm Custody Issuance
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
}
