interface ProgressBarProps {
  percentage: number;
  showPercentage?: boolean;
  height?: string;
  color?: string;
  testId?: string;
}

export function ProgressBar({ 
  percentage, 
  showPercentage = true, 
  height = "h-2",
  color = "bg-primary",
  testId
}: ProgressBarProps) {
  const safePercentage = Math.min(100, Math.max(0, percentage));
  
  return (
    <div className="flex items-center gap-3">
      <div className={`flex-1 bg-muted rounded-full overflow-hidden ${height}`}>
        <div 
          className={`${height} ${color} rounded-full transition-all duration-500 ease-out`}
          style={{ width: `${safePercentage}%` }}
          data-testid={testId}
        />
      </div>
      {showPercentage && (
        <span className="text-sm font-medium text-muted-foreground min-w-[3rem] text-right">
          {Math.round(safePercentage)}%
        </span>
      )}
    </div>
  );
}
