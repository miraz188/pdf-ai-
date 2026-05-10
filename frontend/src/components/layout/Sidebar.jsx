import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  HiHome, HiDocumentText, HiLightBulb, HiAcademicCap,
  HiViewGrid, HiChatAlt2, HiLogout, HiChip
} from 'react-icons/hi';
import { useAuth } from '../../context/AuthContext';

const navItems = [
  { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
  { path: '/documents', icon: HiDocumentText, label: 'Documents' },
  { path: '/summaries', icon: HiLightBulb, label: 'Summaries' },
  { path: '/quizzes', icon: HiAcademicCap, label: 'Quizzes' },
  { path: '/flashcards', icon: HiViewGrid, label: 'Flashcards' },
  { path: '/chat', icon: HiChatAlt2, label: 'Chat' },
];

const Sidebar = () => {
  const location = useLocation();
  const { user, logout } = useAuth();

  return (
    <div className="hidden md:flex md:flex-col md:fixed md:inset-y-0 md:w-64 bg-dark-900 border-r border-dark-800">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-dark-800">
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center">
          <HiChip className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white">PDF AI</h1>
          <p className="text-xs text-dark-400">Smart Learning</p>
        </div>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname.startsWith(item.path);
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                ${isActive
                  ? 'bg-primary-600/20 text-primary-400 border border-primary-600/30'
                  : 'text-dark-400 hover:bg-dark-800 hover:text-dark-200'}`}
            >
              <item.icon className={`w-5 h-5 ${isActive ? 'text-primary-400' : ''}`} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="px-4 py-4 border-t border-dark-800">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-10 h-10 bg-primary-600/20 rounded-full flex items-center justify-center">
            <span className="text-primary-400 font-semibold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-dark-200 truncate">{user?.username || 'User'}</p>
            <p className="text-xs text-dark-400 truncate">{user?.email || ''}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-3 w-full px-4 py-2 text-sm text-dark-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
        >
          <HiLogout className="w-5 h-5" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
