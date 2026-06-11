import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ResetPasswordForm } from './ResetPasswordForm';

type AuthView = 'login' | 'signup' | 'reset';

export const AuthPage: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-purple-500 to-blue-500 p-3 rounded-xl">
              <Building2 className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">NEEEE</h1>
          <p className="text-gray-300">Payment Processing System</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {view === 'login' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Sign In</h2>
              <LoginForm onSignUpClick={() => setView('signup')} />
              <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                <button
                  onClick={() => setView('reset')}
                  className="text-sm text-gray-600 hover:text-gray-900"
                >
                  Forgot your password?
                </button>
              </div>
            </>
          )}

          {view === 'signup' && (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Account</h2>
              <SignUpForm onSignInClick={() => setView('login')} />
            </>
          )}

          {view === 'reset' && (
            <ResetPasswordForm onBackClick={() => setView('login')} />
          )}
        </div>

        {/* Footer */}
        <p className="text-center text-gray-400 text-sm mt-8">
          Secure payment processing powered by Supabase
        </p>
      </div>
    </div>
  );
};
