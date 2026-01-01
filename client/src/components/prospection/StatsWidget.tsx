import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatsWidgetProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconColor?: string;
  testId?: string;
}

export function StatsWidget({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  iconColor = "text-muted-foreground",
  testId 
}: StatsWidgetProps) {
  return (
    <Card className="hover-elevate transition-all duration-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={`h-4 w-4 ${iconColor}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold" data-testid={testId}>
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-muted-foreground mt-1">
            {subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
