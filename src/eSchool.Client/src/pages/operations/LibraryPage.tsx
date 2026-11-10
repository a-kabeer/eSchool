import React, { useEffect, useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  Clock,
  Barcode,
  Coins
} from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Card, Button, StatusBadge, Modal } from '@/components/ui';
import { useToast } from '@/context/ToastContext';

interface BookCopy {
  barcode: string;
  copyNumber: number;
  condition: string;
  isIssued: boolean;
}

interface Book {
  id: string;
  bookCode: string;
  title: string;
  author: string;
  category: string;
  totalCopies: number;
  availableCopies: number;
  copies: BookCopy[];
}

interface Circulation {
  id: string;
  copyBarcode: string;
  bookTitle: string;
  borrowerType: string;
  borrowerName: string;
  borrowerIdentifier: string;
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  overdueDays: number;
  fineAmount: number;
  isReturned: boolean;
}

const API_V1 = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
  ? 'http://localhost:5050/api/v1'
  : '/api/v1';

export function LibraryPage() {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'catalog' | 'circulation'>('catalog');
  const [books, setBooks] = useState<Book[]>([]);
  const [circulations, setCirculations] = useState<Circulation[]>([]);

  // Modals
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [selectedBarcode, setSelectedBarcode] = useState('');

  // Issue Form
  const [issueForm, setIssueForm] = useState({
    copyBarcode: '',
    borrowerType: 'Student',
    borrowerName: 'Muhammad Hamza Ali',
    borrowerIdentifier: '1084',
    dueDays: 14
  });

  const loadData = async () => {
    try {
      const [bRes, cRes] = await Promise.all([
        fetch(`${API_V1}/operations/library/books`),
        fetch(`${API_V1}/operations/library/circulations`)
      ]);

      if (bRes.ok) {
        const data = await bRes.json();
        setBooks(data.items || []);
      }
      if (cRes.ok) {
        const data = await cRes.json();
        setCirculations(data || []);
      }
    } catch {
      showToast('Error loading library data', 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleIssueBook = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(`${API_V1}/operations/library/issue`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(issueForm)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Issue failed');
      }

      const result = await res.json();
      showToast(result.message, 'success');
      setIssueModalOpen(false);
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Issue failed', 'error');
    }
  };

  const handleReturnBook = async () => {
    if (!selectedBarcode) return;
    try {
      const res = await fetch(`${API_V1}/operations/library/return`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ copyBarcode: selectedBarcode })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Return failed');
      }

      const result = await res.json();
      showToast(result.message, result.fineAmount > 0 ? 'warning' : 'success');
      setReturnModalOpen(false);
      loadData();
    } catch (err: unknown) {
      showToast(err instanceof Error ? err.message : 'Return failed', 'error');
    }
  };

  const openReturn = (barcode: string) => {
    setSelectedBarcode(barcode);
    setReturnModalOpen(true);
  };

  // KPIs
  const totalBooks = books.reduce((acc, b) => acc + b.totalCopies, 0);
  const availableCopies = books.reduce((acc, b) => acc + b.availableCopies, 0);
  const activeLoans = circulations.filter((c) => !c.isReturned).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Library Circulation & Barcode Catalog (CAT-BOOK-COPY)"
        breadcrumbs={[{ label: 'eSchool' }, { label: 'Operations' }, { label: 'Library' }]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              tone="primary"
              size="md"
              onClick={() => {
                setIssueForm({
                  copyBarcode: 'CAT-ENG-0012-02',
                  borrowerType: 'Student',
                  borrowerName: 'Muhammad Hamza Ali',
                  borrowerIdentifier: '1084',
                  dueDays: 14
                });
                setIssueModalOpen(true);
              }}
            >
              <Barcode className="mr-2 h-4 w-4" />
              Issue Book (Scanner)
            </Button>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Total Titles & Copies</p>
              <p className="text-2xl font-bold text-ink mt-1">
                {books.length} Titles / {totalBooks} Copies
              </p>
            </div>
            <div className="p-2.5 rounded-xl bg-light-primary text-primary">
              <BookOpen className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">Oxford & PTB approved textbooks</p>
        </Card>

        <Card className="p-4 bg-surface border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Available on Shelf</p>
              <p className="text-2xl font-bold text-success mt-1">{availableCopies}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-light-success text-success">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">Ready for immediate checkout</p>
        </Card>

        <Card className="p-4 bg-surface border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Active Borrowers</p>
              <p className="text-2xl font-bold text-warning mt-1">{activeLoans}</p>
            </div>
            <div className="p-2.5 rounded-xl bg-light-warning text-warning">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">Max limit: 2 books / student</p>
        </Card>

        <Card className="p-4 bg-surface border border-border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-muted uppercase tracking-wider">Fine Rate Policy</p>
              <p className="text-2xl font-bold text-primary mt-1">PKR 50 / Day</p>
            </div>
            <div className="p-2.5 rounded-xl bg-light-primary text-primary">
              <Coins className="h-5 w-5" />
            </div>
          </div>
          <p className="text-xs text-muted mt-2">Capped at PKR 500 ceiling</p>
        </Card>
      </div>

      {/* Main Tabs */}
      <Card className="bg-surface border border-border overflow-hidden">
        <div className="border-b border-border px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('catalog')}
              className={`pb-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'catalog'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              1. Book Catalog & Barcode Copies ({books.length})
            </button>
            <button
              onClick={() => setActiveTab('circulation')}
              className={`pb-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === 'circulation'
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              2. Circulation Register & Returns ({circulations.length})
            </button>
          </div>
        </div>

        {/* Catalog Tab */}
        {activeTab === 'catalog' && (
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {books.map((b) => (
                <div key={b.id} className="border border-border rounded-xl p-5 bg-card space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="font-mono text-xs text-primary font-bold">{b.bookCode}</span>
                      <h3 className="font-bold text-ink text-base mt-1">{b.title}</h3>
                      <p className="text-xs text-muted">Author: {b.author} | {b.category}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold bg-subtle px-2 py-1 rounded text-ink">
                        {b.availableCopies} / {b.totalCopies} Available
                      </span>
                    </div>
                  </div>

                  <div className="border-t border-border pt-3">
                    <p className="text-xs font-semibold text-muted mb-2">Serialized Barcode Copies:</p>
                    <div className="space-y-1.5">
                      {b.copies.map((c) => (
                        <div
                          key={c.barcode}
                          className="flex items-center justify-between text-xs bg-subtle/50 px-3 py-2 rounded-lg border border-border"
                        >
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-ink">{c.barcode}</span>
                            <span className="text-muted">(Copy #{c.copyNumber})</span>
                          </div>
                          <div>
                            {c.isIssued ? (
                              <button
                                onClick={() => openReturn(c.barcode)}
                                className="text-xs font-bold text-warning hover:underline"
                              >
                                Issued (Click to Return)
                              </button>
                            ) : (
                              <span className="text-xs font-semibold text-success">Available on Shelf</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Circulation Tab */}
        {activeTab === 'circulation' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-app text-muted border-b border-border text-[11px] uppercase tracking-wider font-semibold">
                <tr>
                  <th className="px-5 py-3.5">Barcode</th>
                  <th className="px-5 py-3.5">Book Title</th>
                  <th className="px-5 py-3.5">Borrower Details</th>
                  <th className="px-5 py-3.5">Issue & Due Date</th>
                  <th className="px-5 py-3.5">Status & Fine</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {circulations.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted">
                      No active circulation records.
                    </td>
                  </tr>
                ) : (
                  circulations.map((c) => (
                    <tr key={c.id} className="hover:bg-subtle/50 transition-colors">
                      <td className="px-5 py-4 font-mono font-bold text-primary">{c.copyBarcode}</td>
                      <td className="px-5 py-4 font-semibold text-ink">{c.bookTitle}</td>
                      <td className="px-5 py-4">
                        <div className="font-semibold text-ink">{c.borrowerName}</div>
                        <div className="text-[11px] text-muted">
                          {c.borrowerType} ({c.borrowerIdentifier})
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div>Due: {new Date(c.dueDate).toLocaleDateString()}</div>
                        <div className="text-[11px] text-muted">
                          Issued: {new Date(c.issueDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        {c.isReturned ? (
                          <StatusBadge label="Returned" tone="success" variant="soft" />
                        ) : (
                          <StatusBadge label="Active Loan" tone="warning" variant="soft" />
                        )}
                        {c.fineAmount > 0 && (
                          <span className="ml-2 font-mono text-error font-bold text-xs">
                            PKR {c.fineAmount} Fine
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-right">
                        {!c.isReturned && (
                          <Button tone="secondary" size="sm" onClick={() => openReturn(c.copyBarcode)}>
                            Return Book
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Issue Modal */}
      <Modal open={issueModalOpen} onClose={() => setIssueModalOpen(false)} title="Issue Book to Student / Staff">
        <form onSubmit={handleIssueBook} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Book Copy Barcode *</label>
            <input
              type="text"
              required
              placeholder="e.g. CAT-ENG-0012-02"
              value={issueForm.copyBarcode}
              onChange={(e) => setIssueForm({ ...issueForm, copyBarcode: e.target.value })}
              className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Borrower Type</label>
              <select
                value={issueForm.borrowerType}
                onChange={(e) => setIssueForm({ ...issueForm, borrowerType: e.target.value })}
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
              >
                <option value="Student">Student (Max 2 Books)</option>
                <option value="Staff">Faculty / Staff (Max 5 Books)</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted mb-1">Roll No / Emp Code *</label>
              <input
                type="text"
                required
                placeholder="e.g. 1084"
                value={issueForm.borrowerIdentifier}
                onChange={(e) => setIssueForm({ ...issueForm, borrowerIdentifier: e.target.value })}
                className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary font-mono"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-muted mb-1">Borrower Full Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Muhammad Hamza Ali"
              value={issueForm.borrowerName}
              onChange={(e) => setIssueForm({ ...issueForm, borrowerName: e.target.value })}
              className="w-full rounded-lg border border-border bg-app px-3.5 py-2 text-sm text-ink outline-none focus:border-primary"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button tone="secondary" onClick={() => setIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button tone="primary" type="submit">
              Complete Checkout
            </Button>
          </div>
        </form>
      </Modal>

      {/* Return Modal */}
      <Modal open={returnModalOpen} onClose={() => setReturnModalOpen(false)} title="Confirm Book Return & Fine Audit">
        <div className="space-y-4">
          <p className="text-sm text-ink">
            Confirm check-in for copy <span className="font-mono font-bold text-primary">{selectedBarcode}</span>?
          </p>
          <div className="p-4 bg-app rounded-lg border border-border text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-muted">Return Policy:</span>
              <span className="font-semibold text-ink">14 Days Normal Borrowing</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted">Late Surcharge:</span>
              <span className="font-semibold text-ink">PKR 50 / overdue day (Capped at PKR 500)</span>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button tone="secondary" onClick={() => setReturnModalOpen(false)}>
              Cancel
            </Button>
            <Button tone="primary" onClick={handleReturnBook}>
              Confirm Return & Calculate Fine
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
