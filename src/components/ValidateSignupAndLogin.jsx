import { useState } from 'react';

const ValidationForSignupAndLogin = () => {
  const [validationError, setValidationError] = useState(null);

  const clearValidationError = () => {
    setValidationError(null);
  };
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i;
  const numberRegex = /\d/;
  const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
  const upperAndLowerCaseRegex = /^(?=.*[a-z])(?=.*[A-Z]).+$/;

  const validateSignup = ({ organization, email, password, confirmPass, acceptTerms }) => {
    let isValid = true;
    switch (true) {
      case !organization:
        setValidationError('Please enter Organization Name');
        isValid = false;
        break;
      case !email:
        setValidationError('Please enter Email');
        isValid = false;
        break;
      case !emailRegex.test(email):
        setValidationError('This is not a valid email format!');
        isValid = false;
        break;
      case !password:
        setValidationError('Please enter Password');
        isValid = false;
        break;
      case password.length < 8:
        setValidationError('Password must be more than 8 characters');
        isValid = false;
        break;
      case !upperAndLowerCaseRegex.test(password):
        setValidationError(
          'Password must contain at least one uppercase letter and one lowercase letter',
        );
        isValid = false;
        break;
      case !numberRegex.test(password):
        setValidationError('Password must contain at least one number');
        isValid = false;
        break;
      case !specialCharRegex.test(password):
        setValidationError('Password must contain at least one special character');
        isValid = false;
        break;
      case !confirmPass:
        setValidationError('Please enter Confirm Password');
        isValid = false;
        break;
      case confirmPass !== password:
        setValidationError("Password doesn't match");
        isValid = false;
        break;
      case !acceptTerms:
        setValidationError(
          'Please indicate that you have read and agree to the Terms and Conditions',
        );
        isValid = false;
        break;
      default:
        isValid = true;
        break;
    }

    return isValid;
  };

  const validateLogin = ({ email, password }) => {
    let isValid = true;
    switch (true) {
      case !email:
        setValidationError('Please enter your Email');
        isValid = false;
        break;
      case !emailRegex.test(email):
        setValidationError('This is not a valid email format!');
        isValid = false;
        break;
      case !password:
        setValidationError('Please enter your Password');
        isValid = false;
        break;
      case password.length < 8:
        setValidationError('Password must be more than 8 characters');
        isValid = false;
        break;
      case !numberRegex.test(password):
        setValidationError('Password must contain at least one number');
        isValid = false;
        break;
      case !upperAndLowerCaseRegex.test(password):
        setValidationError(
          'Password must contain at least one uppercase letter and one lowercase letter',
        );
        isValid = false;
        break;
      case !specialCharRegex.test(password):
        setValidationError('Password must contain at least one special character');
        isValid = false;
        break;
      default:
        isValid = true;
        break;
    }

    return isValid;
  };

  return { validationError, validateSignup, validateLogin, clearValidationError };
};

export default ValidationForSignupAndLogin;
