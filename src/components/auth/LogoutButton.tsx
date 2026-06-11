import React, { useState } from 'react';
import { LogOut, Loader, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface LogoutButtonProps {
  variant?: 'default' | 'outline' | 'text';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const { signOut } = useAuth();

  const handleLogout = async () => {
    setLoading(true);
    setError('');

    try {
      await signOut();
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message || 'Logout failed');
      setLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1 text-sm gap-1',
    md: 'px-4 py-2 text-base gap-2',
    lg: 'px-6 py-3 text-lg gap-2'
  };

  const variantClasses = {
    default: 'bg-red-600 text-white hover:bg-red-700',
    outline: 'border-2 border-red-600 text-red-600 hover:bg-red-50',
    text: 'text-red-600 hover:text-red-700'
  };

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-sm">
          <h3 className="text-lg font-bold text-gray-900 mb-2">Logout?</h3>
          <p className="text-gray-600 mb-4">Are you sure you want to logout?</p>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              onClick={handleLogout}
              disabled={loading}
              className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-400 flex items-center justify-center gap-2 font-medium"
            >
              {loading && <Loader className="w-4 h-4 animate-spin" />}
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className={`flex items-center rounded-lg font-medium transition-colors ${sizeClasses[size]} ${variantClasses[variant]} ${className}`}
    >
      <LogOut className="w-4 h-4" />
      Logout
    </button>
  );
};
