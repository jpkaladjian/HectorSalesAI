interface StatsBadgeProps {
  label: string;
  value: string | number;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  className?: string;
}

export function StatsBadge({ label, value, variant = 'default', className = '' }: StatsBadgeProps) {
  const variantClasses = {
    default: 'bg-gray-100 text-gray-800 border-gray-200',
    success: 'bg-green-100 text-green-800 border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    danger: 'bg-red-100 text-red-800 border-red-200',
    info: 'bg-blue-100 text-blue-800 border-blue-200',
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${variantClasses[variant]} ${className}`}>
      <span className="text-xs font-medium" data-testid="badge-label">{label}:</span>
      <span className="text-sm font-bold" data-testid="badge-value">{value}</span>
    </div>
  );
}
