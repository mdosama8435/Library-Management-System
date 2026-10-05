import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  BookmarkPlus,
  LogOut,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/books',
      label: 'Books',
      icon: BookOpen,
    },
    {
      to: '/members',
      label: 'Members',
      icon: Users,
    },
    {
      to: '/issue-book',
      label: 'Issue Book',
      icon: BookmarkPlus,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/30 lg:hidden transition-opacity"
        />
      )}

      {/* Light Warm Gray Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-40 w-56 bg-[#F8FAFC] border-r border-[#E3E8EE] flex flex-col transition-transform duration-150 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-[#E3E8EE]/70">
          <div className="flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-md bg-[#1769AA]/10 text-[#1769AA] flex items-center justify-center">
              <BookOpen className="w-4 h-4 stroke-[2.2]" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-[#172033]">
                ShelfLife
              </span>
              <span className="block text-[10px] font-medium text-[#64748B] leading-none">
                Library System
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 lg:hidden"
            aria-label="Close menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center space-x-2.5 px-3 py-2 text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-[#EBF3FC] text-[#1769AA] font-semibold border-l-[3px] border-[#1769AA] rounded-r-md'
                      : 'text-slate-600 hover:text-[#172033] hover:bg-slate-200/40 rounded-md border-l-[3px] border-transparent'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-4 h-4 flex-shrink-0 ${
                        isActive ? 'text-[#1769AA]' : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom User Profile Section - Simple & Understated */}
        <div className="p-3 border-t border-[#E3E8EE]/80">
          <div className="px-2 py-1.5 flex items-center space-x-2.5">
            <div className="w-7 h-7 rounded-full bg-slate-200 text-slate-700 font-semibold text-xs flex items-center justify-center flex-shrink-0">
              L
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-semibold text-[#172033] leading-tight truncate">
                Librarian
              </div>
              <div className="text-[11px] text-[#64748B] truncate leading-tight mt-0.5">
                {user?.email || 'librarian@shelflife.edu'}
              </div>
            </div>
          </div>

          {/* Simple Logout text row */}
          <button
            onClick={logout}
            className="w-full flex items-center space-x-1.5 mt-2 px-2 py-1 text-xs text-slate-500 hover:text-rose-600 transition text-left"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
