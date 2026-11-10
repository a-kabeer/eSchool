import React from 'react';
import { Link } from 'react-router-dom';
import { AuthBrandBackdrop } from '@/components/icons/BrandIcons';
import { Button } from '@/components/ui';

export function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-12">
      {/* Left dark navy brand column matching ref_login.png */}
      <div className="relative hidden overflow-hidden bg-[#111c2d] p-12 text-white lg:col-span-6 lg:flex lg:flex-col lg:justify-center">
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-95">
          <AuthBrandBackdrop />
        </div>

        <div className="relative z-10 mx-auto max-w-md">
          <h1 className="text-4xl font-bold leading-tight text-white">
            Welcome to MaterialM
          </h1>
          <p className="mt-4 text-sm leading-relaxed text-white/75">
            MaterialM helps teams build organized, well-structured dashboards full of crisp
            analytics, workflow modules, and responsive components.
          </p>
          <div className="mt-6">
            <Link to="/dashboards/dashboard3">
              <Button size="md">Learn More</Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Right white form column */}
      <div className="flex items-center justify-center bg-surface px-6 py-12 lg:col-span-6">
        <div className="w-full max-w-[420px]">{children}</div>
      </div>
    </div>
  );
}
