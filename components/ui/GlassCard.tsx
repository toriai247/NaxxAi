import React from "react";

interface GlassCardProps {
  children?: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export const GlassCard = ({ children, className = "", onClick }: GlassCardProps) => {
  return (
    <div 
      onClick={onClick}
      className={`glass-card backdrop-blur-md bg-white/10 border border-white/20 shadow-xl ${className}`}
    >
      {children}
    </div>
  );
};

export const GradientCard = ({ children, className = "" }: GlassCardProps) => {
  return (
    <div className={`gradient-card relative overflow-hidden shadow-2xl ${className}`}>
      {/* Texture overlay */}
      <div className="absolute inset-0 bg-white/5 backdrop-blur-[2px] z-0 pointer-events-none"></div>
      <div className="absolute top-[-50px] right-[-50px] w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};