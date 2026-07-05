import React from 'react';
import { AlertCircle } from 'lucide-react';

interface UserNoticeProps {
  message: string;
  variant?: 'error' | 'warning';
}

export default function UserNotice({ message, variant = 'error' }: UserNoticeProps) {
  const styles =
    variant === 'warning'
      ? 'bg-amber-50 border-amber-200 text-amber-900'
      : 'bg-red-50 border-red-200 text-error';

  return (
    <div className={`mb-4 p-3 border text-xs rounded-xl font-medium flex items-start gap-2 ${styles}`}>
      <AlertCircle size={16} className="shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
