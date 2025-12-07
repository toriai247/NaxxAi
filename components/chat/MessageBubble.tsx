import React, { useState } from "react";

// --- Helper: Text Formatter ---
const formatText = (text: string) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, i) => {
    if (part.match(urlRegex)) {
      return (
        <a key={i} href={part} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline hover:text-indigo-800 break-all relative z-10">
          {part}
        </a>
      );
    }
    // Simple bold parser
    const boldParts = part.split(/(\*\*.*?\*\*)/);
    return boldParts.map((subPart, j) => {
      if (subPart.startsWith('**') && subPart.endsWith('**')) {
        return <strong key={`${i}-${j}`}>{subPart.slice(2, -2)}</strong>;
      }
      return <span key={`${i}-${j}`}>{subPart}</span>;
    });
  });
};

interface MessageBubbleProps {
  role: "user" | "model";
  text: string;
  image?: string;
  isError?: boolean;
}

export const MessageBubble = ({ role, text, image, isError }: MessageBubbleProps) => {
  const [expanded, setExpanded] = useState(false);
  const CHAR_LIMIT = 280;
  const isLong = text.length > CHAR_LIMIT;
  
  // Style Definitions
  const containerBase = "max-w-[90%] md:max-w-[80%] p-4 rounded-3xl shadow-sm text-[15px] leading-relaxed mb-1 transition-all duration-300 relative group";
  const textClass = "break-words whitespace-pre-wrap overflow-hidden";
  
  const userStyle = "bg-slate-200 text-slate-800 rounded-tr-sm font-medium";
  const modelStyle = "bg-white text-slate-700 rounded-tl-sm border border-white shadow-md";
  const errorStyle = "bg-red-50 text-red-800 border border-red-100 rounded-tl-sm shadow-sm";

  const styleClass = role === "user" 
    ? userStyle 
    : isError 
      ? errorStyle 
      : modelStyle;

  return (
    <div className={`${containerBase} ${styleClass}`}>
        {image && (
          <div className="mb-3 rounded-2xl overflow-hidden shadow-sm border border-black/5">
            <img src={image} className="w-full object-cover max-h-60 bg-slate-50" alt="User upload" />
          </div>
        )}
        
        <div className={textClass}>
            {formatText(isLong && !expanded ? text.slice(0, CHAR_LIMIT) + "..." : text)}
        </div>

        {isLong && (
          <button 
            onClick={() => setExpanded(!expanded)} 
            className={`mt-2 text-[10px] uppercase font-bold tracking-wider flex items-center gap-1 opacity-70 hover:opacity-100 transition-opacity ${isError ? 'text-red-700' : 'text-indigo-600'}`}
          >
            {expanded ? "Show Less" : "Read More"}
             <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3 h-3 transition-transform ${expanded ? 'rotate-180' : ''}`}>
               <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
             </svg>
          </button>
        )}
    </div>
  );
};