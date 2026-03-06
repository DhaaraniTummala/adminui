import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Typography, Button, Alert, Checkbox, Input } from '@material-tailwind/react';
import { ReduxHelper } from '../core/redux-helper';
import ValidationForSignupAndLogin from './ValidateSignupAndLogin';
import AuthFooter from './AuthFooter';

//import WelcomeLayout from "../components/WelcomeLayout/index";

const SignupForm = ({ setIsLoading }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [organization, setOrganization] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState(null);

  const createSuperAdmin_result = useSelector((state) => state?.createSuperAdmin);

  const { validationError, validateSignup, clearValidationError } = ValidationForSignupAndLogin();

  useEffect(() => {
    if (createSuperAdmin_result.data) {
      alert('Organization Created Succesfully');
      navigate('/');
      dispatch(ReduxHelper.Actions.resetCreateSuperAdmin()); // Reset the state
    } else if (createSuperAdmin_result.error) {
      setIsLoading(false);
      setError(createSuperAdmin_result.error);
    }
  }, [createSuperAdmin_result, navigate, dispatch, setIsLoading]);

  const handleOrganizationChange = (event) => {
    setOrganization(event.target.value);
    setError(null); // Clear error when typing organization input
  };

  const handleEmailChange = (event) => {
    const value = event.target.value.toLowerCase();
    setEmail(value);
    setError(null); // Clear error when typing  email input
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setError(null); // Clear error when typing  password input
  };

  const handleConfirmPasswordChange = (event) => {
    setConfirmPass(event.target.value);
    setError(null); // Clear error when typing  Confirm password input
  };
  const handleAcceptTerms = (event) => {
    setAcceptTerms(event.target.checked);
    setError(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    var params = {
      organization,
      email,
      password,
      confirmPass,
      acceptTerms,
      isMobile: true,
    };
    const isValid = validateSignup(params);
    if (isValid) {
      setIsLoading(true);
      dispatch(ReduxHelper.Actions.createSuperAdmin(params));
    }
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
      <div className="flex-1 flex">
        {/* Left Side - Signup Form */}
        <div className="w-1/2 flex items-center justify-center px-8">
          <div className="w-full max-w-md">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Create Your Account</h2>
              <p className="text-gray-600">
                Join Plantiqx and start managing your business operations
              </p>
            </div>

            {/* Signup Form */}
            <div className="space-y-6">
              {/* Organization Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Organization Name
                </label>
                <Input
                  type="text"
                  placeholder="Enter your organization name"
                  value={organization}
                  onChange={handleOrganizationChange}
                  onFocus={() => {
                    setError(null);
                    clearValidationError();
                  }}
                  className="w-full"
                  size="lg"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <Input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={handleEmailChange}
                  onFocus={() => {
                    setError(null);
                    clearValidationError();
                  }}
                  className="w-full"
                  size="lg"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Create Password
                </label>
                <Input
                  type="password"
                  placeholder="Create a strong password"
                  value={password}
                  onChange={handlePasswordChange}
                  onFocus={() => {
                    setError(null);
                    clearValidationError();
                  }}
                  className="w-full"
                  size="lg"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPass}
                  onChange={handleConfirmPasswordChange}
                  onFocus={() => {
                    setError(null);
                    clearValidationError();
                  }}
                  className="w-full"
                  size="lg"
                />
              </div>

              {/* Terms & Conditions */}
              <div className="flex items-start space-x-3">
                <Checkbox
                  onChange={handleAcceptTerms}
                  onFocus={() => {
                    setError(null);
                    clearValidationError();
                  }}
                  className="mt-1"
                />
                <label className="text-sm text-gray-600">
                  I agree to the{' '}
                  <a
                    href="/terms-and-conditions"
                    className="text-purple-600 hover:text-purple-500 underline"
                  >
                    Terms & Conditions
                  </a>
                </label>
              </div>

              {/* Error Messages */}
              {validationError && (
                <Alert className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {validationError}
                </Alert>
              )}
              {error && (
                <Alert className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded text-sm">
                  {error}
                </Alert>
              )}

              {/* Create Account Button */}
              <Button
                onClick={handleSubmit}
                disabled={false}
                className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 mb-6"
                style={{ backgroundColor: '#7F56D9' }}
                onMouseEnter={(e) => (e.target.style.backgroundColor = '#6D28D9')}
                onMouseLeave={(e) => (e.target.style.backgroundColor = '#7F56D9')}
              >
                CREATE ACCOUNT
              </Button>

              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link to="/" className="text-purple-600 hover:text-purple-500 font-medium">
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Clean Background */}
        <div className="w-1/2 bg-white relative flex items-center justify-center">
          <div className="w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 opacity-30"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <img src="dashboard.png" alt="Plantiqx" className="max-w-lg" />
          </div>
        </div>
      </div>

      {/* Footer */}
      <AuthFooter />
    </div>
  );
};

export default SignupForm;
