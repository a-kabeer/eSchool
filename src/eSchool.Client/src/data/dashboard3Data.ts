import type { DashboardProject, EarningReportItem, TransactionItem } from '@/types';

export const OVERALL_BALANCE_ORDERS = [
  { month: 'Jan', current: 3500, previous: 3000 },
  { month: 'Feb', current: 2500, previous: 1500 },
  { month: 'Mar', current: 4000, previous: 3100 },
  { month: 'Apr', current: 2500, previous: 5000 },
  { month: 'May', current: 5500, previous: 3000 },
  { month: 'Jun', current: 3500, previous: 5500 },
  { month: 'July', current: 2500, previous: 3500 },
];

export const OVERALL_BALANCE_INCOME = [
  { month: 'Aug', thisYear: 25, lastYear: 50 },
  { month: 'Sep', thisYear: 13, lastYear: 35 },
  { month: 'Oct', thisYear: 20, lastYear: 30 },
  { month: 'Nov', thisYear: 40, lastYear: 20 },
  { month: 'Dec', thisYear: 45, lastYear: 20 },
  { month: 'Jan', thisYear: 50, lastYear: 30 },
  { month: 'Feb', thisYear: 70, lastYear: 35 },
  { month: 'Mar', thisYear: 30, lastYear: 40 },
];

export const OVERALL_BALANCE_STATS = [
  { id: 'sales', label: 'Total Sales', value: '$14,673', tone: 'warning' as const },
  { id: 'profit', label: 'Total Profit', value: '$9,281', tone: 'error' as const },
  { id: 'users', label: 'Total Users', value: '45.1k', tone: 'success' as const },
  { id: 'expense', label: 'Total Expense', value: '$4,673', tone: 'primary' as const },
];

export const ROI_MONTHS = [
  { month: 'JAN', value: 128, highlight: false },
  { month: 'FEB', value: 193, highlight: true },
  { month: 'MAR', value: 150, highlight: false },
  { month: 'APR', value: 120, highlight: false },
  { month: 'MAY', value: 174, highlight: false },
  { month: 'JUN', value: 150, highlight: false },
];

export const FOLLOWERS_SPARK = [
  { label: 'W1', active: 29, rest: 71 },
  { label: 'W2', active: 52, rest: 48 },
  { label: 'W3', active: 38, rest: 62 },
  { label: 'W4', active: 47, rest: 53 },
  { label: 'W5', active: 56, rest: 44 },
];

export const INCOME_SPARK = [
  { label: 'Mon', value: 25 },
  { label: 'Tue', value: 66 },
  { label: 'Wed', value: 20 },
  { label: 'Thu', value: 40 },
  { label: 'Fri', value: 12 },
  { label: 'Sat', value: 58 },
  { label: 'Sun', value: 20 },
];

export const CURRENT_BALANCE_DONUT = [
  { name: 'Current', value: 70, color: '#00ceb6' },
  { name: 'Reserve', value: 49, color: '#b2efe8' },
];

export const MARKETING_METRICS = [
  { id: 'm1', label: 'Search Volume', value: '+2.9k', icon: 'TrendingUp' as const },
  { id: 'm2', label: 'Return Ratio', value: '1.22', icon: 'PieChart' as const },
  { id: 'm3', label: 'Clicks / search', value: '0.83', icon: 'MousePointerClick' as const },
  { id: 'm4', label: 'Return Ratio', value: '41.2', icon: 'PieChart' as const },
];

export const MARKETING_GAUGE_SEGMENTS = [
  { name: 'Segment 1', value: 20, count: '245', color: '#ff6692' },
  { name: 'Segment 2', value: 20, count: '45', color: '#ffae1f' },
  { name: 'Segment 3', value: 20, count: '14', color: '#fff1cc' },
  { name: 'Segment 4', value: 20, count: '78', color: '#d2f9f4' },
  { name: 'Segment 5', value: 20, count: '95', color: '#00ceb6' },
];

export const PAYMENT_TRANSACTIONS: TransactionItem[] = [
  {
    id: 'tx-1',
    title: 'Netflix Subscription',
    timestamp: 'Today, 09:23am',
    status: 'Approved',
    amount: '- $4.58',
    bonus: '+5 Bonus',
    amountTone: 'error',
    iconKey: 'netflix',
  },
  {
    id: 'tx-2',
    title: 'Upwork',
    timestamp: 'August 15, 10:35pm',
    status: 'Pending',
    amount: '+ $15.60',
    bonus: '+30 Bonus',
    amountTone: 'success',
    iconKey: 'upwork',
  },
];

export const RECENT_PROJECTS_SAAS: DashboardProject[] = [
  {
    id: 'prj-1',
    name: 'Photoshop',
    iconKey: 'photoshop',
    iconBgClass: 'bg-[#e4f2ff]',
    budget: '$29,374.60',
    budgetValue: 29374.6,
    teamCount: 3,
    teamExtra: 3,
    leader: 'Erin',
    sparkColor: '#00ceb6',
    sparkData: [25, 66, 20, 40, 12, 58, 20],
    category: 'saas',
    status: 'Active',
  },
  {
    id: 'prj-2',
    name: 'Website SEO',
    iconKey: 'sketch',
    iconBgClass: 'bg-[#fff4de]',
    budget: '$1,843.73',
    budgetValue: 1843.73,
    teamCount: 3,
    teamExtra: 3,
    leader: 'Timothy',
    sparkColor: '#ff6692',
    sparkData: [22, 55, 25, 48, 18, 62, 24],
    category: 'saas',
    status: 'Review',
  },
  {
    id: 'prj-3',
    name: 'iOS Mobile App Design',
    iconKey: 'vue',
    iconBgClass: 'bg-[#e2f9f5]',
    budget: '$0.9989',
    budgetValue: 0.9989,
    teamCount: 3,
    teamExtra: 3,
    leader: 'Tyler',
    sparkColor: '#00ceb6',
    sparkData: [25, 66, 20, 40, 12, 58, 20],
    category: 'saas',
    status: 'Active',
  },
  {
    id: 'prj-4',
    name: 'Figma Components',
    iconKey: 'figma',
    iconBgClass: 'bg-[#ffe8ef]',
    budget: '$238.61',
    budgetValue: 238.61,
    teamCount: 3,
    teamExtra: 3,
    leader: 'Kristen',
    sparkColor: '#ffae1f',
    sparkData: [30, 50, 26, 42, 20, 54, 28],
    category: 'saas',
    status: 'Active',
  },
  {
    id: 'prj-5',
    name: 'Web App Design',
    iconKey: 'react',
    iconBgClass: 'bg-[#e3f4ff]',
    budget: '$0.629',
    budgetValue: 0.629,
    teamCount: 3,
    teamExtra: 3,
    leader: 'Isabelle',
    sparkColor: '#8965e5',
    sparkData: [20, 62, 28, 44, 15, 60, 24],
    category: 'saas',
    status: 'Completed',
  },
];

export const RECENT_PROJECTS_MOBILE: DashboardProject[] = [
  RECENT_PROJECTS_SAAS[1],
  RECENT_PROJECTS_SAAS[2],
  RECENT_PROJECTS_SAAS[4],
];

export const RECENT_PROJECTS_OTHERS: DashboardProject[] = [
  RECENT_PROJECTS_SAAS[2],
  RECENT_PROJECTS_SAAS[1],
];

export const DELIVERY_RADAR_DATA = [
  { month: 'Jan', sales: 32, visits: 25 },
  { month: 'Feb', sales: 27, visits: 35 },
  { month: 'Mar', sales: 27, visits: 20 },
  { month: 'Apr', sales: 30, visits: 20 },
  { month: 'May', sales: 25, visits: 20 },
  { month: 'Jun', sales: 25, visits: 20 },
];

export const DELIVERY_WEEKLY_BARS = [
  { day: 'Mon', thisYear: 9, lastYear: 6 },
  { day: 'Tue', thisYear: 5, lastYear: 3 },
  { day: 'Wed', thisYear: 3, lastYear: 9 },
  { day: 'Thu', thisYear: 7, lastYear: 5 },
  { day: 'Fri', thisYear: 5, lastYear: 4 },
  { day: 'Sat', thisYear: 10, lastYear: 6 },
  { day: 'Sun', thisYear: 3, lastYear: 4 },
];

export const EARNING_REPORTS_DATA: EarningReportItem[] = [
  {
    id: 'er-1',
    title: 'Bank Transfer',
    subtitle: 'and +1 more',
    badge: '16.3%',
    tone: 'primary',
    iconKey: 'card',
  },
  {
    id: 'er-2',
    title: 'Net Profit',
    subtitle: 'and +4 more',
    badge: '12.55%',
    tone: 'error',
    iconKey: 'wallet',
  },
  {
    id: 'er-3',
    title: 'Bank Transfer',
    subtitle: 'and +4 more',
    badge: '16.3%',
    tone: 'secondary',
    iconKey: 'trend',
  },
  {
    id: 'er-4',
    title: 'Total Expenses',
    subtitle: 'and +2 more',
    badge: '8.28%',
    tone: 'warning',
    iconKey: 'drops',
  },
];
