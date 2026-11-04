import React, { useState } from "react";
import { User } from "lucide-react";

export const ArtistAvatar = ({
  src,
  alt = "Nghệ sĩ",
  size = "md", // sm, md, lg, xl
  className = "",
}) => {
  const [hasError, setHasError] = useState(false);

  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-11 h-11 text-sm",
    lg: "w-20 h-20 text-lg",
    xl: "w-32 h-32 text-2xl",
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  if (!src || hasError) {
    const initials = (alt || "A")
      .split(" ")
      .map((part) => part[0])
      .join("")
      .substring(0, 2)
      .toUpperCase();

    return (
      <div
        className={`flex items-center justify-center rounded-full bg-gradient-to-br from-neutral-700 to-neutral-900 font-bold text-white shadow-inner ${currentSize} ${className}`}
      >
        {initials || <User className="h-1/2 w-1/2 text-neutral-400" />}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      className={`rounded-full object-cover ring-2 ring-neutral-800 shadow-md ${currentSize} ${className}`}
    />
  );
};

