import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Printer } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button, Card, EmptyState, StatusBadge } from '@/components/ui';
import { useAppData } from '@/context/AppDataContext';
import { useToast } from '@/context/ToastContext';

export function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { invoices } = useAppData();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const invoice = invoices.find((inv) => String(inv.id) === id);

  if (!invoice) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Invoice Not Found"
          breadcrumbs={[
            { label: 'Home', path: '/dashboards/dashboard3' },
            { label: 'Invoice', path: '/apps/invoices' },
            { label: 'Not Found' },
          ]}
        />
        <Card>
          <EmptyState
            title="Invoice could not be located"
            description="The requested invoice may have been deleted or does not exist."
            action={
              <Button onClick={() => navigate('/apps/invoices')}>Back to Invoices</Button>
            }
          />
        </Card>
      </div>
    );
  }

  const subtotal = invoice.items.reduce((s, item) => s + item.unitPrice * item.quantity, 0);
  const tax = subtotal * 0.1;
  const grandTotal = subtotal + tax;

  const tone =
    invoice.status === 'Delivered'
      ? 'success'
      : invoice.status === 'Shipped'
        ? 'secondary'
        : 'warning';

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Invoice #${invoice.id}`}
        breadcrumbs={[
          { label: 'Home', path: '/dashboards/dashboard3' },
          { label: 'Invoice', path: '/apps/invoices' },
          { label: invoice.invoiceNumber },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Link to="/apps/invoices">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
            </Link>
            <Button
              size="sm"
              onClick={() => {
                showToast('Preparing print preview...', 'info');
                window.print();
              }}
            >
              <Printer className="h-4 w-4" />
              Print Invoice
            </Button>
          </div>
        }
      />

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted">
              Invoice Number
            </p>
            <h2 className="mt-1 text-2xl font-bold text-ink">{invoice.invoiceNumber}</h2>
            <p className="mt-1 text-xs text-muted">
              Order Date: {invoice.orderDate} · Due Date: {invoice.dueDate}
            </p>
          </div>
          <StatusBadge label={invoice.status} tone={tone} variant="solid" size="sm" />
        </div>

        <div className="my-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl bg-subtle p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Bill From</p>
            <p className="mt-2 text-base font-semibold text-ink">{invoice.billFrom}</p>
            <p className="mt-1 text-sm text-muted">{invoice.billFromEmail}</p>
            <p className="mt-0.5 text-sm text-muted">{invoice.billFromAddress}</p>
          </div>
          <div className="rounded-2xl bg-subtle p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-muted">Bill To</p>
            <p className="mt-2 text-base font-semibold text-ink">{invoice.billTo}</p>
            <p className="mt-1 text-sm text-muted">{invoice.billToEmail}</p>
            <p className="mt-0.5 text-sm text-muted">{invoice.billToAddress}</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border text-xs font-semibold uppercase text-muted">
                <th className="py-3 pr-4">Item Name</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Units</th>
                <th className="py-3 pl-4 text-right">Line Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/75 text-sm">
              {invoice.items.map((item) => (
                <tr key={item.id}>
                  <td className="py-4 pr-4 font-medium text-ink">{item.itemName}</td>
                  <td className="py-4 px-4 text-right text-muted">
                    ${item.unitPrice.toFixed(2)}
                  </td>
                  <td className="py-4 px-4 text-right text-muted">{item.quantity}</td>
                  <td className="py-4 pl-4 text-right font-semibold text-ink">
                    ${(item.unitPrice * item.quantity).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-col items-end border-t border-border pt-6">
          <div className="w-full max-w-xs space-y-2 text-sm">
            <div className="flex justify-between text-muted">
              <span>Sub total</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-muted">
              <span>VAT (10%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold text-ink">
              <span>Grand Total</span>
              <span>${grandTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
