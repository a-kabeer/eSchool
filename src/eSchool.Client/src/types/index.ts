export type SemanticTone = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' | 'neutral';

export type ThemeMode = 'light' | 'dark';
export type ColorPreset = 'blue' | 'aqua' | 'purple' | 'green' | 'cyan' | 'orange';
export type LayoutWidth = 'full' | 'boxed';
export type CardElevation = 'shadow' | 'border';

export type UserRole = 'Admin' | 'Manager' | 'Viewer';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title: string;
  department: string;
  avatarInitials: string;
  location: string;
}

export interface NavChildItem {
  label: string;
  path: string;
}

export interface NavItem {
  id: string;
  label: string;
  path?: string;
  iconName: string;
  chip?: string;
  chipVariant?: 'outlined' | 'filled';
  disabled?: boolean;
  children?: NavChildItem[];
}

export interface NavSection {
  caption: string;
  items: NavItem[];
}

export type ProjectCategoryTab = 'saas' | 'mobile' | 'others';

export interface DashboardProject {
  id: string;
  name: string;
  iconKey: 'photoshop' | 'sketch' | 'vue' | 'figma' | 'react';
  iconBgClass: string;
  budget: string;
  budgetValue: number;
  teamCount: number;
  teamExtra: number;
  leader: string;
  sparkColor: string;
  sparkData: number[];
  category: ProjectCategoryTab;
  status: 'Active' | 'Review' | 'Completed';
}

export interface TransactionItem {
  id: string;
  title: string;
  timestamp: string;
  status: 'Approved' | 'Pending' | 'Declined';
  amount: string;
  bonus: string;
  amountTone: 'success' | 'error';
  iconKey: 'netflix' | 'upwork';
}

export interface EarningReportItem {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  tone: SemanticTone;
  iconKey: 'card' | 'wallet' | 'trend' | 'drops';
}

export type InvoiceStatus = 'Shipped' | 'Delivered' | 'Pending';

export interface InvoiceLineItem {
  id: string;
  itemName: string;
  unitPrice: number;
  quantity: number;
}

export interface InvoiceRecord {
  id: number;
  invoiceNumber: string;
  billFrom: string;
  billFromEmail: string;
  billFromAddress: string;
  billTo: string;
  billToEmail: string;
  billToAddress: string;
  orderDate: string;
  dueDate: string;
  status: InvoiceStatus;
  items: InvoiceLineItem[];
  notes?: string;
}

export interface ContactRecord {
  id: string;
  name: string;
  role: string;
  department: 'Engineering' | 'Sales' | 'Design' | 'Finance' | 'Operations';
  company: string;
  email: string;
  phone: string;
  location: string;
  status: 'Active' | 'Away' | 'Offline';
  starred: boolean;
  initials: string;
  avatarTone: SemanticTone;
}

export type KanbanColumnId = 'backlog' | 'in_progress' | 'review' | 'done';

export interface KanbanTask {
  id: string;
  title: string;
  description: string;
  column: KanbanColumnId;
  priority: 'High' | 'Medium' | 'Low';
  category: string;
  dueDate: string;
  assignee: string;
  commentsCount: number;
}

export type TicketStatus = 'Open' | 'In Progress' | 'Closed';
export type TicketPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export interface TicketRecord {
  id: string;
  subject: string;
  requester: string;
  requesterEmail: string;
  assignee: string;
  priority: TicketPriority;
  status: TicketStatus;
  updatedAt: string;
  messages: { sender: string; time: string; body: string }[];
}

export interface RolePermissionMatrix {
  role: UserRole;
  description: string;
  permissions: {
    module: string;
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    export: boolean;
  }[];
}

// ==========================================
// eSchool Domain Types
// ==========================================

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
    admissionDate?: string;
  }>;
}

export interface EmployeeSalary {
  id: string;
  employeeCode: string;
  name: string;
  designation: string;
  department: string;
  cnic: string;
  bankAccountNumber: string;
  basicSalary: number;
  houseRentAllowance: number;
  medicalAllowance: number;
  conveyanceAllowance: number;
  grossSalary: number;
  eobiDeduction: number;
  incomeTaxDeduction: number;
  otherDeductions: number;
  totalDeductions: number;
  netSalary: number;
  status: 'PENDING' | 'DISBURSED';
}


