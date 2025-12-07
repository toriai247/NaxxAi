import React from "react";
import { GradientCard } from "../../ui/GlassCard";

interface ProfileCardProps {
  title: string;
  subtitle: string;
  profile: any;
  wallet: any;
}

export const ProfileCard = ({ title, subtitle, profile, wallet }: ProfileCardProps) => {
  return (
    <GradientCard className="p-0 rounded-[24px] text-white my-6 w-full max-w-[360px] animate-scale-in self-start">
      <div className="relative z-10 p-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-2xl font-bold border border-white/40 shadow-inner">
              {title.charAt(0)}
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">{title}</h3>
              <p className="text-indigo-100 text-xs font-mono opacity-80">{subtitle}</p>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur px-2.5 py-1 rounded-lg border border-white/20">
            <span className={`text-[10px] font-bold uppercase tracking-wider ${profile.is_account_active ? 'text-green-300' : 'text-red-300'}`}>
                {profile.is_account_active ? 'ACTIVE' : 'INACTIVE'}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
            <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
              <div className="text-[10px] text-indigo-200 uppercase tracking-wider mb-1">Main Wallet</div>
              <div className="text-2xl font-bold tracking-tight">${wallet?.main_balance?.toFixed(2) ?? '0.00'}</div>
            </div>
            <div className="bg-black/20 rounded-2xl p-3 border border-white/10">
              <div className="text-[10px] text-indigo-200 uppercase tracking-wider mb-1">Withdrawable</div>
              <div className="text-2xl font-bold tracking-tight text-green-300">${wallet?.withdrawable?.toFixed(2) ?? '0.00'}</div>
            </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-indigo-200 font-mono mb-6 bg-white/5 p-2 rounded-lg">
            <span>UID: {profile.id.substring(0,8)}...</span>
            <span>LVL: {profile.level_1 || 1}</span>
        </div>

        <div className="flex gap-3">
          <button className="flex-1 bg-white text-[#6A30D9] py-3 rounded-xl font-bold text-sm shadow-lg hover:bg-indigo-50 transition active:scale-95 flex items-center justify-center gap-2">
            Details
          </button>
          <button className="flex-1 bg-white/10 border border-white/30 text-white py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition active:scale-95 flex items-center justify-center gap-2">
            Edit
          </button>
        </div>
      </div>
    </GradientCard>
  );
};