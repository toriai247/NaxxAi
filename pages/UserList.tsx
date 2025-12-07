import React, { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { Avatar } from "../components/ui/Avatar";

export const UserList = () => {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal State
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userWallet, setUserWallet] = useState<any>(null);
  const [walletLoading, setWalletLoading] = useState(false);
  const [walletError, setWalletError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const { data, error } = await supabase.from('profiles').select('*').limit(100);
        if (error) throw error;
        setUsers(data || []);
      } catch (e: any) {
        console.error("User Fetch Error:", e);
        setError(e.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleUserClick = async (user: any) => {
    setSelectedUser(user);
    setWalletLoading(true);
    setUserWallet(null);
    setWalletError(null);
    
    try {
      const { data, error } = await supabase.from('wallets').select('*').eq('user_id', user.id).single();
      if (error && error.code !== 'PGRST116') throw error; // PGRST116 is "no rows found", which is valid if user has no wallet
      setUserWallet(data);
    } catch (e: any) {
      console.error("Wallet Fetch Error:", e);
      setWalletError("Could not load wallet details.");
    } finally {
      setWalletLoading(false);
    }
  };

  const closeModal = () => {
    setSelectedUser(null);
    setUserWallet(null);
    setWalletError(null);
  };

  return (
    <div className="h-full bg-[#F3F4F7] p-4 md:p-8 overflow-y-auto relative pt-16 md:pt-8">
      <div className="mb-6">
         <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">User Directory</h2>
         <p className="text-slate-500 text-sm md:text-base">Manage registered users</p>
      </div>

      {error ? (
        <div className="flex flex-col items-center justify-center py-20 text-red-500 bg-white rounded-3xl border border-red-100 shadow-sm">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-3 opacity-50"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
           <p className="font-medium">Error loading users</p>
           <p className="text-sm opacity-75">{error}</p>
           <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-100 transition">Retry</button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 pb-20">
          {loading ? (
            <div className="col-span-1 md:col-span-3 flex justify-center py-20">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#3B2CC9]"></div>
            </div>
          ) : (
            users.map(user => (
              <div 
                key={user.id} 
                onClick={() => handleUserClick(user)}
                className="bg-white rounded-2xl p-4 md:p-5 shadow-sm hover:shadow-xl hover:shadow-indigo-500/10 transition-all cursor-pointer border border-slate-100 group relative overflow-hidden active:scale-98"
              >
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#3B2CC9]/5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:bg-[#3B2CC9]/10"></div>
                
                <div className="flex items-center gap-4 relative z-10">
                   <Avatar initials={user.email_1} size="lg" className="shrink-0" />
                   <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-slate-800 truncate group-hover:text-[#3B2CC9] transition text-sm md:text-base">{user.name_1 || "Unnamed User"}</h3>
                      <p className="text-xs md:text-sm text-slate-400 truncate">{user.email_1}</p>
                   </div>
                </div>
                
                <div className="mt-4 flex gap-2">
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}>
                      {user.role}
                    </span>
                    <span className={`text-[10px] px-2.5 py-1 rounded-full font-medium ${user.is_account_active ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                      {user.is_account_active ? 'Active' : 'Inactive'}
                    </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center animate-fade-in" onClick={closeModal}>
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          <div 
            className="bg-white rounded-t-[2rem] md:rounded-3xl w-full md:max-w-2xl max-h-[85vh] md:max-h-[90vh] overflow-y-auto shadow-2xl relative z-10 animate-slide-up flex flex-col" 
            onClick={e => e.stopPropagation()}
          >
            {/* Header with Gradient */}
            <div className="p-6 md:p-8 bg-gradient-to-r from-[#3B2CC9] to-[#6A30D9] text-white relative overflow-hidden shrink-0">
               <div className="absolute top-0 right-0 p-6 opacity-20 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-32 h-32"><path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" /></svg>
               </div>
               
               {/* Mobile Pull Indicator */}
               <div className="md:hidden w-12 h-1.5 bg-white/30 rounded-full mx-auto mb-6"></div>

               <div className="flex justify-between items-start relative z-10">
                   <div className="flex items-center gap-4 md:gap-5">
                      <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-white/20 backdrop-blur-md border-2 border-white/50 flex items-center justify-center text-2xl md:text-3xl font-bold shadow-xl shrink-0">
                          {selectedUser.email_1?.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                          <h3 className="text-xl md:text-2xl font-bold truncate">{selectedUser.name_1 || "User Profile"}</h3>
                          <p className="text-indigo-100 text-sm truncate">{selectedUser.email_1}</p>
                          <div className="mt-2 flex flex-wrap gap-2">
                             {selectedUser.is_kyc_1 && <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-medium uppercase">KYC Verified</span>}
                             <span className="bg-white/20 px-2 py-0.5 rounded text-[10px] font-mono">{selectedUser.id.substring(0,6)}...</span>
                          </div>
                      </div>
                   </div>
                   <button onClick={closeModal} className="text-white/70 hover:text-white bg-white/10 p-2 rounded-full hover:bg-white/20 transition">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
                   </button>
               </div>
            </div>

            {/* Content */}
            <div className="p-6 md:p-8 space-y-8 bg-white overflow-y-auto">
              {/* Wallet Section */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4">Financial Overview</h4>
                {walletLoading ? (
                  <div className="grid grid-cols-2 gap-3 animate-pulse">
                     <div className="h-20 bg-slate-100 rounded-2xl"></div>
                     <div className="h-20 bg-slate-100 rounded-2xl"></div>
                  </div>
                ) : walletError ? (
                  <div className="p-4 bg-red-50 text-red-500 rounded-xl text-sm border border-red-100">
                    {walletError}
                  </div>
                ) : userWallet ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    <div className="bg-[#F3F4F7] p-4 rounded-2xl">
                      <div className="text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wide">Total Balance</div>
                      <div className="text-xl md:text-2xl font-bold text-slate-800 truncate">${userWallet.balance?.toFixed(2)}</div>
                    </div>
                    <div className="bg-[#F3F4F7] p-4 rounded-2xl">
                      <div className="text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wide">Main Wallet</div>
                      <div className="text-xl md:text-2xl font-bold text-[#3B2CC9] truncate">${userWallet.main_balance?.toFixed(2)}</div>
                    </div>
                    <div className="bg-[#F3F4F7] p-4 rounded-2xl col-span-2 md:col-span-1">
                      <div className="text-[10px] text-slate-500 mb-1 font-semibold uppercase tracking-wide">Withdrawable</div>
                      <div className="text-xl md:text-2xl font-bold text-green-500 truncate">${userWallet.withdrawable?.toFixed(2)}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center p-6 bg-slate-50 rounded-2xl text-slate-400 text-sm">No wallet data found for this user.</div>
                )}
              </div>

              {/* Stats / Details */}
              <div>
                <h4 className="text-xs uppercase tracking-wider text-slate-400 font-bold mb-4">Account Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 text-sm">
                   <div className="p-3 border border-slate-100 rounded-xl">
                      <span className="block text-slate-400 text-[10px] uppercase">Full ID</span>
                      <span className="font-mono text-slate-600 text-xs break-all">{selectedUser.id}</span>
                   </div>
                   <div className="p-3 border border-slate-100 rounded-xl">
                      <span className="block text-slate-400 text-[10px] uppercase">Joined On</span>
                      <span className="text-slate-600 font-medium">{new Date(selectedUser.created_at).toLocaleDateString()}</span>
                   </div>
                   <div className="p-3 border border-slate-100 rounded-xl">
                      <span className="block text-slate-400 text-[10px] uppercase">Referral Code</span>
                      <span className="text-slate-600 font-bold tracking-wide">{selectedUser.ref_code_1}</span>
                   </div>
                   <div className="p-3 border border-slate-100 rounded-xl">
                      <span className="block text-slate-400 text-[10px] uppercase">Account Status</span>
                      <span className={`font-bold ${selectedUser.is_suspended ? 'text-red-500' : 'text-green-500'}`}>
                         {selectedUser.is_suspended ? 'Suspended' : 'Active'}
                      </span>
                   </div>
                </div>
              </div>
            </div>
            
            <div className="p-4 md:p-6 bg-slate-50 border-t border-slate-100 flex justify-end shrink-0 pb-8 md:pb-6">
              <button onClick={closeModal} className="w-full md:w-auto bg-white border border-slate-200 text-slate-600 px-6 py-3 rounded-xl font-medium hover:bg-slate-100 transition shadow-sm active:scale-95">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};