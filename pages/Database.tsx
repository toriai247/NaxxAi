import React, { useState, useEffect } from "react";
import { supabase } from "../integrations/supabase/client";
import { ALL_TABLES } from "../constants";

export const DatabaseExplorer = () => {
  const [selectedTable, setSelectedTable] = useState<string>("profiles");
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData(selectedTable);
  }, [selectedTable]);

  const fetchData = async (table: string) => {
    setLoading(true);
    setError(null);
    let { data: rows, error: fetchError } = await supabase.from(table).select('*').limit(50).order('created_at', { ascending: false });
    
    // Fallback if sorting column doesn't exist
    if (fetchError) {
       const retry = await supabase.from(table).select('*').limit(50);
       rows = retry.data;
       fetchError = retry.error;
    }
    
    if (fetchError) {
      setError(`${fetchError.message} (Code: ${fetchError.code})`);
      setData([]);
    } else {
      setData(rows || []);
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F4F7] p-4 md:p-8 overflow-hidden pt-16 md:pt-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
        <div>
           <h2 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">Database</h2>
           <p className="text-slate-500 text-sm md:text-base">Inspector & Manager</p>
        </div>
        
        <div className="relative w-full md:w-auto">
          <select 
            value={selectedTable}
            onChange={(e) => setSelectedTable(e.target.value)}
            className="w-full bg-white text-slate-700 border border-slate-200 shadow-sm rounded-xl px-4 py-3 appearance-none pr-10 focus:ring-2 focus:ring-[#3B2CC9] focus:border-transparent outline-none font-medium text-sm"
          >
            {ALL_TABLES.map(t => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" /></svg>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center text-[#3B2CC9] animate-pulse font-medium">Loading records...</div>
        ) : error ? (
          <div className="flex-1 flex flex-col items-center justify-center text-red-500 p-6 text-center">
             <span className="bg-red-50 p-3 rounded-full mb-3">
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" /></svg>
             </span>
             <p className="font-semibold">Unable to load table data</p>
             <p className="text-sm opacity-70 mt-1">{error}</p>
          </div>
        ) : data.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-slate-400">No records found.</div>
        ) : (
          <div className="overflow-x-auto w-full flex-1">
            <table className="w-full text-left border-collapse min-w-[600px]">
              <thead className="bg-slate-50 text-slate-500 sticky top-0 z-10 text-xs uppercase tracking-wider font-semibold">
                <tr>
                  {Object.keys(data[0]).map(key => (
                    <th key={key} className="p-4 border-b border-slate-200 whitespace-nowrap">{key}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.map((row, i) => (
                  <tr key={i} className="hover:bg-indigo-50/50 transition-colors text-sm text-slate-600">
                    {Object.values(row).map((val: any, j) => (
                      <td key={j} className="p-4 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis">
                        {typeof val === 'object' ? <span className="text-slate-400 italic font-mono text-xs">JSON</span> : String(val)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="bg-slate-50 p-4 border-t border-slate-200 text-xs text-slate-500 flex justify-between font-medium">
          <span>{data.length} records</span>
          <span className="uppercase text-slate-400 tracking-widest text-[10px]">{selectedTable}</span>
        </div>
      </div>
    </div>
  );
};