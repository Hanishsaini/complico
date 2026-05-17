import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "enterprise";
  isLoading?: boolean;
  loadingText?: string;
  size?: "sm" | "md" | "lg";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading,
  loadingText,
  size = "md",
  className = "",
  disabled,
  ...props
}) => {
  const base = "inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#090d12] disabled:opacity-40 disabled:cursor-not-allowed";
  const variants = {
    primary: "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/10 focus:ring-emerald-500",
    outline: "border border-[#1e2733] bg-transparent text-[#edf0f5] hover:bg-[#161c28] hover:border-[#2d3a4a] focus:ring-emerald-500",
    ghost: "bg-transparent text-[#8b949e] hover:text-white hover:bg-[#161c28]",
    enterprise: "bg-[#161c28] hover:bg-[#1a2330] text-white border border-[#1e2733] hover:border-[#2d3a4a]",
  };
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-7 py-3.5 text-sm",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {isLoading && loadingText ? loadingText : children}
    </button>
  );
};