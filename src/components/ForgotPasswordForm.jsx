import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Button, Alert, Input } from '@material-tailwind/react';
import AuthFooter from './AuthFooter';

const ForgotPasswordForm = ({ setIsLoading }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleEmailChange = (event) => {
    const value = event.target.value.toLowerCase();
    setEmail(value);
    setError(null);
  };

  const handleSendCode = () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      // Navigate to verification code screen instead of showing success
      navigate('/verification-code');
    }, 2000);
  };

  return (
    <div
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{ fontFamily: 'Poppins, sans-serif' }}
    >
      {/* Navbar */}
      <nav className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left - Plantiqx Logo */}
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-2xl font-bold text-purple-600">Plantiqx</h1>
            </Link>
          </div>

          {/* Right - Help & Support */}
          <div className="flex items-center space-x-6">
            <button className="flex items-center text-sm text-gray-600 hover:text-purple-600 transition-colors">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Help & Support
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Forgot Password Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Forgot Your Password?</h2>
              <p className="text-sm text-gray-600">
                We'll send a verification code to your registered email
              </p>
            </div>

            {success ? (
              /* Success State */
              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-green-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Verification Code Sent!
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  We've sent a verification code to <strong>{email}</strong>. Please check your
                  email and follow the instructions to reset your password.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center justify-center w-full text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: '#7F56D9' }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#6D28D9')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#7F56D9')}
                >
                  Back to Login
                </Link>
              </div>
            ) : (
              /* Form State */
              <div className="space-y-6">
                {/* Email Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="Enter Email Address"
                    value={email}
                    onChange={handleEmailChange}
                    className="!border-gray-300 focus:!border-purple-500 focus:!border-2"
                    labelProps={{
                      className: 'hidden',
                    }}
                  />
                </div>

                {/* Error Message */}
                {error && (
                  <Alert className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                    {error}
                  </Alert>
                )}

                {/* Send Code Button */}
                <Button
                  onClick={handleSendCode}
                  disabled={false}
                  className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200"
                  style={{ backgroundColor: '#7F56D9' }}
                  onMouseEnter={(e) => (e.target.style.backgroundColor = '#6D28D9')}
                  onMouseLeave={(e) => (e.target.style.backgroundColor = '#7F56D9')}
                >
                  SEND VERIFICATION CODE
                </Button>

                {/* Back to Login Link */}
                <div className="text-center">
                  <Link to="/" className="text-sm text-purple-600 hover:text-purple-500">
                    ← Back to Login
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
};

export default ForgotPasswordForm;
