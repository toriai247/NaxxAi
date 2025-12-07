import React from "react";
import { supabase } from "../../integrations/supabase/client";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentUser: any;
  onLoginClick: () => void;
}

const NavButton = ({ label, icon, active, onClick }: any) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-4 w-full p-4 rounded-2xl transition-all duration-300 group active:scale-95 ${
      active
        ? 'bg-white text-[#3B2CC9] shadow-lg shadow-indigo-900/10 font-semibold' 
        : 'text-white/70 hover:bg-white/10 hover:text-white'
    }`}
  >
    <div className={`p-2 rounded-xl transition-colors ${active ? 'bg-[#3B2CC9]/10' : 'bg-transparent group-hover:bg-white/10'}`}>
      {icon}
    </div>
    <span className="text-sm tracking-wide">{label}</span>
  </button>
);

export const Sidebar = ({ isOpen, setIsOpen, currentUser, onLoginClick }: SidebarProps) => {
  return (
    <div className={`
      fixed inset-0 z-50 transform transition-transform duration-300 ease-in-out md:relative md:inset-auto md:transform-none md:flex md:w-80
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
    `}>
      {/* Mobile Overlay Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm md:hidden transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar Content */}
      <aside className="absolute inset-y-0 left-0 w-72 md:w-full glass-panel border-r-0 border-y-0 border-l-0 md:bg-transparent md:border-none flex flex-col h-full z-50 shadow-2xl md:shadow-none">
        <div className="p-8 pb-4">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-lg shadow-indigo-900/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#3B2CC9]">
                  <path fillRule="evenodd" d="M9.315 2.004a.75.75 0 01.321.969 6.75 6.75 0 1010.334 8.78.75.75 0 011.216.793A8.25 8.25 0 118.347 2.325a.75.75 0 01.968-.321z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <h1 className="font-bold text-white text-lg tracking-tight leading-none">NaxAi Pro</h1>
                <span className="text-[10px] text-indigo-200 uppercase tracking-widest opacity-80">User Assistant</span>
              </div>
            </div>
            {/* Close Button Mobile */}
            <button onClick={() => setIsOpen(false)} className="md:hidden text-white/70 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="h-px bg-gradient-to-r from-transparent via-white/20 to-transparent mb-2"></div>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          <NavButton 
            active={true}
            label="Assistant" 
            onClick={() => setIsOpen(false)}
            icon={<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 9.75a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H8.25m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0H12m4.125 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 0 1-2.555-.337A5.972 5.972 0 0 1 5.41 20.97a5.969 5.969 0 0 1-.474-.065 4.48 4.48 0 0 0 .978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25Z" /></svg>} 
          />
        </nav>

        <div className="p-6">
          {currentUser ? (
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-inner">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-400 to-indigo-600 flex items-center justify-center text-white text-sm font-bold shadow-lg ring-2 ring-white/20">
                  {currentUser.email?.charAt(0).toUpperCase()}
                </div>
                <div className="overflow-hidden">
                  <div className="text-[10px] text-indigo-200 uppercase font-bold tracking-wide">Logged in</div>
                  <div className="text-xs text-white font-medium truncate">{currentUser.email}</div>
                </div>
              </div>
              <button onClick={() => supabase.auth.signOut()} className="w-full text-xs bg-red-500/20 hover:bg-red-500/30 text-red-100 py-2.5 rounded-xl transition-colors font-semibold border border-red-500/20">
                Sign Out
              </button>
            </div>
          ) : (
            <button 
              onClick={onLoginClick}
              className="w-full bg-white/10 hover:bg-white/20 text-white font-semibold py-3.5 rounded-2xl transition-all border border-white/20 hover:border-white/40 flex items-center justify-center gap-2 shadow-lg group active:scale-95"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15m3 0 3-3m0 0-3-3m3 3H9" /></svg>
              <span>Sign In</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};