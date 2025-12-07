import React, { useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { supabase } from "./integrations/supabase/client";

// Import components and pages
import { ChatInterface } from "./components/ChatInterface";
import { DatabaseExplorer } from "./pages/Database";
import { UserList } from "./pages/UserList";
import { Sidebar } from "./components/layout/Sidebar";

const App = () => {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [currentView, setCurrentView] = useState<'chat' | 'users' | 'database'>('chat');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setCurrentUser(session?.user ?? null));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setCurrentUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  return (
    <div className="flex h-[100dvh] w-screen overflow-hidden bg-gradient-to-br from-[#3B2CC9] to-[#6A30D9]">
      
      {/* Mobile Menu Button */}
      <div className="md:hidden absolute top-4 left-4 z-40">
        <button 
          onClick={() => setIsMobileMenuOpen(true)} 
          className="p-2.5 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl shadow-lg text-white active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
      </div>

      <Sidebar 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen}
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentUser={currentUser}
      />

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 bg-[#F3F4F7] md:rounded-l-[2.5rem] shadow-2xl overflow-hidden relative z-10">
        <div className="h-full w-full overflow-hidden relative">
          {currentView === 'chat' && <ChatInterface currentUser={currentUser} />}
          {currentView === 'database' && <DatabaseExplorer />}
          {currentView === 'users' && <UserList />}
        </div>
      </main>
    </div>
  );
};

const root = createRoot(document.getElementById("root")!);
root.render(<App />);