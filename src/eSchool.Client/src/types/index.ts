export interface Campus {
  id: string;
  name: string;
  code: string;
  address?: string;
  phoneNumber?: string;
}

export interface Student {
  id: string;
  registrationNumber: string;
  name: string;
  gender: string;
  dateOfBirth?: string;
  bloodGroup?: string;
  bFormOrCnic?: string;
  status: string;
  guardianName?: string;
  guardianPhone?: string;
}

export interface InvoiceItem {
  headName: string;
  amount: number;
}

export interface InvoicePayment {
  receiptNumber: string;
  paymentDate: string;
  amountPaid: number;
  paymentMethod: string;
}

export interface FeeInvoice {
  id: string;
  invoiceNumber: string;
  barcode: string;
  studentId: string;
  studentName: string;
  classSection: string;
  billingMonth: string;
  issueDate: string;
  dueDate: string;
  totalFee: number;
  arrears: number;
  concession: number;
  lateSurcharge: number;
  netPayable: number;
  paidAmount: number;
  balance: number;
  status: 'UNPAID' | 'PARTIAL' | 'PAID';
  items?: InvoiceItem[];
  payments?: InvoicePayment[];
}

export interface AccountHead {
  id: string;
  accountCode: string;
  accountName: string;
  accountType: 'Asset' | 'Liability' | 'Equity' | 'Income' | 'Expense';
  level: number;
  parentCode?: string;
  currentBalance: number;
}

export interface VoucherEntry {
  accountId: string;
  accountName?: string;
  debit: number;
  credit: number;
  narration?: string;
}

export interface Voucher {
  id: string;
  voucherNumber: string;
  voucherType: 'CPV' | 'CRV' | 'BPV' | 'BRV' | 'JV';
  voucherDate: string;
  totalAmount: number;
  narration: string;
  isPosted: boolean;
  entriesCount?: number;
}

export interface AttendanceStudent {
  id: string;
  registrationNumber: string;
  name: string;
  status: 'Present' | 'Absent' | 'Leave' | 'Late';
}

export interface DashboardStats {
  totalStudents: number;
  pendingFees: number;
  collectedThisMonth: number;
  totalVouchers: number;
  recentStudents: Array<{
    id: string;
    registrationNumber: string;
    name: string;
    gender: string;
    status: string;
    admissionDate: string;
  }>;
}
