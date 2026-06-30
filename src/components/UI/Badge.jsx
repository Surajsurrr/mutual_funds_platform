import React from 'react';

export const Badge = ({ children, variant = 'neutral', className = '' }) => (
  <span className={`badge badge-${variant} ${className}`}>{children}</span>
);

export const Spinner = ({ size = 'md', className = '' }) => {
  const sizes = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10', xl: 'h-14 w-14' };
  return (
    <svg className={`animate-spin ${sizes[size]} ${className}`} style={{ color: '#1b9af5' }} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
};

export const Skeleton = ({ className = '', rows = 1 }) => (
  <>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className={`skeleton h-4 ${className}`} />
    ))}
  </>
);

export const SkeletonCard = () => (
  <div className="rounded-2xl p-6 space-y-4"
    style={{ background: '#0f2442', border: '1px solid rgba(27,154,245,0.1)' }}>
    <div className="skeleton h-5 w-1/3 rounded" />
    <div className="skeleton h-8 w-1/2 rounded" />
    <div className="skeleton h-4 w-2/3 rounded" />
  </div>
);

export const Divider = ({ label, className = '' }) => (
  <div className={`flex items-center gap-3 ${className}`}>
    <div className="flex-1 h-px" style={{ background: 'rgba(27,154,245,0.15)' }} />
    {label && <span className="text-xs font-medium" style={{ color: '#7a94ab' }}>{label}</span>}
    <div className="flex-1 h-px" style={{ background: 'rgba(27,154,245,0.15)' }} />
  </div>
);

export const EmptyState = ({ icon: Icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
    {Icon && (
      <div className="p-5 rounded-full" style={{ background: 'rgba(27,154,245,0.1)', color: '#42b4ff' }}>
        <Icon size={32} />
      </div>
    )}
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      {description && <p className="text-sm mt-1" style={{ color: '#7a94ab' }}>{description}</p>}
    </div>
    {action}
  </div>
);
