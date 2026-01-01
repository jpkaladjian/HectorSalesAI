import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  testId?: string;
}

export function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  testId 
}: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12">
        <Icon className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-muted-foreground text-center mb-4 max-w-md">
          {description}
        </p>
        {actionLabel && onAction && (
          <Button onClick={onAction} data-testid={testId}>
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
