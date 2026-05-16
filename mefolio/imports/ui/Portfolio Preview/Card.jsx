import React from "react";

export function Card({ className = "", children, ...props }) {
  return (
    <div
      className={`bg-white text-slate-900 flex flex-col gap-4 rounded-2xl border-2 border-slate-100 shadow-sm transition-all hover:shadow-md hover:border-indigo-100 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function CardHeader({ className = "", children, ...props }) {
  return (
    <div className={`flex flex-col gap-1.5 px-6 pt-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

export function CardTitle({ className = "", children, ...props }) {
  return (
    <h3 className={`text-xl font-bold tracking-tight text-slate-900 ${className}`} {...props}>
      {children}
    </h3>
  );
}

export function CardContent({ className = "", children, ...props }) {
  return (
    <div className={`px-6 pb-6 ${className}`} {...props}>
      {children}
    </div>
  );
}
