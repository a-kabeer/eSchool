import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  BookOpen, 
  CalendarCheck, 
  Bell, 
  ShieldCheck, 
  School as SchoolIcon 
} from './components/Icons';

import { api } from './services/api';
import { signalRService } from './services/signalr';
import type { Campus } from './types';

import { DashboardView } from './components/DashboardView';
import { StudentsView } from './components/StudentsView';
import { FeeCounterView } from './components/FeeCounterView';
import { GeneralLedgerView } from './components/GeneralLedgerView';
import { AttendanceView } from './components/AttendanceView';

export default function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [campuses, setCampuses] = useState<Campus[]>([]);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('11111111-1111-1111-1111-111111111111');
  const [recentPaymentAlert, setRecentPaymentAlert] = useState<{ studentName: string; amountPaid: number; receiptNumber: string } | null>(null);
  const [signalRConnected, setSignalRConnected] = useState(false);

  useEffect(() => {
    api.getCampuses().then(data => {
      setCampuses(data);
      if (data.length > 0 && !selectedSchoolId) {
        setSelectedSchoolId(data[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedSchoolId) return;

    // Connect SignalR Hubs
    signalRService.connectCounter(selectedSchoolId, (data: unknown) => {
      const payment = data as { studentName: string; amountPaid: number; receiptNumber: string };
      setRecentPaymentAlert(payment);
      setSignalRConnected(true);
      // Auto-hide alert after 8s
      setTimeout(() => setRecentPaymentAlert(null), 8000);
    });

    signalRService.connectAttendance(selectedSchoolId, (_data: unknown) => {
      setSignalRConnected(true);
    });

    return () => {
      signalRService.disconnect();
    };
  }, [selectedSchoolId]);

  return (
    <div className="app-container">
      {/* Modern Sidebar Navigation */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo-badge">eS</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '16px', letterSpacing: '0.5px' }}>eSchool Cloud</div>
            <div style={{ fontSize: '11px', color: '#64748b' }}>Modular Monolith ERP</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', padding: '0 12px 8px' }}>
            Core Modules
          </div>

          <div
            className={`nav-item ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>

          <div
            className={`nav-item ${activeView === 'students' ? 'active' : ''}`}
            onClick={() => setActiveView('students')}
          >
            <Users size={18} />
            <span>Students (SIS)</span>
          </div>

          <div
            className={`nav-item ${activeView === 'fee-counter' ? 'active' : ''}`}
            onClick={() => setActiveView('fee-counter')}
          >
            <CreditCard size={18} />
            <span>Fee Counter (Barcode)</span>
          </div>

          <div
            className={`nav-item ${activeView === 'general-ledger' ? 'active' : ''}`}
            onClick={() => setActiveView('general-ledger')}
          >
            <BookOpen size={18} />
            <span>General Ledger (COA)</span>
          </div>

          <div
            className={`nav-item ${activeView === 'attendance' ? 'active' : ''}`}
            onClick={() => setActiveView('attendance')}
          >
            <CalendarCheck size={18} />
            <span>Daily Attendance</span>
          </div>

          <div style={{ fontSize: '11px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', padding: '16px 12px 8px' }}>
            System Architecture
          </div>

          <div style={{ padding: '12px', background: '#1e293b', borderRadius: '8px', margin: '0 4px', fontSize: '12px', color: '#94a3b8' }}>
            <div style={{ color: '#f8fafc', fontWeight: 600, marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <ShieldCheck size={14} color="#10b981" /> .NET + React Stack
            </div>
            <div>• ASP.NET Core API</div>
            <div>• PostgreSQL EF Core</div>
            <div>• SignalR Real-Time</div>
            <div>• Hosted Workers</div>
          </div>
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="main-content">
        {/* Top Header Bar */}
        <header className="topbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <SchoolIcon size={20} color="#4f46e5" />
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#64748b' }}>Active Campus:</span>
              <select
                className="campus-select"
                value={selectedSchoolId}
                onChange={e => setSelectedSchoolId(e.target.value)}
              >
                {campuses.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="user-profile">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: signalRConnected ? '#10b981' : '#64748b' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: signalRConnected ? '#10b981' : '#f59e0b' }} />
              {signalRConnected ? 'SignalR Online' : 'SignalR Ready'}
            </div>

            <div style={{ padding: '8px', borderRadius: '50%', background: '#f1f5f9', color: '#64748b', cursor: 'pointer' }}>
              <Bell size={18} />
            </div>

            <div className="avatar">SA</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: 600 }}>Super Administrator</div>
              <div style={{ fontSize: '11px', color: '#64748b' }}>demo@eschool.com.pk</div>
            </div>
          </div>
        </header>

        {/* View Routing */}
        <main style={{ flex: 1 }}>
          {activeView === 'dashboard' && (
            <DashboardView
              schoolId={selectedSchoolId}
              onNavigate={setActiveView}
              recentPaymentEvent={recentPaymentAlert}
            />
          )}

          {activeView === 'students' && (
            <StudentsView schoolId={selectedSchoolId} />
          )}

          {activeView === 'fee-counter' && (
            <FeeCounterView schoolId={selectedSchoolId} />
          )}

          {activeView === 'general-ledger' && (
            <GeneralLedgerView schoolId={selectedSchoolId} />
          )}

          {activeView === 'attendance' && (
            <AttendanceView schoolId={selectedSchoolId} />
          )}
        </main>
      </div>
    </div>
  );
}
