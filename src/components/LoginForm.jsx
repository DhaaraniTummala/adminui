import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Card,
  CardBody,
  CardFooter,
  Typography,
  Checkbox,
  Button,
  Alert,
} from '@material-tailwind/react';
import { CustomEmailInput, CustomPasswordInput } from '../maiden-core/ui-components';
import { ReduxHelper } from '../core/redux-helper';
import { injectTOStore } from '../core/redux-helper/injectTOStore';
import { defaultActions } from '../app-config';
import ValidationForSignupAndLogin from './ValidateSignupAndLogin';
import AppleSignUpBtn from '../common/AppleSignUpBtn';
import GoogleSignUpBtn from '../common/GoogleSignUpBtn';
import AuthFooter from './AuthFooter';
import secureStorage from '../utils/secureStorage';

const LoginForm = ({ setIsLoading }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const login_result = useSelector((state) => state?.login);

  // Clear secure storage on login component mount
  secureStorage.clear();
  sessionStorage.clear();
  const { validationError, validateLogin, clearValidationError } = ValidationForSignupAndLogin();

  useEffect(() => {
    if (login_result.data) {
      if (login_result.data.message) {
        setError(login_result.data.message);
        setIsLoading(false);
        return;
      }
      // Clear secure storage before storing new data
      secureStorage.clear();
      sessionStorage.clear();
      const {
        token,
        menu,
        menu2,
        dynamicConfig,
        masterDataList,
        userInfo,
        userTable,
        localizedData,
        organizationId,
        project,
      } = login_result.data;

      // Store user information with defaults
      secureStorage.setItem('email', userInfo.Email || '');
      secureStorage.setItem('userId', userInfo.UserId || '');
      secureStorage.setItem('isAdmin', userInfo.IsAdmin || false);
      secureStorage.setItem('sectionTypeId', userInfo.SectionTypeId || null);
      secureStorage.setItem('locationTypeId', userInfo.LocationTypeId || null);
      secureStorage.setItem('userName', userInfo.Name || '');
      secureStorage.setItem('designation', userInfo.Designation || '');

      // Store the complete user info object as well for future use
      secureStorage.setItem('userInfo', JSON.stringify(userInfo));

      var entityMapping = {};
      for (var item of JSON.parse(masterDataList)) {
        entityMapping[item.table] = item;
      }
      var tokenObject = {
        //expires_in: expires_in,
        access_token: token,
        //refresh_token: refresh_token,
        created: Date.now(),
      };

      // Store all authentication data securely
      secureStorage.setItem('cube:token', JSON.stringify(tokenObject));
      secureStorage.setItem('menu2', JSON.stringify(menu2));
      secureStorage.setItem('menu', JSON.stringify(menu));
      secureStorage.setItem('dynamicConfig', dynamicConfig);
      secureStorage.setItem('entityMapping', JSON.stringify(entityMapping));
      secureStorage.setItem('userTable', userTable);
      secureStorage.setItem('languageData', JSON.stringify(localizedData));
      secureStorage.setItem('organizationId', organizationId);
      secureStorage.setItem('project', JSON.stringify(project));

      let dynamicConfigJson = JSON.parse(dynamicConfig);
      let newConfig = [];
      if (null != dynamicConfigJson) {
        newConfig = dynamicConfigJson.map((item) => {
          return { ...item, actions: [...defaultActions] };
        });
      }
      injectTOStore(newConfig);
      const rawMenu2 = JSON.parse(secureStorage.getItem('menu2') || '{}');
      const menu2Data = rawMenu2.Menu || [];

      if (menu2Data.length > 0) {
        const firstMenuGroup = menu2Data[0];
        if (firstMenuGroup.PlantMenu && firstMenuGroup.PlantMenu.length > 0) {
          const firstMenu = firstMenuGroup.PlantMenu[0];
          if (firstMenu.LinkUrl) {
            navigate('/' + firstMenu.LinkUrl);
            window.location.reload();
          }
        }
      }
    } else if (login_result.error) {
      setError(login_result.error);
      setIsLoading(false);
      return;
    }
  }, [login_result, navigate, dispatch, setIsLoading]);

  useEffect(() => {
    return () => {
      dispatch(ReduxHelper.Actions.resetLogin());
    };
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loginSuccess, setLoginSuccess] = useState(false);
  const emailInputRef = useRef(null);
  const passwordInputRef = useRef(null);

  // Auto-focus on email field when component mounts
  useEffect(() => {
    if (emailInputRef.current) {
      emailInputRef.current.focus();
    }
  }, []);

  const handleEmailChange = (event) => {
    const value = event.target.value.toLowerCase();
    setEmail(value);
    setError(null); // Clear error when typing in email input
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
    setError(null); // Clear error when typing in password input
  };

  const handleBlur = () => {
    // Do nothing on blur for now
  };

  const onLoginClick = () => {
    var params = {
      email,
      password,
    };
    const isValid = validateLogin(params);
    if (isValid) {
      setIsLoading(true);
      dispatch(ReduxHelper.Actions.login(params));
    }
  };

  // Handle Enter key press to submit form
  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onLoginClick();
    }
  };

  // Handle Tab key for circular navigation between Email and Password
  const handleEmailKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      if (passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      onLoginClick();
    }
  };

  const handlePasswordKeyDown = (event) => {
    if (event.key === 'Tab') {
      event.preventDefault();
      if (emailInputRef.current) {
        emailInputRef.current.focus();
      }
    } else if (event.key === 'Enter') {
      event.preventDefault();
      onLoginClick();
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
            <img src="PlantiqX-final-logo.svg" alt="Logo" className="w-20 h-25 mb-2" />
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
        {/* Left Side - Login Form */}
        <div className="w-1/2 flex flex-col justify-center px-4 sm:px-6 lg:px-20 xl:px-24">
          <div className="w-full max-w-md mx-auto">
            {/* Welcome Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Welcome to Plantiqx Admin Portal
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                Stay in control of your business operations with powerful tools designed for
                agility, scalability, and clarity.
              </p>
            </div>

            {/* Form Fields */}
            <div className="space-y-4 mb-6">
              {/* Email Field */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Email ID</label>
                <CustomEmailInput
                  ref={emailInputRef}
                  value={email}
                  onChange={handleEmailChange}
                  onBlur={handleBlur}
                  onFocus={() => {
                    setError(null);
                    clearValidationError();
                    setLoginSuccess(false);
                  }}
                  onKeyDown={handleEmailKeyDown}
                  placeholder="Enter Email Address"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-medium text-black mb-1">Password</label>
                <CustomPasswordInput
                  ref={passwordInputRef}
                  value={password}
                  onChange={handlePasswordChange}
                  onBlur={handleBlur}
                  onFocus={() => {
                    setError(null);
                    clearValidationError();
                    setLoginSuccess(false);
                  }}
                  onKeyDown={handlePasswordKeyDown}
                  placeholder="Enter Your Password"
                />
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
              {loginSuccess && (
                <Alert className="bg-green-50 border border-green-200 text-green-700 px-3 py-2 rounded text-sm">
                  Login successful!
                </Alert>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            {/* <div className="flex items-center justify-between mb-6">
              
              <div className="flex items-center">
                <Checkbox
                  id="remember-me"
                  className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  color="purple"
                />
                <label htmlFor="remember-me" className="ml-2 text-sm text-gray-700">
                  Remember me
                </label>
              </div>
             
              <Link to="/forgot-password" className="text-sm text-purple-600 hover:text-purple-500">
                Forgot Password?
              </Link>
            </div> */}

            {/* Login Button */}
            <Button
              onClick={onLoginClick}
              disabled={false}
              className="w-full text-white font-medium py-3 px-4 rounded-lg transition-colors duration-200 mb-6"
              style={{ backgroundColor: 'rgba(105, 65, 198, 1)' }}
              onMouseEnter={(e) => (e.target.style.backgroundColor = 'rgba(105, 65, 198, 1)')}
              onMouseLeave={(e) => (e.target.style.backgroundColor = 'rgba(105, 65, 198, 1)')}
            >
              LOGIN NOW
            </Button>

            {/* Signup Link 
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link 
                  to="/signup" 
                  className="text-purple-600 hover:text-purple-500 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
            */}
          </div>
        </div>

        {/* Right Side - Clean Background */}
        <div className="w-1/2 bg-white relative flex items-center justify-center">
          {/* Optional: Add a subtle pattern or image here */}
          <div className="w-full h-full bg-gradient-to-br from-purple-50 to-blue-50 opacity-30"></div>

          {/* Optional: Uncomment below to add a centered logo or image */}
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

export default LoginForm;
