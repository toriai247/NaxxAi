import React from "react";

interface AvatarProps {
  initials?: string;
  image?: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export const Avatar = ({ initials, image, size = "md", className = "" }: AvatarProps) => {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-10 h-10 text-sm",
    lg: "w-14 h-14 text-lg",
    xl: "w-20 h-20 text-3xl"
  };

  if (image) {
    return (
      <div className={`rounded-full overflow-hidden bg-slate-100 ${sizeClasses[size]} ${className}`}>
        <img src={image} alt="Avatar" className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div className={`rounded-2xl bg-gradient-to-br from-[#3B2CC9] to-[#8D4DFF] flex items-center justify-center text-white font-bold shadow-lg ${sizeClasses[size]} ${className}`}>
      {initials?.charAt(0).toUpperCase() || "?"}
    </div>
  );
};