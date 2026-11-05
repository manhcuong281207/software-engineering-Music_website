import React from "react";

export const StatCard = ({
  title,
  value,
  subtext,
  icon: Icon,
  color = "primary", // primary, blue, green, purple
  isLoading = false,
}) => {
  const colorSchemes = {
    primary: {
      border: "hover:border-[#fa2d48]/40",
      iconBg: "bg-[#fa2d48]/15 text-[#fa2d48]",
      glow: "from-[#fa2d48]/10 to-transparent",
    },
    blue: {
      border: "hover:border-blue-500/40",
      iconBg: "bg-blue-500/15 text-blue-400",
      glow: "from-blue-500/10 to-transparent",
    },
    emerald: {
      border: "hover:border-emerald-500/40",
      iconBg: "bg-emerald-500/15 text-emerald-400",
      glow: "from-emerald-500/10 to-transparent",
    },
    purple: {
      border: "hover:border-purple-500/40",
      iconBg: "bg-purple-500/15 text-purple-400",
      glow: "from-purple-500/10 to-transparent",
    },
  };

  const scheme = colorSchemes[color] || colorSchemes.primary;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl bg-[#141417] border border-neutral-800/80 p-6 transition-all duration-300 ${scheme.border} hover:-translate-y-1 hover:shadow-xl hover:shadow-black/50`}
    >
      {/* Background radial gradient accent */}
      <div
        className={`pointer-events-none absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br ${scheme.glow} blur-2xl`}
      />

      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-neutral-400">
            {title}
          </p>
          {isLoading ? (
            <div className="mt-3 h-8 w-28 animate-pulse rounded-lg bg-neutral-800" />
          ) : (
            <h3 className="mt-2 text-3xl font-black tracking-tight text-white">
              {typeof value === "number" ? value.toLocaleString("vi-VN") : value || 0}
            </h3>
          )}
        </div>

        <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${scheme.iconBg}`}>
          {Icon && <Icon className="h-6 w-6" />}
        </div>
      </div>

      {subtext && (
        <p className="mt-4 flex items-center text-xs font-medium text-neutral-400">
          {subtext}
        </p>
      )}
    </div>
  );
};

