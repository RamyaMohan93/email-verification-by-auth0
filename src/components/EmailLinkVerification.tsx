import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle, AlertCircle, ArrowLeft, Loader2, ExternalLink, Clock, RefreshCw } from 'lucide-react';

interface EmailLinkVerificationProps {
  onComplete?: () => void;
}

type Step = 'email' | 'waiting' | 'success' | 'expired' | 'error';

const EmailLinkVerification: React.FC<EmailLinkVerificationProps> = ({ onComplete }) => {
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(600); // 10 minutes in seconds
  const [verificationToken, setVerificationToken] = useState('');

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  useEffect(() => {
    if (step === 'waiting' && timeRemaining > 0) {
      const timer = setTimeout(() => setTimeRemaining(timeRemaining - 1), 1000);
      return () => clearTimeout(timer);
    } else if (step === 'waiting' && timeRemaining === 0) {
      setStep('expired');
    }
  }, [step, timeRemaining]);

  // Check URL parameters for verification token on component mount
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    const verified = urlParams.get('verified');
    
    if (token) {
      setVerificationToken(token);
      if (verified === 'true') {
        setStep('success');
        onComplete?.();
      } else if (verified === 'false') {
        setStep('error');
        setError('Invalid or expired verification link');
      } else {
        // Simulate verification process
        setLoading(true);
        setTimeout(() => {
          setLoading(false);
          setStep('success');
          onComplete?.();
        }, 2000);
      }
    }
  }, [onComplete]);

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
    
    // Simulate API call to send verification email
    setTimeout(() => {
      setLoading(false);
      setStep('waiting');
      setResendCooldown(60);
      setTimeRemaining(600); // Reset timer
    }, 2000);
  };

  const handleResendEmail = async () => {
    if (resendCooldown > 0) return;
    
    setLoading(true);
    setError('');
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      setResendCooldown(60);
      setTimeRemaining(600); // Reset timer
    }, 1000);
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const simulateVerification = () => {
    setLoading(true);
    // Simulate clicking the verification link
    setTimeout(() => {
      setLoading(false);
      setStep('success');
      onComplete?.();
    }, 2000);
  };

  const renderEmailStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
          <Mail className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
        <p className="text-gray-600">
          Enter your email address and we'll send you a verification link
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
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Sending...</span>
            </>
          ) : (
            <span>Send Verification Link</span>
          )}
        </button>
      </form>
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
        <p className="text-gray-900 font-medium mb-4">{email}</p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-center space-x-2 text-blue-700 text-sm">
            <Clock className="w-4 h-4" />
            <span>Link expires in: {formatTime(timeRemaining)}</span>
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
              <span>Click the verification link in the email</span>
            </li>
            <li className="flex items-start space-x-2">
              <span className="flex-shrink-0 w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium">3</span>
              <span>You'll be automatically redirected back here</span>
            </li>
          </ol>
        </div>

        {/* Demo button for testing */}
        <button
          onClick={simulateVerification}
          disabled={loading}
          className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Verifying...</span>
            </>
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              <span>Simulate Link Click (Demo)</span>
            </>
          )}
        </button>

        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">Didn't receive the email?</p>
          <button
            type="button"
            onClick={handleResendEmail}
            disabled={resendCooldown > 0 || loading}
            className="text-blue-600 hover:text-blue-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-1"
          >
            <RefreshCw className="w-4 h-4" />
            <span>
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
            </span>
          </button>
        </div>

        <button
          type="button"
          onClick={() => setStep('email')}
          className="w-full text-gray-600 hover:text-gray-800 py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Email</span>
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
      <p className="text-gray-600 mb-6">
        Your email address has been successfully verified. You can now access your account.
      </p>
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-green-800 text-sm">
          ✓ Email verification completed at {new Date().toLocaleString()}
        </p>
      </div>
      <button
        onClick={() => {
          setStep('email');
          setEmail('');
          setTimeRemaining(600);
        }}
        className="bg-green-600 text-white py-3 px-6 rounded-lg hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
      >
        Continue
      </button>
    </div>
  );

  const renderExpiredStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h2>
      <p className="text-gray-600 mb-6">
        The verification link has expired. Please request a new one to continue.
      </p>
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <p className="text-red-800 text-sm">
          Verification links expire after 10 minutes for security reasons.
        </p>
      </div>
      <button
        onClick={handleResendEmail}
        disabled={loading}
        className="bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Sending...</span>
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" />
            <span>Send New Link</span>
          </>
        )}
      </button>
    </div>
  );

  const renderErrorStep = () => (
    <div className="text-center space-y-6">
      <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
        <AlertCircle className="w-8 h-8 text-red-600" />
      </div>
      <h2 className="text-2xl font-bold text-gray-900 mb-2">Verification Failed</h2>
      <p className="text-gray-600 mb-4">
        There was an issue verifying your email address.
      </p>
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}
      <div className="space-y-3">
        <button
          onClick={() => setStep('email')}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Try Again
        </button>
        <button
          onClick={handleResendEmail}
          disabled={loading}
          className="w-full text-blue-600 hover:text-blue-700 py-2 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Send New Link</span>
        </button>
      </div>
    </div>
  );

  const getStepContent = () => {
    switch (step) {
      case 'email':
        return renderEmailStep();
      case 'waiting':
        return renderWaitingStep();
      case 'success':
        return renderSuccessStep();
      case 'expired':
        return renderExpiredStep();
      case 'error':
        return renderErrorStep();
      default:
        return renderEmailStep();
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
            Need help? <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">Contact Support</a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default EmailLinkVerification;