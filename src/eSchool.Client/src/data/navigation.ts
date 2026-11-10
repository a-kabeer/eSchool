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
        label: 'Student Directory & 360',
        path: '/sis/students',
        iconName: 'Users',
      },
      {
        id: 'sis-admissions',
        label: 'Admissions Funnel',
        path: '/sis/admissions',
        iconName: 'Sparkles',
        chip: 'Funnel',
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
        id: 'hr-payroll',
        label: 'HR & Payroll (FBR/EOBI)',
        path: '/hr/payroll',
        iconName: 'Banknote',
        chip: 'FBR',
        chipVariant: 'outlined',
      },
      {
        id: 'general-ledger',
        label: 'General Ledger & COA',
        path: '/finance/general-ledger',
        iconName: 'BadgeDollarSign',
      },
      {
        id: 'data-locks',
        label: '41 Period Data Locks',
        path: '/management/locks',
        iconName: 'LockKeyhole',
        chip: 'Freeze',
        chipVariant: 'outlined',
      },
      {
        id: 'library',
        label: 'Library & Circulation',
        path: '/operations/library',
        iconName: 'BookOpen',
        chip: 'Barcode',
        chipVariant: 'outlined',
      },
      {
        id: 'inventory',
        label: 'Serialized Asset Custody',
        path: '/operations/inventory',
        iconName: 'Package',
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
    caption: 'Portals & Mobile Hub',
    items: [
      {
        id: 'portal-parent',
        label: 'Parent Portal',
        path: '/portals/parent',
        iconName: 'Users',
        chip: 'Multi-Child',
        chipVariant: 'outlined',
      },
      {
        id: 'portal-teacher',
        label: 'Teacher Workstation',
        path: '/portals/teacher',
        iconName: 'GraduationCap',
        chip: 'Faculty',
        chipVariant: 'outlined',
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
        label: '152-Row RBAC Matrix',
        path: '/pages/permissions',
        iconName: 'ShieldCheck',
        chip: '152-Row',
        chipVariant: 'outlined',
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
