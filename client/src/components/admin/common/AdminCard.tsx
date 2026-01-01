interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export function AdminCard({ children, className = '', title, subtitle, action }: AdminCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}>
      {(title || action) && (
        <div className="p-6 border-b border-gray-200 flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-lg font-semibold text-gray-900" data-testid="card-title">
                {title}
              </h3>
            )}
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600" data-testid="card-subtitle">
                {subtitle}
              </p>
            )}
          </div>
          {action && <div>{action}</div>}
        </div>
      )}
      <div className="p-6">
        {children}
      </div>
    </div>
  );
}
