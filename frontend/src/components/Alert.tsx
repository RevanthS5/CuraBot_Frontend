import React from 'react';
import { AlertCircle, CheckCircle, Info, X, AlertTriangle } from 'lucide-react';

type AlertStatus = 'info' | 'success' | 'warning' | 'error';

interface AlertProps {
  status: AlertStatus;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

const Alert: React.FC<AlertProps> = ({
  status,
  title,
  description,
  children,
  onClose,
  className = '',
}) => {
  const statusConfig = {
    info: {
      icon: <Info className="h-5 w-5 text-blue-400" />,
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-400',
      titleColor: 'text-blue-800',
      textColor: 'text-blue-700',
    },
    success: {
      icon: <CheckCircle className="h-5 w-5 text-green-400" />,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-400',
      titleColor: 'text-green-800',
      textColor: 'text-green-700',
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 text-yellow-400" />,
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-400',
      titleColor: 'text-yellow-800',
      textColor: 'text-yellow-700',
    },
    error: {
      icon: <AlertCircle className="h-5 w-5 text-red-400" />,
      bgColor: 'bg-red-50',
      borderColor: 'border-red-400',
      titleColor: 'text-red-800',
      textColor: 'text-red-700',
    },
  };

  const config = statusConfig[status];

  return (
    <div className={`${config.bgColor} border-l-4 ${config.borderColor} p-4 ${className}`}>
      <div className="flex">
        <div className="flex-shrink-0">{config.icon}</div>
        <div className="ml-3 flex-1">
          {title && <h3 className={`text-sm font-medium ${config.titleColor}`}>{title}</h3>}
          <div className={`text-sm ${config.textColor} mt-1`}>
            {description && <p>{description}</p>}
            {children}
          </div>
        </div>
        {onClose && (
          <div className="pl-3">
            <button
              type="button"
              className={`inline-flex rounded-md ${config.bgColor} text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500`}
              onClick={onClose}
            >
              <span className="sr-only">Dismiss</span>
              <X className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Alert;
