import { AlertCircle, RefreshCw } from 'lucide-react';
import type { ErrorAlertProps } from '@/types/admin';

export function ErrorAlert({ title, message, onRetry }: ErrorAlertProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-6" data-testid="error-alert">
      <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
          <AlertCircle className="w-6 h-6 text-red-600" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-red-900" data-testid="error-title">
            {title}
          </h3>
          <p className="mt-2 text-sm text-red-700" data-testid="error-message">
            {message}
          </p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors"
              data-testid="button-retry"
            >
              <RefreshCw className="w-4 h-4" />
              Réessayer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
