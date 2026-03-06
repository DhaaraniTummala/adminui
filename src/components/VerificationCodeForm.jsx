import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Typography, Button, Alert } from '@material-tailwind/react';
import AuthFooter from './AuthFooter';

const VerificationCodeForm = ({ setIsLoading }) => {
  const navigate = useNavigate();
  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    // Focus on first input when component mounts
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleInputChange = (index, value) => {
    if (value.length > 1) return; // Only allow single digit

    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    setError(null);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    // Handle backspace
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyCode = () => {
    const verificationCode = code.join('');

    if (verificationCode.length !== 6) {
      setError('Please enter the complete 6-digit verification code');
      return;
    }

    setIsLoading(true);

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      setSuccess(true);
      setError(null);
      // Navigate to reset password screen after successful verification
      setTimeout(() => {
        navigate('/reset-password');
      }, 2000);
    }, 2000);
  };

  const handleResendCode = () => {
    setCode(['', '', '', '', '', '']);
    setError(null);
    setSuccess(false);

    // Focus first input
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }

    // Show success message for resend
    setError(null);
    setTimeout(() => {
      setError('Verification code has been resent to your email');
    }, 500);
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
          {/* Verification Form */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
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
                  Verification Successful!
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  Your email has been verified successfully. Redirecting to login...
                </p>
              </div>
            ) : (
              /* Form State */
              <div>
                {/* Header */}
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    Enter the Verification Code
                  </h2>
                  <p className="text-sm text-gray-600">
                    Check your inbox. We've sent a 6-digit code to your email.
                  </p>
                </div>

                {/* Verification Code Inputs */}
                <div className="flex justify-center space-x-3 mb-6">
                  {code.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => (inputRefs.current[index] = el)}
                      type="text"
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleInputChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      className="w-12 h-12 text-center text-lg font-semibold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                      style={{ fontSize: '18px' }}
                    />
                  ))}
                </div>

                {/* Resend Code Link */}
                <div className="text-center mb-6">
                  <button
                    onClick={handleResendCode}
                    className="text-sm text-purple-600 hover:text-purple-500"
                  >
                    Re-send Code
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <Alert className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm mb-6">
                    {error}
                  </Alert>
                )}

                {/* Verify Button */}
                <Button
                  onClick={handleVerifyCode}
                  disabled={false}
                  className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 mb-4"
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

export default VerificationCodeForm;
