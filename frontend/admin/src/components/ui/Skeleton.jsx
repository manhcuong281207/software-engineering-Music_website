import React from "react";

export const SkeletonRow = ({ cols = 5 }) => (
  <tr className="border-b border-neutral-800/50 animate-pulse">
    {Array.from({ length: cols }).map((_, i) => (
      <td key={i} className="py-4 px-4">
        <div className="h-4 bg-neutral-800 rounded-md w-3/4" />
      </td>
    ))}
  </tr>
);

export const SkeletonCard = () => (
  <div className="p-5 rounded-2xl bg-[#181818] border border-neutral-800/60 animate-pulse space-y-3">
    <div className="flex items-center justify-between">
      <div className="w-10 h-10 rounded-xl bg-neutral-800" />
      <div className="w-16 h-4 bg-neutral-800 rounded-md" />
    </div>
    <div className="h-7 w-24 bg-neutral-800 rounded-md mt-2" />
    <div className="h-4 w-32 bg-neutral-800 rounded-md" />
  </div>
);


