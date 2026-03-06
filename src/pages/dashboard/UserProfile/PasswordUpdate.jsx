import { React, useState } from 'react';
import Layout from '../../../components/Layout';
import ProjectCardsData from '../../../data/ProjectCardsData';
import { ProjectCard } from '../../../widgets/cards';
import { GrAdd } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { Card, CardBody, Input, Button } from '@material-tailwind/react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';

const PasswordUpdate = (props) => {
  const [showOldPass, setShowOldPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [oldPasswordError, setOldPasswordError] = useState(null);
  const [newPasswordError, setNewPasswordError] = useState(null);
  const [confirmPasswordError, setConfirmPasswordError] = useState(null);

  const numberRegex = /\d/;
  const specialCharRegex = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;
  const upperAndLowerCaseRegex = /^(?=.*[a-z])(?=.*[A-Z]).+$/;

  const handleShowPass = (type) => {
    switch (type) {
      case 'old':
        setShowOldPass((prev) => !prev);
        break;
      case 'new':
        setShowNewPass((prev) => !prev);
        break;
      case 'confirm':
        setShowConfirmPass((prev) => !prev);
        break;
      default:
        break;
    }
  };

  const validatePassword = () => {
    let isValid = true;

    if (!oldPassword) {
      setOldPasswordError('Please enter old password');
      isValid = false;
    } else {
      setOldPasswordError(null);
    }

    if (!newPassword) {
      setNewPasswordError('Please enter new password');
      isValid = false;
    } else if (newPassword.length < 8) {
      setNewPasswordError('Password must be more than 8 characters');
      isValid = false;
    } else if (!numberRegex.test(newPassword)) {
      setNewPasswordError('Password must contain at least one number');
      isValid = false;
    } else if (!specialCharRegex.test(newPassword)) {
      setNewPasswordError('Password must contain at least one special character');
      isValid = false;
    } else if (!upperAndLowerCaseRegex.test(newPassword)) {
      setNewPasswordError('Password must contain both uppercase and lowercase letters');
      isValid = false;
    } else {
      setNewPasswordError(null);
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please enter confirm password');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    } else {
      setConfirmPasswordError(null);
    }

    return isValid;
  };

  const handleSubmit = () => {
    if (validatePassword()) {
      // Submit form if validation passes
      console.log('Form submitted');
    }
  };

  return (
    <>
      <Card className="max-w-md mx-auto my-10">
        <CardBody className="dark:bg-gray-900 dark:text-white dark:border dark:rounded">
          <div className="mb-6">
            <label
              htmlFor="old-password"
              className="dark:text-white block text-gray-700 font-medium mb-2"
            >
              Old Password*
            </label>
            <div className="relative">
              <input
                className="appearance-none block w-full border border-gray-400 rounded py-2 px-3 leading-tight focus:outline-none bg-gray-100 dark:bg-gray-900 dark:focus:bg-gray-900 dark:text-gray-400"
                id="old-password"
                type={showOldPass ? 'text' : 'password'}
                value={oldPassword}
                onChange={(e) => {
                  setOldPassword(e.target.value);
                  setOldPasswordError(null);
                }}
              />
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => handleShowPass('old')}
              >
                {showOldPass ? (
                  <EyeIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
            {oldPasswordError && <p className="text-red-500 text-sm mt-1">{oldPasswordError}</p>}
          </div>
          <div className="mb-6">
            <label
              htmlFor="new-password"
              className="dark:text-white block text-gray-700 font-medium mb-2"
            >
              New Password*
            </label>
            <div className="relative">
              <input
                className="appearance-none block w-full border border-gray-400 rounded py-2 px-3 mb-3 leading-tight focus:outline-none bg-gray-100 dark:bg-gray-900 dark:focus:bg-gray-900 dark:text-gray-400"
                id="new-password"
                type={showNewPass ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setNewPasswordError(null);
                }}
              />
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => handleShowPass('new')}
              >
                {showNewPass ? (
                  <EyeIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
            {newPasswordError && <p className="text-red-500 text-sm mt-1">{newPasswordError}</p>}
          </div>
          <div className="mb-6">
            <label
              htmlFor="confirm-password"
              className="dark:text-white block text-gray-700 font-medium mb-2"
            >
              Confirm Password*
            </label>
            <div className="relative">
              <input
                className="appearance-none block w-full border border-gray-400 rounded py-2 px-3 mb-3 leading-tight focus:outline-none bg-gray-100 dark:bg-gray-900 dark:focus:bg-gray-900 dark:text-gray-400"
                id="confirm-password"
                type={showConfirmPass ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setConfirmPasswordError(null);
                }}
              />
              <div
                className="absolute inset-y-0 right-0 flex items-center pr-3 cursor-pointer"
                onClick={() => handleShowPass('confirm')}
              >
                {showConfirmPass ? (
                  <EyeIcon className="h-5 w-5 text-blue-500" />
                ) : (
                  <EyeSlashIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
            {confirmPasswordError && (
              <p className="text-red-500 text-sm mt-1">{confirmPasswordError}</p>
            )}
          </div>
          <button className="saveButton" onClick={handleSubmit}>
            Save
          </button>
        </CardBody>
      </Card>
    </>
  );
};

export default Layout(PasswordUpdate);
