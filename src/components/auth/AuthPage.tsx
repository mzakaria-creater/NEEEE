import React, { useState } from 'react';
import { Building2, CreditCard, Shield, TrendingUp, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ResetPasswordForm } from './ResetPasswordForm';

type AuthView = 'login' | 'signup' | 'reset';

export const AuthPage: React.FC = () => {
  const [view, setView] = useState<AuthView>('login');

  const features = [
    { icon: CreditCard, label: 'Secure Payments', color: 'from-blue-500 to-cyan-500' },
    { icon: Shield, label: 'Data Protection', color: 'from-purple-500 to-pink-500' },
    { icon: TrendingUp, label: 'Real-time Analytics', color: 'from-green-500 to-emerald-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-900 to-purple-900 flex items-stretch overflow-hidden">
      {/* Left Side - Form */}
      <motion.div
        initial={{ opacity: 0, x: -50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full lg:w-1/2 flex flex-col justify-center px-6 lg:px-12 py-8"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">NEEEE</h1>
              <p className="text-gray-400 text-sm">Payment OS</p>
            </div>
          </div>
        </motion.div>

        {/* Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-slate-800/50 backdrop-blur-xl border border-slate-700 rounded-2xl p-8 max-w-md"
        >
          {view === 'login' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
                <p className="text-gray-400 text-sm">Sign in to your account to continue</p>
              </div>
              <LoginForm onSignUpClick={() => setView('signup')} />
              <div className="mt-6 pt-6 border-t border-slate-700 text-center">
                <button
                  onClick={() => setView('reset')}
                  className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  Forgot your password?
                </button>
              </div>
            </motion.div>
          )}

          {view === 'signup' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-white mb-2">Create Account</h2>
                <p className="text-gray-400 text-sm">Join NEEEE and start processing payments</p>
              </div>
              <SignUpForm onSignInClick={() => setView('login')} />
            </motion.div>
          )}

          {view === 'reset' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <ResetPasswordForm onBackClick={() => setView('login')} />
            </motion.div>
          )}
        </motion.div>
      </motion.div>

      {/* Right Side - Illustration & Features */}
      <motion.div
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 flex-col justify-center px-12"
      >
        {/* Animated Background Elements */}
        <motion.div
          animate={{ y: [0, -20, 0] }}
          transition={{ duration: 4, repeat: Infinity }}
          className="absolute top-20 right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{ y: [0, 20, 0] }}
          transition={{ duration: 5, repeat: Infinity, delay: 1 }}
          className="absolute bottom-20 left-20 w-60 h-60 bg-purple-500/20 rounded-full blur-3xl"
        />

        {/* Content */}
        <div className="relative z-10">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-12"
          >
            <div className="text-white">
              <h3 className="text-4xl font-bold mb-4">Secure Payment Processing</h3>
              <p className="text-gray-300 text-lg leading-relaxed">
                Process payments seamlessly with enterprise-grade security and real-time analytics.
              </p>
            </div>
          </motion.div>

          {/* Features List */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="flex items-center gap-4 group cursor-pointer"
              >
                <div className={`bg-gradient-to-br ${feature.color} p-3 rounded-lg group-hover:scale-110 transition-transform`}>
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="text-white font-semibold group-hover:text-blue-300 transition-colors">
                    {feature.label}
                  </h4>
                  <p className="text-gray-400 text-sm">Enterprise security & compliance</p>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-400 ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.div>
            ))}
          </div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-12 grid grid-cols-3 gap-4"
          >
            {[
              { number: '99.9%', label: 'Uptime' },
              { number: '256-bit', label: 'Encryption' },
              { number: '24/7', label: 'Support' }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-2xl font-bold text-blue-400 mb-1">{stat.number}</div>
                <div className="text-xs text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};
