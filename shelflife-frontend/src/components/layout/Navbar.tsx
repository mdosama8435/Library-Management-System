import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Menu, Search, Bell, ChevronDown, LogOut, User } from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState<boolean>(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const location = useLocation();

  // Dynamic context name
  const getContextName = () => {
    const path = location.pathname;
    if (path.startsWith('/books')) return 'Catalog & Inventory';
    if (path.startsWith('/dashboard')) return 'System Overview';
    if (path.startsWith('/issue-book')) return 'Circulation / Issue Loan';
    if (path.startsWith('/members/') && path.endsWith('/history')) return 'Member Borrowing Ledger';
    if (path.startsWith('/members')) return 'Member Directory';
    return 'Library Workspace';
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-[#E3E8EE]">
      <div className="flex items-center justify-between px-5 sm:px-8 py-2.5">
        
        {/* Left: Mobile Toggle & Subtle Breadcrumb */}
        <div className="flex items-center space-x-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1 rounded-md text-slate-500 hover:text-slate-700 hover:bg-slate-100 lg:hidden focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="hidden sm:flex items-center space-x-2 text-xs text-slate-500">
            <span>ShelfLife</span>
            <span className="text-slate-300">/</span>
            <span className="text-slate-800 font-medium">{getContextName()}</span>
          </div>
        </div>

        {/* Right: Search, Notification, Staff Profile */}
        <div className="flex items-center space-x-3">
          
          {/* Normal professional search input */}
          <div className="relative hidden md:block">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="pl-8 pr-3 py-1 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#1769AA] focus:bg-white w-44 transition"
            />
          </div>

          {/* Minimal notification button */}
          <button
            type="button"
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition"
            title="Notifications"
          >
            <Bell className="w-4 h-4" />
          </button>

          <div className="h-4 w-px bg-slate-200" />

          {/* Librarian Avatar & Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen((prev) => !prev)}
              className="flex items-center space-x-2 px-1.5 py-1 rounded-md hover:bg-slate-50 transition focus:outline-none"
            >
              <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-medium text-[11px] flex items-center justify-center">
                L
              </div>
              <span className="text-xs font-medium text-slate-700 hidden sm:inline">
                Librarian
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-1.5 w-48 bg-white rounded-lg shadow-sm border border-slate-200 py-1 z-50">
                <div className="px-3 py-2 border-b border-slate-100">
                  <div className="text-xs font-semibold text-slate-800">Staff Portal</div>
                  <div className="text-[11px] text-slate-500 truncate">
                    {user?.email || 'librarian@shelflife.edu'}
                  </div>
                </div>

                <div className="py-1">
                  <div className="px-3 py-1 text-[11px] text-slate-500 flex items-center space-x-1.5">
                    <User className="w-3 h-3 text-slate-400" />
                    <span>Role: {user?.role || 'Librarian'}</span>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-1">
                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center space-x-2 transition"
                  >
                    <LogOut className="w-3 h-3 text-rose-500" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </header>
  );
};

export default Navbar;
