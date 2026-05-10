import React from 'react';
import { HiMenu, HiSearch } from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-dark-950/80 backdrop-blur-lg border-b border-dark-800">
      <div className="flex items-center justify-between px-6 py-4">
        <button
          onClick={onMenuClick}
          className="md:hidden p-2 hover:bg-dark-800 rounded-lg transition-colors"
        >
          <HiMenu className="w-6 h-6 text-dark-300" />
        </button>

        <div className="hidden sm:flex items-center flex-1 max-w-md ml-4">
          <div className="relative w-full">
            <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
            <input
              type="text"
              placeholder="Search documents..."
              className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-700 rounded-xl
                         text-dark-200 placeholder-dark-400 text-sm
                         focus:outline-none focus:border-primary-500/50 focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-dark-700">
            <div className="w-8 h-8 bg-primary-600/20 rounded-full flex items-center justify-center">
              <span className="text-primary-400 text-sm font-semibold">
                {user?.username?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-dark-200">{user?.username || 'User'}</p>
              <p className="text-xs text-dark-400">{user?.email || ''}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
