import React, { useEffect, useState } from 'react';
import { UserCheck, MessageSquare, Check, X, Clock, AlertCircle } from './Icons';
import { api } from '../services/api';
import type { AttendanceStudent } from '../types';

interface Props {
  schoolId: string;
}

export const AttendanceView: React.FC<Props> = ({ schoolId }) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [students, setStudents] = useState<AttendanceStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getAttendanceRegister(schoolId, date).then(data => {
      setStudents(data);
      setLoading(false);
    });
  }, [schoolId, date]);

  const setStudentStatus = (id: string, status: 'Present' | 'Absent' | 'Leave' | 'Late') => {
    setStudents(prev => prev.map(s => s.id === id ? { ...s, status } : s));
  };

  const handleSaveAttendance = async () => {
    setSaving(true);
    setSaveMessage(null);
    try {
      await api.markAttendance({
        schoolId,
        date,
        items: students.map(s => ({
          studentId: s.id,
          studentName: s.name,
          status: s.status
        }))
      });

      const absentCount = students.filter(s => s.status === 'Absent').length;
      setSaveMessage(`Attendance recorded! ${absentCount} absence alerts queued to background WhatsApp/SMS dispatch workers.`);
    } catch {
      alert('Failed to save attendance');
    } finally {
      setSaving(false);
    }
  };

  const presentCount = students.filter(s => s.status === 'Present').length;
  const absentCount = students.filter(s => s.status === 'Absent').length;
  const leaveCount = students.filter(s => s.status === 'Leave').length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Daily Attendance Register & Alerts</h1>
          <p className="page-subtitle">Class roll-call with automated WhatsApp/SMS notifications for unexcused absences</p>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <input
            type="date"
            className="input-field"
            style={{ width: '160px', margin: 0 }}
            value={date}
            onChange={e => setDate(e.target.value)}
          />
          <button className="btn btn-primary" onClick={handleSaveAttendance} disabled={saving}>
            <UserCheck size={16} /> {saving ? 'Saving...' : 'Save & Dispatch Alerts'}
          </button>
        </div>
      </div>

      {saveMessage && (
        <div style={{ padding: '14px 18px', background: '#ecfdf5', border: '1px solid #10b981', borderRadius: '8px', color: '#065f46', marginBottom: '24px', display: 'flex', gap: '10px', alignItems: 'center' }}>
          <MessageSquare size={18} color="#10b981" />
          <span>{saveMessage}</span>
        </div>
      )}

      {/* Stats Summary Bar */}
      <div className="stats-grid" style={{ marginBottom: '24px' }}>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div className="stat-header">TOTAL CLASS STRENGTH</div>
          <div className="stat-value" style={{ fontSize: '24px' }}>{students.length}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div className="stat-header" style={{ color: '#10b981' }}>PRESENT</div>
          <div className="stat-value" style={{ fontSize: '24px', color: '#10b981' }}>{presentCount}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div className="stat-header" style={{ color: '#ef4444' }}>ABSENT (ALERTS QUEUED)</div>
          <div className="stat-value" style={{ fontSize: '24px', color: '#ef4444' }}>{absentCount}</div>
        </div>
        <div className="stat-card" style={{ padding: '16px 20px' }}>
          <div className="stat-header" style={{ color: '#f59e0b' }}>ON LEAVE</div>
          <div className="stat-value" style={{ fontSize: '24px', color: '#f59e0b' }}>{leaveCount}</div>
        </div>
      </div>

      {/* Attendance Register Table */}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Roll / Reg No</th>
              <th>Student Name</th>
              <th>Current Status</th>
              <th style={{ textAlign: 'center' }}>Mark Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} style={{ textAlign: 'center', padding: '32px' }}>Loading class register...</td></tr>
            ) : (
              students.map(s => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.registrationNumber}</td>
                  <td><strong>{s.name}</strong></td>
                  <td>
                    <span className={`badge ${
                      s.status === 'Present' ? 'badge-success' :
                      s.status === 'Absent' ? 'badge-danger' :
                      s.status === 'Leave' ? 'badge-warning' : 'badge-info'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', gap: '6px' }}>
                      <button
                        className="btn"
                        style={{
                          background: s.status === 'Present' ? '#10b981' : '#f1f5f9',
                          color: s.status === 'Present' ? '#fff' : '#475569',
                          padding: '6px 12px',
                          fontSize: '12px'
                        }}
                        onClick={() => setStudentStatus(s.id, 'Present')}
                      >
                        <Check size={14} /> Present
                      </button>
                      <button
                        className="btn"
                        style={{
                          background: s.status === 'Absent' ? '#ef4444' : '#f1f5f9',
                          color: s.status === 'Absent' ? '#fff' : '#475569',
                          padding: '6px 12px',
                          fontSize: '12px'
                        }}
                        onClick={() => setStudentStatus(s.id, 'Absent')}
                      >
                        <X size={14} /> Absent
                      </button>
                      <button
                        className="btn"
                        style={{
                          background: s.status === 'Leave' ? '#f59e0b' : '#f1f5f9',
                          color: s.status === 'Leave' ? '#fff' : '#475569',
                          padding: '6px 12px',
                          fontSize: '12px'
                        }}
                        onClick={() => setStudentStatus(s.id, 'Leave')}
                      >
                        <Clock size={14} /> Leave
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center', fontSize: '13px', color: '#64748b' }}>
        <AlertCircle size={16} />
        <span>Saving marks triggers the .NET <code>NotificationDispatchWorker</code> background service, delivering WhatsApp absence notifications to parents.</span>
      </div>
    </div>
  );
};
