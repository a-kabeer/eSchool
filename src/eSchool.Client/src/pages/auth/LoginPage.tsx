import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from './AuthLayout';
import { MaterialMLogo } from '@/components/icons/BrandIcons';
import { Button, FormInput } from '@/components/ui';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';

export function LoginPage() {
  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [username, setUsername] = useState('jonathan.deo@materialm.io');
  const [password, setPassword] = useState('admin123');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || password.length < 4) {
      setError('Enter a valid username/email and password (at least 4 characters).');
      return;
    }
    setError('');
    login(username.trim());
    showToast('Signed in to MaterialM', 'success');
    navigate('/dashboards/dashboard3');
  };

  return (
    <AuthLayout>
      <MaterialMLogo size={32} />
      <h2 className="mt-4 text-2xl font-bold text-ink">Sign In</h2>
      <p className="mt-1 text-sm text-muted">Your Admin Dashboard</p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            login('jonathan.deo@materialm.io', 'Jonathan Deo');
            showToast('Signed in with Google', 'success');
            navigate('/dashboards/dashboard3');
          }}
          className="flex h-10 items-center justify-center gap-2 rounded-full border border-primary/50 text-xs font-semibold text-primary transition-colors hover:bg-light-primary"
        >
          Google
        </button>
        <button
          type="button"
          onClick={() => {
            login('jonathan.deo@materialm.io', 'Jonathan Deo');
            showToast('Signed in with Facebook', 'success');
            navigate('/dashboards/dashboard3');
          }}
          className="flex h-10 items-center justify-center gap-2 rounded-full border border-primary/50 text-xs font-semibold text-primary transition-colors hover:bg-light-primary"
        >
          Facebook
        </button>
      </div>

      <div className="my-6 flex items-center gap-3 text-xs text-muted">
        <span className="h-px flex-1 bg-border" />
        <span>or sign in with</span>
        <span className="h-px flex-1 bg-border" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <FormInput
          label="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />

        <div className="relative">
          <FormInput
            label="Password"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword((v) => !v)}
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            className="absolute right-3 top-[34px] text-muted hover:text-ink"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>

        {error && <p className="text-xs font-medium text-error">{error}</p>}

        <div className="flex items-center justify-between pt-1 text-xs">
          <label className="inline-flex cursor-pointer items-center gap-2 text-ink">
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
              className="h-4 w-4 rounded border-border accent-[var(--mm-primary)]"
            />
            <span>Remember this Device</span>
          </label>
          <Link to="/auth/forgot-password" className="font-semibold text-primary hover:underline">
            Forgot Password ?
          </Link>
        </div>

        <Button type="submit" size="lg" className="mt-2 w-full">
          Sign In
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink">
        New to MaterialM?{' '}
        <Link to="/auth/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthLayout>
  );
}
