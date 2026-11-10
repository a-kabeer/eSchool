import type { NavSection } from '@/types';

export const SIDEBAR_NAVIGATION: NavSection[] = [
  {
    caption: 'eSchool Academic Suite',
    items: [
      {
        id: 'academic-dashboard',
        label: 'School Dashboard',
        path: '/dashboards/dashboard3',
        iconName: 'LayoutDashboard',
        chip: 'Live',
        chipVariant: 'filled',
      },
      {
        id: 'sis-students',
        label: 'Student SIS & Admissions',
        path: '/sis/students',
        iconName: 'Users',
        chip: 'Wizard',
        chipVariant: 'outlined',
      },
      {
        id: 'fee-counter',
        label: 'Fee Counter & Scanner',
        path: '/billing/fee-counter',
        iconName: 'Receipt',
        chip: 'POS',
        chipVariant: 'filled',
      },
      {
        id: 'attendance',
        label: 'Daily Attendance',
        path: '/academic/attendance',
        iconName: 'CircleDot',
      },
      {
        id: 'examinations',
        label: 'Examinations & Grading',
        path: '/academic/examinations',
        iconName: 'Table2',
      },
      {
        id: 'general-ledger',
        label: 'General Ledger & COA',
        path: '/finance/general-ledger',
        iconName: 'BadgeDollarSign',
      },
      {
        id: 'invoices',
        label: 'Fee Challans',
        iconName: 'Receipt',
        children: [
          { label: 'Challan Register', path: '/apps/invoices' },
          { label: 'Challan #101 Detail', path: '/apps/invoices/101' },
        ],
      },
    ],
  },
  {
    caption: 'Dashboards & Reports',
    items: [
      {
        id: 'dashboard1',
        label: 'Executive Analytics',
        path: '/dashboards/dashboard1',
        iconName: 'BarChart3',
      },
      {
        id: 'dashboard2',
        label: 'Revenue & Trend Pulse',
        path: '/dashboards/dashboard2',
        iconName: 'PieChart',
      },
      {
        id: 'reports',
        label: 'Analytics & Reports',
        path: '/analytics/reports',
        iconName: 'Monitor',
      },
      {
        id: 'datatable',
        label: 'Master Data Tables',
        path: '/tables/data-table',
        iconName: 'Table2',
      },
    ],
  },
  {
    caption: 'Administration & System',
    items: [
      {
        id: 'permissions',
        label: 'Roles & Permissions',
        path: '/pages/permissions',
        iconName: 'ShieldCheck',
      },
      {
        id: 'account-setting',
        label: 'Campus Settings',
        path: '/pages/account-setting',
        iconName: 'SlidersHorizontal',
      },
      {
        id: 'profile',
        label: 'User Profile',
        path: '/pages/profile',
        iconName: 'UserCircle2',
      },
      {
        id: 'kanban',
        label: 'Academic Tasks',
        path: '/apps/kanban',
        iconName: 'Kanban',
      },
      {
        id: 'tickets',
        label: 'Parent Inquiries',
        path: '/apps/tickets',
        iconName: 'LifeBuoy',
      },
    ],
  },
  {
    caption: 'Auth & Access',
    items: [
      {
        id: 'auth-menu',
        label: 'Authentication',
        iconName: 'LockKeyhole',
        children: [
          { label: 'Sign In', path: '/auth/login' },
          { label: 'Create Account', path: '/auth/register' },
          { label: 'Forgot Password', path: '/auth/forgot-password' },
        ],
      },
    ],
  },
];
