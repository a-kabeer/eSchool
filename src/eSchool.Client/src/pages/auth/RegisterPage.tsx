import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from './AuthLayout';
import { MaterialMLogo } from '@/components/icons/BrandIcons';
import { Button, FormInput } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function RegisterPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!name.trim()) errs.name = 'Name is required';
    if (!email.includes('@')) errs.email = 'Valid email is required';
    if (password.length < 6) errs.password = 'Minimum 6 characters required';
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    login(email.trim(), name.trim());
    showToast('Account created successfully', 'success');
    navigate('/dashboards/dashboard3');
  };

  return (
    <AuthLayout>
      <MaterialMLogo size={32} />
      <h2 className="mt-4 text-2xl font-bold text-ink">Sign Up</h2>
      <p className="mt-1 text-sm text-muted">Create your MaterialM workspace</p>

      <form onSubmit={handleSubmit} className="mt-6 space-y-4">
        <FormInput
          label="Name"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Jonathan Deo"
          error={errors.name}
        />
        <FormInput
          label="Email Address"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@company.io"
          error={errors.email}
        />
        <FormInput
          label="Password"
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 6 characters"
          error={errors.password}
        />
        <Button type="submit" size="lg" className="mt-2 w-full">
          Create Account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink">
        Already have an account?{' '}
        <Link to="/auth/login" className="font-semibold text-primary hover:underline">
          Sign In
        </Link>
      </p>
    </AuthLayout>
  );
}
