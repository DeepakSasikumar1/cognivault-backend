import React from 'react';

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--text)] tracking-tight">{title}</h1>
        {subtitle && <p className="text-sm text-[var(--text-3)] mt-1">{subtitle}</p>}
      </div>
      {actions && (
        <div className="flex items-center gap-3 mt-4 sm:mt-0">
          {actions}
        </div>
      )}
    </div>
  );
}
