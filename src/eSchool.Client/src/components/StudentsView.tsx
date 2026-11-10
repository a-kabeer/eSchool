import React, { useEffect, useState } from 'react';
import { UserPlus, Search, CheckCircle, ArrowRight } from './Icons';
import { api } from '../services/api';
import type { Student } from '../types';

interface Props {
  schoolId: string;
}

export const StudentsView: React.FC<Props> = ({ schoolId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showWizard, setShowWizard] = useState(false);

  // 4-Step Wizard State
  const [step, setStep] = useState(1);
  const [wizardData, setWizardData] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '2012-04-10',
    gender: 'Male',
    bloodGroup: 'B+',
    bFormOrCnic: '',
    guardianName: '',
    guardianRelationship: 'Father',
    guardianPhone: '',
    guardianAddress: '',
    classLevel: 'Grade 8',
    section: 'Section A',
    feeCategory: 'Standard'
  });
  const [saving, setSaving] = useState(false);

  const loadStudents = () => {
    setLoading(true);
    api.getStudents(schoolId, search).then(res => {
      setStudents(res.items);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadStudents();
  }, [schoolId, search]);

  const handleSaveStudent = async () => {
    if (!wizardData.firstName || !wizardData.guardianName || !wizardData.guardianPhone) {
      alert('Please fill in student name and primary guardian details.');
      return;
    }

    setSaving(true);
    try {
      await api.createStudent({
        schoolId,
        firstName: wizardData.firstName,
        lastName: wizardData.lastName,
        dateOfBirth: wizardData.dateOfBirth,
        gender: wizardData.gender,
        bloodGroup: wizardData.bloodGroup,
        bFormOrCnic: wizardData.bFormOrCnic,
        guardianName: wizardData.guardianName,
        guardianRelationship: wizardData.guardianRelationship,
        guardianPhone: wizardData.guardianPhone,
        guardianAddress: wizardData.guardianAddress
      });

      alert('Student registered successfully!');
      setShowWizard(false);
      setStep(1);
      loadStudents();
    } catch {
      alert('Failed to register student');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1 className="page-title">Student Information System (SIS)</h1>
          <p className="page-subtitle">Student directory, demographics, academic enrollments & admission records</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowWizard(true)}>
          <UserPlus size={16} /> New Admission (4-Step Wizard)
        </button>
      </div>

      {/* Filter Bar */}
      <div className="table-card" style={{ padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search size={18} style={{ position: 'absolute', left: '12px', top: '10px', color: '#64748b' }} />
            <input
              type="text"
              className="input-field"
              style={{ paddingLeft: '38px', margin: 0 }}
              placeholder="Search by student name, registration number, or CNIC..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Student DataTable */}
      <div className="table-card">
        <table>
          <thead>
            <tr>
              <th>Reg No</th>
              <th>Student Name</th>
              <th>Gender</th>
              <th>Blood Group</th>
              <th>B-Form / CNIC</th>
              <th>Guardian Contact</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>Loading student records...</td></tr>
            ) : students.length === 0 ? (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: '32px' }}>No student records found.</td></tr>
            ) : (
              students.map(s => (
                <tr key={s.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{s.registrationNumber}</td>
                  <td><strong>{s.name}</strong></td>
                  <td>{s.gender}</td>
                  <td>{s.bloodGroup || '-'}</td>
                  <td style={{ fontFamily: 'monospace' }}>{s.bFormOrCnic || '-'}</td>
                  <td>
                    <div>{s.guardianName}</div>
                    <div style={{ fontSize: '12px', color: '#64748b' }}>{s.guardianPhone}</div>
                  </td>
                  <td><span className="badge badge-success">{s.status}</span></td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 4-Step Guided Admission Wizard Modal */}
      {showWizard && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div style={{ borderBottom: '1px solid #e2e8f0', paddingBottom: '16px', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '20px', fontWeight: 700 }}>New Student Admission Wizard</h2>
              <p style={{ fontSize: '13px', color: '#64748b' }}>Replaces the legacy 85-field accordion with a guided 4-step workflow</p>

              {/* Step indicator */}
              <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                {['Demographics', 'Guardian Info', 'Academic Placement', 'Fee Setup'].map((name, i) => (
                  <div
                    key={i}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: step === i + 1 ? '#4f46e5' : step > i + 1 ? '#d1fae5' : '#f1f5f9',
                      color: step === i + 1 ? '#fff' : step > i + 1 ? '#065f46' : '#64748b',
                      borderRadius: '6px',
                      fontSize: '12px',
                      fontWeight: 600,
                      textAlign: 'center'
                    }}
                  >
                    Step {i + 1}: {name}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Demographics */}
            {step === 1 && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">First Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Hamza"
                      value={wizardData.firstName}
                      onChange={e => setWizardData({ ...wizardData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Last Name *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="e.g. Tariq"
                      value={wizardData.lastName}
                      onChange={e => setWizardData({ ...wizardData, lastName: e.target.value })}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Date of Birth</label>
                    <input
                      type="date"
                      className="input-field"
                      value={wizardData.dateOfBirth}
                      onChange={e => setWizardData({ ...wizardData, dateOfBirth: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Gender</label>
                    <select
                      className="input-field"
                      value={wizardData.gender}
                      onChange={e => setWizardData({ ...wizardData, gender: e.target.value })}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Blood Group</label>
                    <select
                      className="input-field"
                      value={wizardData.bloodGroup}
                      onChange={e => setWizardData({ ...wizardData, bloodGroup: e.target.value })}
                    >
                      <option value="A+">A+</option>
                      <option value="B+">B+</option>
                      <option value="O+">O+</option>
                      <option value="AB+">AB+</option>
                      <option value="A-">A-</option>
                      <option value="B-">B-</option>
                      <option value="O-">O-</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Student B-Form / CNIC</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="35201-XXXXXXX-X"
                      value={wizardData.bFormOrCnic}
                      onChange={e => setWizardData({ ...wizardData, bFormOrCnic: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Guardian */}
            {step === 2 && (
              <div>
                <div className="form-group">
                  <label className="form-label">Father / Guardian Full Name *</label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="e.g. Tariq Mahmood"
                    value={wizardData.guardianName}
                    onChange={e => setWizardData({ ...wizardData, guardianName: e.target.value })}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Relationship</label>
                    <select
                      className="input-field"
                      value={wizardData.guardianRelationship}
                      onChange={e => setWizardData({ ...wizardData, guardianRelationship: e.target.value })}
                    >
                      <option value="Father">Father</option>
                      <option value="Mother">Mother</option>
                      <option value="Legal Guardian">Legal Guardian</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Guardian Mobile (for SMS Alerts) *</label>
                    <input
                      type="text"
                      className="input-field"
                      placeholder="+92-300-XXXXXXX"
                      value={wizardData.guardianPhone}
                      onChange={e => setWizardData({ ...wizardData, guardianPhone: e.target.value })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Residential Address</label>
                  <textarea
                    className="input-field"
                    rows={2}
                    placeholder="Full street address..."
                    value={wizardData.guardianAddress}
                    onChange={e => setWizardData({ ...wizardData, guardianAddress: e.target.value })}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Academic Placement */}
            {step === 3 && (
              <div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">Enrolled Class Level</label>
                    <select
                      className="input-field"
                      value={wizardData.classLevel}
                      onChange={e => setWizardData({ ...wizardData, classLevel: e.target.value })}
                    >
                      <option value="Grade 5">Grade 5</option>
                      <option value="Grade 6">Grade 6</option>
                      <option value="Grade 7">Grade 7</option>
                      <option value="Grade 8">Grade 8</option>
                      <option value="Grade 9">Grade 9</option>
                      <option value="Grade 10">Grade 10</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Section Allocation</label>
                    <select
                      className="input-field"
                      value={wizardData.section}
                      onChange={e => setWizardData({ ...wizardData, section: e.target.value })}
                    >
                      <option value="Section A">Section A (Morning)</option>
                      <option value="Section B">Section B (Morning)</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Session</label>
                  <input type="text" className="input-field" value="2024-2025 (Active)" disabled />
                </div>
              </div>
            )}

            {/* Step 4: Fee Setup */}
            {step === 4 && (
              <div>
                <div className="form-group">
                  <label className="form-label">Assigned Fee Category</label>
                  <select
                    className="input-field"
                    value={wizardData.feeCategory}
                    onChange={e => setWizardData({ ...wizardData, feeCategory: e.target.value })}
                  >
                    <option value="Standard">Standard Primary/Middle Wing (PKR 8,500/mo)</option>
                    <option value="Scholarship">Kinship / Sibling Concession (PKR 6,500/mo)</option>
                    <option value="Staff">Faculty / Staff Child (PKR 4,250/mo)</option>
                  </select>
                </div>
                <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '8px', fontSize: '13px' }}>
                  <strong>Summary of Heads:</strong>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
                    <span>Monthly Tuition Fee:</span> <span>PKR 7,500</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Computer & Lab Development Fund:</span> <span>PKR 1,000</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid #e2e8f0', marginTop: '8px', paddingTop: '6px', fontWeight: 700 }}>
                    <span>First Month Net Challan:</span> <span>PKR 8,500</span>
                  </div>
                </div>
              </div>
            )}

            {/* Modal Controls */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '24px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => (step > 1 ? setStep(step - 1) : setShowWizard(false))}
              >
                {step === 1 ? 'Cancel' : 'Back'}
              </button>

              {step < 4 ? (
                <button className="btn btn-primary" onClick={() => setStep(step + 1)}>
                  Next Step <ArrowRight size={16} />
                </button>
              ) : (
                <button className="btn btn-primary" onClick={handleSaveStudent} disabled={saving}>
                  <CheckCircle size={16} /> {saving ? 'Registering...' : 'Complete Admission'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
