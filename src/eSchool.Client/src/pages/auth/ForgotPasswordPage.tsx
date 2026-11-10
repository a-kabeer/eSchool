import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { MaterialMLogo } from '@/components/icons/BrandIcons';
import { Button, FormInput } from '@/components/ui';
import { useToast } from '@/context/ToastContext';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const { showToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSent(true);
    showToast('Password reset link sent', 'success');
  };

  return (
    <AuthLayout>
      <MaterialMLogo size={32} />
      <h2 className="mt-4 text-2xl font-bold text-ink">Forgot your password?</h2>
      <p className="mt-1 text-sm leading-relaxed text-muted">
        Please enter the email address associated with your account and we will email you a link to
        reset your password.
      </p>

      {sent ? (
        <div className="mt-6 rounded-2xl bg-light-success p-4 text-sm font-medium text-success">
          Reset instructions sent to <strong>{email}</strong>. Check your inbox.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <FormInput
            label="Email Address"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="jonathan.deo@materialm.io"
          />
          <Button type="submit" size="lg" className="w-full">
            Forgot Password
          </Button>
        </form>
      )}

      <Link to="/auth/login" className="mt-4 block">
        <Button variant="outline" size="lg" className="w-full">
          Back to Login
        </Button>
      </Link>
    </AuthLayout>
  );
}
