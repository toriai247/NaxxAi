import React, { useState } from "react";
import { GradientCard } from "../../ui/GlassCard";
import { supabase } from "../../../integrations/supabase/client";

interface EditProfileCardProps {
  currentUser: any;
  onUpdateComplete: (success: boolean, msg: string) => void;
}

export const EditProfileCard = ({ currentUser, onUpdateComplete }: EditProfileCardProps) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name_1: "",
    bio_1: "",
    phone_1: ""
  });

  // Pre-fill data if available (optional, requires fetching current profile first, 
  // but for a quick UI we can start empty or relying on user input)
  
  const handleSubmit = async () => {
    if (!currentUser?.id) return;
    setLoading(true);

    try {
      // Filter out empty fields
      const updates: any = {};
      if (formData.name_1) updates.name_1 = formData.name_1;
      if (formData.bio_1) updates.bio_1 = formData.bio_1;
      if (formData.phone_1) updates.phone_1 = formData.phone_1;

      if (Object.keys(updates).length === 0) {
        setLoading(false);
        return;
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('user_uid', currentUser.id) // Assuming user_uid links to auth id, or use 'id' column depending on schema
        .select();

      // Fallback: try updating by 'id' if user_uid fails or is different structure
      if (error) {
         const { error: retryError } = await supabase.from('profiles').update(updates).eq('id', currentUser.id);
         if (retryError) throw retryError;
      }

      onUpdateComplete(true, `Successfully updated profile for ${currentUser.email}`);
    } catch (e: any) {
      console.error(e);
      onUpdateComplete(false, e.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <GradientCard className="p-0 rounded-[24px] text-white my-4 w-full max-w-[360px] animate-scale-in self-start">
      <div className="relative z-10 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-lg">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" /></svg>
          </div>
          <h3 className="font-bold text-lg">Edit Profile</h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[10px] uppercase text-indigo-200 font-bold tracking-wider ml-1">Display Name</label>
            <input 
              type="text" 
              placeholder="Enter new name"
              value={formData.name_1}
              onChange={e => setFormData({...formData, name_1: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:bg-black/30 transition mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-indigo-200 font-bold tracking-wider ml-1">Bio / Status</label>
            <input 
              type="text" 
              placeholder="Update your bio"
              value={formData.bio_1}
              onChange={e => setFormData({...formData, bio_1: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:bg-black/30 transition mt-1"
            />
          </div>
          <div>
            <label className="text-[10px] uppercase text-indigo-200 font-bold tracking-wider ml-1">Phone</label>
            <input 
              type="text" 
              placeholder="+1 234..."
              value={formData.phone_1}
              onChange={e => setFormData({...formData, phone_1: e.target.value})}
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:bg-black/30 transition mt-1"
            />
          </div>
        </div>

        <button 
          onClick={handleSubmit}
          disabled={loading}
          className="w-full mt-6 bg-white text-[#6A30D9] font-bold py-3 rounded-xl hover:bg-indigo-50 active:scale-95 transition-all shadow-lg flex items-center justify-center gap-2"
        >
          {loading ? (
             <span className="w-4 h-4 border-2 border-[#6A30D9] border-t-transparent rounded-full animate-spin"></span>
          ) : "Save Changes"}
        </button>
      </div>
    </GradientCard>
  );
};