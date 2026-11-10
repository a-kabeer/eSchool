import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from '@/context/ThemeContext';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';
import { AppDataProvider } from '@/context/AppDataContext';
import { CampusProvider } from '@/context/CampusContext';
import { AppLayout } from '@/components/layout';

import { Dashboard3Page } from '@/pages/dashboards/Dashboard3Page';
import { Dashboard1Page } from '@/pages/dashboards/Dashboard1Page';
import { Dashboard2Page } from '@/pages/dashboards/Dashboard2Page';

import { StudentsPage } from '@/pages/sis/StudentsPage';
import { FeeCounterPage } from '@/pages/billing/FeeCounterPage';
import { GeneralLedgerPage } from '@/pages/finance/GeneralLedgerPage';
import { DailyAttendancePage } from '@/pages/academic/DailyAttendancePage';
import { ExaminationsPage } from '@/pages/academic/ExaminationsPage';
import { PayrollPage } from '@/pages/hr/PayrollPage';

import { InvoicesPage } from '@/pages/apps/InvoicesPage';
import { InvoiceDetailPage } from '@/pages/apps/InvoiceDetailPage';
import { ContactsPage } from '@/pages/apps/ContactsPage';
import { KanbanPage } from '@/pages/apps/KanbanPage';
import { TicketsPage } from '@/pages/apps/TicketsPage';
import { ReportsAnalyticsPage } from '@/pages/analytics/ReportsAnalyticsPage';
import { DataTablePage } from '@/pages/analytics/DataTablePage';
import { UserProfilePage } from '@/pages/account/UserProfilePage';
import { AccountSettingsPage } from '@/pages/account/AccountSettingsPage';
import { PermissionsPage } from '@/pages/account/PermissionsPage';
import { PricingPage } from '@/pages/account/PricingPage';
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot-password" element={<ForgotPasswordPage />} />

      <Route element={<AppLayout />}>
        <Route path="/" element={<Navigate to="/dashboards/dashboard3" replace />} />
        <Route path="/dashboards/dashboard3" element={<Dashboard3Page />} />
        <Route path="/dashboards/dashboard1" element={<Dashboard1Page />} />
        <Route path="/dashboards/dashboard2" element={<Dashboard2Page />} />

        {/* eSchool Core Modules */}
        <Route path="/sis/students" element={<StudentsPage />} />
        <Route path="/billing/fee-counter" element={<FeeCounterPage />} />
        <Route path="/finance/general-ledger" element={<GeneralLedgerPage />} />
        <Route path="/academic/attendance" element={<DailyAttendancePage />} />
        <Route path="/academic/examinations" element={<ExaminationsPage />} />
        <Route path="/hr/payroll" element={<PayrollPage />} />

        {/* Challans & Apps */}
        <Route path="/apps/invoices" element={<InvoicesPage />} />
        <Route path="/apps/invoices/:id" element={<InvoiceDetailPage />} />
        <Route path="/apps/contacts" element={<ContactsPage />} />
        <Route path="/apps/kanban" element={<KanbanPage />} />
        <Route path="/apps/tickets" element={<TicketsPage />} />

        {/* Reports & System */}
        <Route path="/analytics/reports" element={<ReportsAnalyticsPage />} />
        <Route path="/tables/data-table" element={<DataTablePage />} />
        <Route path="/pages/profile" element={<UserProfilePage />} />
        <Route path="/pages/account-setting" element={<AccountSettingsPage />} />
        <Route path="/pages/permissions" element={<PermissionsPage />} />
        <Route path="/pages/pricing" element={<PricingPage />} />

        <Route path="*" element={<Navigate to="/dashboards/dashboard3" replace />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ToastProvider>
            <AppDataProvider>
              <CampusProvider>
                <AppRoutes />
              </CampusProvider>
            </AppDataProvider>
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
