import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ThemeCustomizer } from './ThemeCustomizer';
import { CommandSearchModal } from './CommandSearchModal';
import { useTheme } from '@/context/ThemeContext';

export function AppLayout() {
  const { layoutWidth, toggleSidebarCollapsed } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  const handleToggleSidebar = () => {
    if (window.innerWidth < 1024) {
      setMobileOpen((prev) => !prev);
    } else {
      toggleSidebarCollapsed();
    }
  };

  return (
    <div className="flex min-h-screen bg-app text-ink">
      <Sidebar mobileOpen={mobileOpen} onCloseMobile={() => setMobileOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar
          onToggleSidebar={handleToggleSidebar}
          onOpenSearch={() => setSearchOpen(true)}
        />

        <main
          className={`flex-1 px-4 pb-8 pt-6 sm:px-5 ${
            layoutWidth === 'boxed' ? 'mx-auto w-full max-w-[1200px]' : 'w-full'
          }`}
        >
          <Outlet />
        </main>
      </div>

      <ThemeCustomizer />
      <CommandSearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
