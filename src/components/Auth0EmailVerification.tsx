import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { Mail, CheckCircle, AlertCircle, ArrowLeft, Loader2, ExternalLink, Clock, RefreshCw, User } from 'lucide-react';

interface Auth0EmailVerificationProps {
  onComplete?: () => void;
}

type Step = 'login' | 'waiting' | 'success' | 'error';

const Auth0EmailVerification: React.FC<Auth0EmailVerificationProps> = ({ onComplete }) => {
  const {
    loginWithRedirect,
    logout,
    user,
    isAuthenticated,
    isLoading,
    error: auth0Error
  } = useAuth0();

  const [step, setStep] = useState<Step>('login');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.email_verified) {
        setStep('success');
        onComplete?.();
      } else {
        setStep('waiting');
      }
    }
  }, [isAuthenticated, user, onComplete]);

  useEffect(() => {
    if (auth0Error) {
      setError(auth0Error.message);
      setStep('error');
    }
  }, [auth0Error]);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    
    try {
      await loginWithRedirect({
        authorizationParams: {
          screen_hint: 'signup',
          login_hint: email,
        },
      });
    } catch (err) {
      setError('Failed to initiate signup process');
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || !user?.sub) return;
    
    setLoading(true);
    setError('');
    
    try {
      // Call Auth0 Management API to resend verification email
      const response = await fetch('/api/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.sub }),
      });

      if (!response.ok) {
        throw new Error('Failed to resend verification email');
      }

      setResendCooldown(60);
    } catch (err) {
      setError('Failed to resend verification email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckVerification = async () => {
    setLoading(true);
    
    // Refresh the user profile to check if email is now verified
    try {
      window.location.reload();
    } catch (err) {
      setError('Failed to check verification status');
      setLoading(false);
    }
  };

  const renderLoginStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Create Account & Verify Email</h2>
        <p className="text-gray-600">
          Enter your email address to create an account and receive a verification link
        </p>
      </div>

      <form onSubmit={handleEmailSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Enter your email address"
            required
          />
        </div>

        {error && (
          <div className="flex items-center space-x-2 text-red-600 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        )}

        <button
          type="submit"
          disabled={loading || isLoading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading || isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <span>Create Account & Send Verification</span>
          )}
        </button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => loginWithRedirect()}
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );

  const renderWaitingStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
          <Clock className="w-8 h-8 text-amber-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Check Your Email</h2>
        <p className="text-gray-600 mb-1">
          We've sent a verification link to
        </p>
        <p className="text-gray-900 font-medium mb-4">{user?.email}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center space-x-2 text-blue-700 text-sm">
            <User className="w-4 h-4" />
            <span>Account created - email verification pending</span>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h3 className="font-medium text-gray-900 mb-2">What to do next:</h3>
          <ol className="text-sm text-gray-600 space-y-1">
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">1</span>
              <span>Check your email inbox (and spam folder)</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">2</span>
              <span>Click the "Verify Email" button in the email</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <span>Return here and click "Check Verification Status"</span>
            </li>
          </ol>
        </div>

        <button
          onClick={handleCheckVerification}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Checking...</span>
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Check Verification Status</span>
            </>
          )}
        </button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Didn't receive the email?</p>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={resendCooldown > 0 || loading}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Verification Email'}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Sign Out & Try Different Email</span>
        </button>
      </div>
    </div>
  );

  const renderSuccessStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Verified!</h2>
      <p className="text-gray-600 mb-4">
        Your email address has been successfully verified. Welcome to your account!
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <div className="text-green-800 text-sm space-y-1">
          <p>✓ Email: {user?.email}</p>
          <p>✓ Verified at: {new Date().toLocaleString()}</p>
          <p>✓ Account Status: Active</p>
        </div>
      </div>
      <div className="space-y-3">
        <button
          onClick={() => onComplete?.()}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
        >
          Continue to Dashboard
        </button>
        <button
          onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
          className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );

  const renderErrorStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Error</h2>
      <p className="text-gray-600 mb-4">
        There was an issue with the email verification process.
      </p>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      <div className="space-y-3">
        <button
          onClick={() => {
            setStep('login');
            setError('');
          }}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Try Again
        </button>
        {isAuthenticated && (
          <button
            onClick={() => logout({ logoutParams: { returnTo: window.location.origin } })}
            className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        )}
      </div>
    </div>
  );

  const getStepContent = () => {
    if (isLoading) {
      return (
        <div className="text-center py-8">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading...</p>
        </div>
      );
    }

    switch (step) {
      case 'login':
        return renderLoginStep();
      case 'waiting':
        return renderWaitingStep();
      case 'success':
        return renderSuccessStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderLoginStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {getStepContent()}
        </div>
        
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600">
            Powered by Auth0 • <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Need Help?</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth0EmailVerification;