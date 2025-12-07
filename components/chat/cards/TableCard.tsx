import React from "react";

interface TableCardProps {
  title: string;
  subtitle: string;
  data: any[];
}

export const TableCard = ({ title, subtitle, data }: TableCardProps) => {
  return (
    <div className="bg-white p-5 rounded-[24px] shadow-lg my-4 w-full max-w-sm border border-slate-100 animate-scale-in self-start">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-indigo-50 rounded-xl text-[#3B2CC9]">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0h7.5c.621 0 1.125.504 1.125 1.125M3.375 8.25c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m17.25-3.75h-7.5c-.621 0-1.125.504-1.125 1.125m8.625-1.125c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M12 10.875v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 10.875c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125M13.125 12h7.5m-7.5 0c-.621 0-1.125.504-1.125 1.125M20.625 12c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5M12 14.625v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M12 14.625c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m0 1.5v-1.5m0 1.5c0 .621-.504 1.125-1.125 1.125M20.625 14.625c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h7.5" /></svg>
          </div>
          <div>
              <h4 className="font-bold text-slate-800 text-sm">{title}</h4>
              <p className="text-[11px] text-slate-500 font-medium">{subtitle}</p>
          </div>
        </div>
        <div className="space-y-2">
          {data && data.length > 0 ? data.slice(0, 3).map((row: any, i: number) => (
              <div key={i} className="p-3 bg-slate-50 rounded-xl text-[10px] text-slate-600 font-mono overflow-hidden whitespace-nowrap text-ellipsis border border-slate-100/50 hover:bg-indigo-50 transition-colors">
                {JSON.stringify(row)}
              </div>
          )) : (
              <div className="text-center text-xs text-slate-400 py-4 bg-slate-50 rounded-xl border-dashed border border-slate-200">No data available</div>
          )}
          {data && data.length > 3 && (
            <button className="w-full py-2 text-xs text-indigo-600 font-bold bg-indigo-50 rounded-xl hover:bg-indigo-100 transition mt-2">
                View {data.length - 3} more rows
            </button>
          )}
        </div>
    </div>
  );
};