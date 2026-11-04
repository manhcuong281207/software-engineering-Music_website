import React from "react";

export const Button = ({
  children,
  variant = "primary",
  size = "md",
  iconOnly = false,
  className = "",
  disabled = false,
  ...props
}) => {
  const baseStyles =
    "inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none";

  const sizeStyles = {
    sm: iconOnly ? "w-8 h-8 rounded-full p-0" : "h-9 px-4 text-sm rounded-full",
    md: iconOnly ? "w-11 h-11 rounded-full p-0" : "h-11 px-6 text-sm font-semibold rounded-full",
    lg: iconOnly ? "w-14 h-14 rounded-full p-0" : "h-14 px-8 text-base font-bold rounded-full",
  };

  const variantStyles = {
    primary:
      "bg-[#fa2d48] text-white hover:bg-[#ff4b63] shadow-md shadow-[#fa2d48]/25 hover:shadow-lg hover:shadow-[#fa2d48]/40 active:scale-95",
    secondary:
      "bg-transparent text-white border border-neutral-700 hover:border-neutral-400 hover:bg-neutral-800/50 active:scale-95",
    white:
      "bg-white text-black hover:bg-neutral-200 shadow-sm active:scale-95",
    dark:
      "bg-[#1c1c1f] text-neutral-200 hover:bg-[#28282e] hover:text-white border border-neutral-800 active:scale-95",
    danger:
      "bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 active:scale-95",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${
        variantStyles[variant] || variantStyles.primary
      } ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

