import React, { useState } from 'react';
import { Bell, CreditCard, Lock, User } from 'lucide-react';
import { PageHeader } from '@/components/layout';
import { Button, Card, FormInput, SelectInput, StatusBadge } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

type SettingsTab = 'account' | 'notifications' | 'bills' | 'security';

export function AccountSettingsPage() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [tab, setTab] = useState<SettingsTab>('account');

  // Personal details
  const [name, setName] = useState(user.name);
  const [storeName, setStoreName] = useState('Maxima Studio');
  const [location, setLocation] = useState('United States');
  const [currency, setCurrency] = useState('USD ($)');
  const [email, setEmail] = useState(user.email);
  const [phone, setPhone] = useState('+1 (415) 890-1200');
  const [address, setAddress] = useState('214 Market Street, Suite 400, San Francisco');

  // Password form
  const [currentPassword, setCurrentPassword] = useState('********');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  // Notification toggles
  const [notifState, setNotifState] = useState({
    orderUpdates: true,
    weeklyDigest: true,
    securityAlerts: true,
    productReleases: false,
  });

  const handleSaveDetails = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({ name: name.trim() || user.name, email: email.trim() || user.email, location });
    showToast('Personal details saved', 'success');
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    setPasswordError('');
    setNewPassword('');
    setConfirmPassword('');
    showToast('Password updated securely', 'success');
  };

  const tabs: { id: SettingsTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'bills', label: 'Bills', icon: CreditCard },
    { id: 'security', label: 'Security', icon: Lock },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Account Setting"
        breadcrumbs={[
          { label: 'Dashboard', path: '/dashboards/dashboard3' },
          { label: 'Account Setting' },
        ]}
      />

      {/* MaterialM Horizontal Icon Tab Strip matching ref_account.png */}
      <div className="flex flex-wrap border-b border-border">
        {tabs.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`inline-flex items-center gap-2 border-b-2 px-5 py-3 text-sm font-medium transition-colors ${
                active
                  ? 'border-primary text-primary font-semibold'
                  : 'border-transparent text-muted hover:text-ink'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>

      {tab === 'account' && (
        <div className="grid grid-cols-12 gap-6">
          {/* Change Profile */}
          <div className="col-span-12 lg:col-span-6">
            <Card className="h-full">
              <h2 className="text-lg font-semibold text-ink">Change Profile</h2>
              <p className="mt-1 text-sm text-muted">Change your profile picture from here</p>

              <div className="my-7 flex flex-col items-center">
                <span className="inline-flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#00a1ff] to-[#00ceb6] text-3xl font-bold text-white shadow-md">
                  {user.avatarInitials}
                </span>

                <div className="mt-6 flex items-center gap-3">
                  <Button
                    onClick={() => showToast('Profile avatar updated', 'success')}
                  >
                    Upload
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => showToast('Avatar reset to initials', 'info')}
                  >
                    Reset
                  </Button>
                </div>

                <p className="mt-5 text-xs text-muted">
                  Allowed JPG, GIF or PNG. Max size of 800K
                </p>
              </div>
            </Card>
          </div>

          {/* Change Password */}
          <div className="col-span-12 lg:col-span-6">
            <Card className="h-full">
              <h2 className="text-lg font-semibold text-ink">Change Password</h2>
              <p className="mt-1 text-sm text-muted">
                To change your password please confirm here
              </p>

              <form onSubmit={handlePasswordSubmit} className="mt-5 space-y-4">
                <FormInput
                  label="Current Password"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <FormInput
                  label="New Password"
                  type="password"
                  placeholder="Minimum 8 characters"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <FormInput
                  label="Confirm Password"
                  type="password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  error={passwordError}
                />
                <div className="flex justify-end pt-1">
                  <Button type="submit">Update Password</Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Personal Details */}
          <div className="col-span-12">
            <Card>
              <h2 className="text-lg font-semibold text-ink">Personal Details</h2>
              <p className="mt-1 text-sm text-muted">
                To change your personal detail, edit and save from here
              </p>

              <form onSubmit={handleSaveDetails} className="mt-6 space-y-5">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <FormInput
                    label="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  <FormInput
                    label="Store Name"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                  />
                  <SelectInput
                    label="Location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    options={[
                      { label: 'United States', value: 'United States' },
                      { label: 'United Kingdom', value: 'United Kingdom' },
                      { label: 'Germany', value: 'Germany' },
                      { label: 'India', value: 'India' },
                    ]}
                  />
                  <SelectInput
                    label="Currency"
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    options={[
                      { label: 'USD ($)', value: 'USD ($)' },
                      { label: 'EUR (€)', value: 'EUR (€)' },
                      { label: 'GBP (£)', value: 'GBP (£)' },
                      { label: 'INR (₹)', value: 'INR (₹)' },
                    ]}
                  />
                  <FormInput
                    label="Email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <FormInput
                    label="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
                <FormInput
                  label="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />

                <div className="flex justify-end gap-3">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setName(user.name);
                      setEmail(user.email);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">Save</Button>
                </div>
              </form>
            </Card>
          </div>
        </div>
      )}

      {tab === 'notifications' && (
        <Card>
          <h2 className="text-lg font-semibold text-ink">Notification Preferences</h2>
          <p className="mt-1 text-sm text-muted">Choose how MaterialM notifies you about events</p>

          <div className="mt-6 divide-y divide-border">
            {[
              {
                key: 'orderUpdates' as const,
                title: 'Order & Settlement Updates',
                desc: 'Get real-time alerts when payouts clear or invoices change status.',
              },
              {
                key: 'weeklyDigest' as const,
                title: 'Weekly Revenue Summary',
                desc: 'Receive an executive digest every Monday morning.',
              },
              {
                key: 'securityAlerts' as const,
                title: 'Security & Login Alerts',
                desc: 'Alert immediately when a new device signs into your workspace.',
              },
              {
                key: 'productReleases' as const,
                title: 'Product Changelog',
                desc: 'Hear about new widgets, chart types, and API upgrades.',
              },
            ].map((item) => (
              <div key={item.key} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <p className="text-sm font-semibold text-ink">{item.title}</p>
                  <p className="text-xs text-muted">{item.desc}</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={notifState[item.key]}
                  aria-label={item.title}
                  onClick={() => {
                    setNotifState((p) => ({ ...p, [item.key]: !p[item.key] }));
                    showToast(`${item.title} updated`, 'info');
                  }}
                  className={`relative inline-flex h-7 w-12 shrink-0 items-center rounded-full transition-colors ${
                    notifState[item.key] ? 'bg-primary' : 'bg-border'
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                      notifState[item.key] ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {tab === 'bills' && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-ink">Current Plan</h2>
              <StatusBadge label="Enterprise Pro" tone="primary" variant="solid" />
            </div>
            <p className="mt-3 text-3xl font-bold text-ink">
              $79 <span className="text-sm font-medium text-muted">/ month</span>
            </p>
            <p className="mt-1 text-xs text-muted">Renews automatically on December 01, 2026</p>
            <div className="mt-5 flex gap-3">
              <Button onClick={() => showToast('Plan upgrade preview opened', 'info')}>
                Change Plan
              </Button>
            </div>
          </Card>

          <Card>
            <h2 className="text-lg font-semibold text-ink">Saved Payment Method</h2>
            <div className="mt-4 flex items-center justify-between rounded-2xl bg-subtle p-4">
              <div>
                <p className="text-sm font-bold text-ink">Visa ending in 8942</p>
                <p className="text-xs text-muted">Expires 09 / 2028 · Default Card</p>
              </div>
              <StatusBadge label="Active" tone="success" />
            </div>
          </Card>
        </div>
      )}

      {tab === 'security' && (
        <Card>
          <h2 className="text-lg font-semibold text-ink">Two-Factor Authentication & Sessions</h2>
          <p className="mt-1 text-sm text-muted">
            Protect your MaterialM account with hardware keys or authenticator apps
          </p>
          <div className="mt-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-subtle p-4">
              <div>
                <p className="text-sm font-semibold text-ink">Authenticator App (TOTP)</p>
                <p className="text-xs text-muted">Configured on iPhone 16 Pro · Verified</p>
              </div>
              <StatusBadge label="Enabled" tone="success" variant="solid" />
            </div>
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-subtle p-4">
              <div>
                <p className="text-sm font-semibold text-ink">Current Desktop Session</p>
                <p className="text-xs text-muted">San Francisco, CA · Chrome on Windows</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => showToast('Other sessions signed out', 'success')}
              >
                Revoke Other Sessions
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
