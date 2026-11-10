import React, { useEffect, useState } from 'react';
import { Users, CreditCard, DollarSign, BookOpen, AlertCircle, ArrowUpRight } from './Icons';
import { api } from '../services/api';
import type { DashboardStats } from '../types';

interface Props {
  schoolId: string;
  onNavigate: (view: string) => void;
  recentPaymentEvent: { studentName: string; amountPaid: number; receiptNumber: string } | null;
}

export const DashboardView: React.FC<Props> = ({ schoolId, onNavigate, recentPaymentEvent }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.getDashboardStats(schoolId).then(data => {
      setStats(data);
      setLoading(false);
    });
  }, [schoolId]);

  if (loading || !stats) {
    return <div style={{ padding: '32px' }}>Loading dashboard metrics...</div>;
  }

  return (
    <div className="page-container">
      {/* Live SignalR Alert Banner */}
      {recentPaymentEvent && (
        <div style={{
          backgroundColor: '#ecfdf5',
          border: '1px solid #10b981',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#065f46'
        }}>
          <ArrowUpRight size={20} color="#10b981" />
          <div>
            <strong>[SignalR Real-Time Payment Alert]</strong> Receipt <strong>{recentPaymentEvent.receiptNumber}</strong> collected for <strong>{recentPaymentEvent.studentName}</strong> (PKR {recentPaymentEvent.amountPaid.toLocaleString()}).
          </div>
        </div>
      )}

      <div className="page-header">
        <div>
          <h1 className="page-title">Executive Dashboard</h1>
          <p className="page-subtitle">Real-time academic & financial overview across campuses</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="btn btn-primary" onClick={() => onNavigate('fee-counter')}>
            <CreditCard size={16} /> Open Fee Counter
          </button>
          <button className="btn btn-secondary" onClick={() => onNavigate('students')}>
            <Users size={16} /> New Admission
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>TOTAL ENROLLED STUDENTS</span>
            <Users size={18} color="#4f46e5" />
          </div>
          <div className="stat-value">{stats.totalStudents.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px' }}>↑ 4.2% from previous term</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>COLLECTED THIS MONTH</span>
            <DollarSign size={18} color="#10b981" />
          </div>
          <div className="stat-value">PKR {stats.collectedThisMonth.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Target: PKR 10,000,000</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>PENDING ARREARS & DUES</span>
            <AlertCircle size={18} color="#ef4444" />
          </div>
          <div className="stat-value" style={{ color: '#ef4444' }}>PKR {stats.pendingFees.toLocaleString()}</div>
          <div style={{ fontSize: '12px', color: '#64748b', marginTop: '6px' }}>Overdue &gt; 15 days</div>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>POSTED VOUCHERS (GL)</span>
            <BookOpen size={18} color="#f59e0b" />
          </div>
          <div className="stat-value">{stats.totalVouchers}</div>
          <div style={{ fontSize: '12px', color: '#10b981', marginTop: '6px' }}>100% Balanced Double-Entry</div>
        </div>
      </div>

      {/* Quick Access Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        <div className="table-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Core Modernized Workflows</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => onNavigate('fee-counter')}>
              <div>
                <strong style={{ fontSize: '14px' }}>Barcode Cashier Terminal</strong>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Scan Code-128 challan barcodes with thermal receipt printing</p>
              </div>
              <span className="badge badge-success">SignalR Active</span>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => onNavigate('general-ledger')}>
              <div>
                <strong style={{ fontSize: '14px' }}>Double-Entry General Ledger</strong>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Atomic CPV, CRV, JV posting enforcing Sum(Debit) == Sum(Credit)</p>
              </div>
              <span className="badge badge-info">4-Tier COA</span>
            </div>

            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }} onClick={() => onNavigate('attendance')}>
              <div>
                <strong style={{ fontSize: '14px' }}>Daily Attendance Register</strong>
                <p style={{ fontSize: '12px', color: '#64748b' }}>Instant roll call with automated WhatsApp/SMS absence alerts</p>
              </div>
              <span className="badge badge-warning">Hosted Worker</span>
            </div>
          </div>
        </div>

        <div className="table-card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 600, marginBottom: '16px' }}>Recent Student Admissions</h3>
          <table>
            <thead>
              <tr>
                <th>Reg No</th>
                <th>Student</th>
                <th>Gender</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentStudents.map(student => (
                <tr key={student.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{student.registrationNumber}</td>
                  <td>{student.name}</td>
                  <td>{student.gender}</td>
                  <td><span className="badge badge-success">{student.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
