import type { Campus, DashboardStats, FeeInvoice, AccountHead, Voucher, Student, AttendanceStudent } from '../types';

const API_BASE = 'http://localhost:5000/api';

// Seeded local fallback data in case backend server is spinning up
const FALLBACK_CAMPUSES: Campus[] = [
  { id: '11111111-1111-1111-1111-111111111111', name: 'Lahore Main Campus', code: 'LHE-MAIN', address: 'Plot 42-A, Gulberg III, Lahore' },
  { id: '22222222-2222-2222-2222-222222222222', name: 'Islamabad Campus', code: 'ISB-SECT', address: 'Sector F-8/2, Islamabad' },
  { id: '33333333-3333-3333-3333-333333333333', name: 'Karachi Campus', code: 'KHI-CLIF', address: 'Block 4, Clifton, Karachi' }
];

export const api = {
  async getCampuses(): Promise<Campus[]> {
    try {
      const res = await fetch(`${API_BASE}/campuses`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return FALLBACK_CAMPUSES;
  },

  async getDashboardStats(schoolId: string): Promise<DashboardStats> {
    try {
      const res = await fetch(`${API_BASE}/dashboard/stats?schoolId=${schoolId}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      totalStudents: 1480,
      pendingFees: 2450000,
      collectedThisMonth: 8950000,
      totalVouchers: 342,
      recentStudents: [
        { id: '1', registrationNumber: 'REG-2024-1084', name: 'Ali Khan', gender: 'Male', status: 'Active', admissionDate: '2024-11-01' },
        { id: '2', registrationNumber: 'REG-2024-1085', name: 'Fatima Zahra', gender: 'Female', status: 'Active', admissionDate: '2024-11-02' },
        { id: '3', registrationNumber: 'REG-2024-1086', name: 'Bilal Ahmad', gender: 'Male', status: 'Active', admissionDate: '2024-11-04' }
      ]
    };
  },

  async getStudents(schoolId: string, search?: string): Promise<{ items: Student[]; total: number }> {
    try {
      const url = new URL(`${API_BASE}/students`);
      url.searchParams.append('schoolId', schoolId);
      if (search) url.searchParams.append('search', search);
      const res = await fetch(url.toString());
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return {
      total: 2,
      items: [
        { id: '1', registrationNumber: 'REG-2024-1084', name: 'Ali Khan', gender: 'Male', dateOfBirth: '2011-05-14', bloodGroup: 'B+', bFormOrCnic: '35201-1234567-1', status: 'Active', guardianName: 'Tariq Mahmood Khan', guardianPhone: '+92-300-8451234' },
        { id: '2', registrationNumber: 'REG-2024-1085', name: 'Fatima Zahra', gender: 'Female', dateOfBirth: '2011-09-21', bloodGroup: 'O+', bFormOrCnic: '35202-7654321-2', status: 'Active', guardianName: 'Muhammad Zahid', guardianPhone: '+92-321-4567890' }
      ]
    };
  },

  async createStudent(payload: {
    schoolId: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    gender: string;
    bloodGroup?: string;
    bFormOrCnic?: string;
    guardianName: string;
    guardianRelationship: string;
    guardianPhone: string;
    guardianAddress: string;
  }): Promise<{ id: string; registrationNumber: string; name: string }> {
    const res = await fetch(`${API_BASE}/students`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to register student');
    return await res.json();
  },

  async getInvoiceByBarcode(barcode: string): Promise<FeeInvoice> {
    try {
      const res = await fetch(`${API_BASE}/billing/invoices/barcode/${encodeURIComponent(barcode)}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    // Return sample challan matching scanned barcode
    return {
      id: 'demo-inv-1',
      invoiceNumber: 'INV-202411-1084',
      barcode: barcode || '202411084',
      studentId: '1',
      studentName: 'Ali Khan',
      classSection: 'Grade 8 - Section A',
      billingMonth: '2024-11',
      issueDate: '2024-11-01',
      dueDate: '2024-11-15',
      totalFee: 8500,
      arrears: 0,
      concession: 0,
      lateSurcharge: 500,
      netPayable: 8500,
      paidAmount: 0,
      balance: 8500,
      status: 'UNPAID',
      items: [
        { headName: 'Tuition Fee (Nov 2024)', amount: 7500 },
        { headName: 'Computer & Lab Fund', amount: 1000 }
      ]
    };
  },

  async collectFeePayment(payload: {
    invoiceId: string;
    amountPaid: number;
    paymentMethod: string;
    receivedBy: string;
    referenceNumber?: string;
  }) {
    const res = await fetch(`${API_BASE}/billing/payments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to collect fee payment');
    return await res.json();
  },

  async getChartOfAccounts(schoolId: string): Promise<AccountHead[]> {
    try {
      const res = await fetch(`${API_BASE}/accounting/chart-of-accounts?schoolId=${schoolId}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return [
      { id: '1', accountCode: '3010001', accountName: 'Cash in Hand', accountType: 'Asset', level: 4, currentBalance: 150000 },
      { id: '2', accountCode: '3010002', accountName: 'Bank Al-Habib Main Operating', accountType: 'Asset', level: 4, currentBalance: 1850000 },
      { id: '3', accountCode: '3020001', accountName: 'Accounts Receivable - Students', accountType: 'Asset', level: 4, currentBalance: 450000 },
      { id: '4', accountCode: '4010001', accountName: 'Monthly Tuition Fees', accountType: 'Income', level: 4, currentBalance: 2400000 },
      { id: '5', accountCode: '5010001', accountName: 'Teaching Staff Salaries', accountType: 'Expense', level: 4, currentBalance: 1200000 },
      { id: '6', accountCode: '5020002', accountName: 'Generator Fuel & Maintenance', accountType: 'Expense', level: 4, currentBalance: 85000 }
    ];
  },

  async postVoucher(payload: {
    schoolId: string;
    voucherType: string;
    voucherDate: string;
    narration: string;
    chequeNumber?: string;
    entries: Array<{ accountId: string; debit: number; credit: number; narration?: string }>;
  }) {
    const res = await fetch(`${API_BASE}/accounting/vouchers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Failed to post voucher');
    }
    return await res.json();
  },

  async getAttendanceRegister(schoolId: string, date: string): Promise<AttendanceStudent[]> {
    try {
      const res = await fetch(`${API_BASE}/attendance/daily-register?schoolId=${schoolId}&date=${date}`);
      if (res.ok) return await res.json();
    } catch {
      // fallback
    }
    return [
      { id: '1', registrationNumber: 'REG-2024-1084', name: 'Ali Khan', status: 'Present' },
      { id: '2', registrationNumber: 'REG-2024-1085', name: 'Fatima Zahra', status: 'Present' },
      { id: '3', registrationNumber: 'REG-2024-1086', name: 'Bilal Ahmad', status: 'Present' },
      { id: '4', registrationNumber: 'REG-2024-1087', name: 'Zainab Bibi', status: 'Present' },
      { id: '5', registrationNumber: 'REG-2024-1088', name: 'Hamza Farooq', status: 'Present' }
    ];
  },

  async markAttendance(payload: {
    schoolId: string;
    date: string;
    items: Array<{ studentId: string; studentName: string; status: string; remarks?: string }>;
  }) {
    const res = await fetch(`${API_BASE}/attendance/mark-daily`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!res.ok) throw new Error('Failed to save attendance');
    return await res.json();
  }
};
