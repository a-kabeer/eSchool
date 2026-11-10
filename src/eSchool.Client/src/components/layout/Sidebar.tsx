import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BadgeDollarSign,
  BarChart3,
  ChevronDown,
  CircleDot,
  Kanban,
  LayoutDashboard,
  LifeBuoy,
  LockKeyhole,
  Monitor,
  MoreHorizontal,
  PieChart,
  Receipt,
  ShieldCheck,
  SlidersHorizontal,
  Table2,
  UserCircle2,
  Users,
  X,
} from 'lucide-react';
import { SIDEBAR_NAVIGATION } from '@/data/navigation';
import { MaterialMLogo } from '@/components/icons/BrandIcons';
import { useTheme } from '@/context/ThemeContext';
import type { NavItem } from '@/types';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  BarChart3,
  Monitor,
  Receipt,
  Kanban,
  Users,
  LifeBuoy,
  PieChart,
  Table2,
  UserCircle2,
  SlidersHorizontal,
  ShieldCheck,
  BadgeDollarSign,
  LockKeyhole,
  CircleDot,
};

export interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const { pathname } = useLocation();
  const { sidebarCollapsed } = useTheme();
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    invoices: false,
    'auth-menu': false,
  });

  const toggleGroup = (id: string) => {
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const isItemActive = (item: NavItem) => {
    if (item.path) {
      if (item.path === '/dashboards/dashboard3' && pathname === '/') return true;
      return pathname === item.path || pathname.startsWith(`${item.path}/`);
    }
    return item.children?.some((c) => pathname === c.path || pathname.startsWith(`${c.path}/`)) ?? false;
  };

  const renderSidebarBody = (isCollapsed: boolean) => (
    <div className="flex h-full flex-col bg-surface">
      {/* Brand header */}
      <div
        className={`flex h-[70px] shrink-0 items-center ${
          isCollapsed ? 'justify-center px-2' : 'justify-between px-5'
        }`}
      >
        <Link
          to="/dashboards/dashboard3"
          onClick={onCloseMobile}
          className="flex items-center gap-2.5 focus-visible:outline-none"
        >
          <MaterialMLogo size={28} />
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="text-[19px] font-extrabold tracking-tight text-ink leading-tight">
                eSchool
              </span>
              <span className="text-[10px] font-semibold text-primary uppercase tracking-widest">
                Modern ERP
              </span>
            </div>
          )}
        </Link>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted hover:bg-subtle hover:text-ink lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Scrollable menu list */}
      <nav
        aria-label="Main navigation"
        className={`flex-1 overflow-y-auto pb-6 mm-scrollbar ${isCollapsed ? 'px-2.5' : 'px-4'}`}
      >
        {SIDEBAR_NAVIGATION.map((section, sIdx) => (
          <div
            key={section.caption}
            className={sIdx > 0 ? 'mt-3 border-t border-dashed border-border pt-3' : 'mt-1'}
          >
            {isCollapsed ? (
              <div className="mb-2 flex justify-center py-1 text-muted">
                <MoreHorizontal className="h-4 w-4" />
              </div>
            ) : (
              <div className="mb-2 px-3 pt-1 text-xs font-bold tracking-wide text-ink">
                {section.caption}
              </div>
            )}

            <ul className="space-y-1">
              {section.items.map((item) => {
                const Icon = ICON_MAP[item.iconName] ?? Monitor;
                const active = isItemActive(item);
                const hasChildren = Boolean(item.children && item.children.length > 0);
                const isExpanded = Boolean(expandedGroups[item.id]);

                if (hasChildren && !isCollapsed) {
                  return (
                    <li key={item.id}>
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.id)}
                        aria-expanded={isExpanded}
                        className={`flex h-[45px] w-full items-center justify-between rounded-full px-4 text-sm font-medium transition-colors ${
                          active
                            ? 'bg-light-primary text-primary font-semibold'
                            : 'text-ink/80 hover:bg-light-primary/50 hover:text-primary'
                        }`}
                      >
                        <span className="flex items-center gap-3 min-w-0">
                          <Icon className="h-[18px] w-[18px] shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </span>
                        <span className="flex items-center gap-1.5 shrink-0">
                          {item.chip && (
                            <span
                              className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                                item.chipVariant === 'filled'
                                  ? 'bg-primary text-white'
                                  : 'border border-primary text-primary'
                              }`}
                            >
                              {item.chip}
                            </span>
                          )}
                          <ChevronDown
                            className={`h-4 w-4 transition-transform duration-200 ${
                              isExpanded ? 'rotate-180' : ''
                            }`}
                          />
                        </span>
                      </button>

                      {isExpanded && item.children && (
                        <ul className="mt-1 space-y-1 pl-4">
                          {item.children.map((child) => {
                            const childActive = pathname === child.path;
                            return (
                              <li key={child.path}>
                                <Link
                                  to={child.path}
                                  onClick={onCloseMobile}
                                  className={`flex h-10 items-center gap-2.5 rounded-full px-3.5 text-[13px] transition-colors ${
                                    childActive
                                      ? 'bg-light-primary font-semibold text-primary'
                                      : 'text-muted hover:bg-subtle hover:text-primary'
                                  }`}
                                >
                                  <CircleDot className="h-3.5 w-3.5 shrink-0 opacity-75" />
                                  <span className="truncate">{child.label}</span>
                                </Link>
                              </li>
                            );
                          })}
                        </ul>
                      )}
                    </li>
                  );
                }

                const targetPath = item.path ?? item.children?.[0]?.path ?? '/dashboards/dashboard3';
                return (
                  <li key={item.id}>
                    <Link
                      to={targetPath}
                      onClick={onCloseMobile}
                      title={isCollapsed ? item.label : undefined}
                      className={`flex h-[45px] items-center rounded-full text-sm font-medium transition-colors ${
                        isCollapsed ? 'justify-center px-0' : 'justify-between px-4'
                      } ${
                        active
                          ? 'bg-light-primary text-primary font-semibold'
                          : 'text-ink/80 hover:bg-light-primary/50 hover:text-primary'
                      }`}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <Icon className="h-[18px] w-[18px] shrink-0" />
                        {!isCollapsed && <span className="truncate">{item.label}</span>}
                      </span>
                      {!isCollapsed && item.chip && (
                        <span
                          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${
                            item.chipVariant === 'filled'
                              ? 'bg-primary text-white'
                              : 'border border-primary text-primary'
                          }`}
                        >
                          {item.chip}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop fixed/sticky sidebar */}
      <aside
        className={`hidden shrink-0 transition-[width] duration-300 lg:block ${
          sidebarCollapsed ? 'w-[80px]' : 'w-[265px]'
        }`}
      >
        <div
          className={`fixed left-0 top-0 z-30 h-screen transition-[width] duration-300 ${
            sidebarCollapsed ? 'w-[80px]' : 'w-[265px]'
          }`}
        >
          {renderSidebarBody(sidebarCollapsed)}
        </div>
      </aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-50 flex lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
        >
          <div
            className="fixed inset-0 bg-[#111c2d]/45 backdrop-blur-[1px]"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full w-[265px] shadow-[var(--mm-shadow-drawer)]">
            {renderSidebarBody(false)}
          </div>
        </div>
      )}
    </>
  );
}
