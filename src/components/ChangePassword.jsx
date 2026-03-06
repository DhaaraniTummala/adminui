import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import secureStorage from '../utils/secureStorage';
import { ReduxHelper } from '../core/redux-helper';
import SuccessModal from './common/SuccessModal';

const ChangePassword = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const changePassword_result = useSelector((state) => state?.changePassword);
  
  const [drawer, setDrawer] = useState(false);
  const handleToggle = () => setDrawer(!drawer);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState({});
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  
  // Loading state comes from Redux
  const loading = changePassword_result?.loading || false;

  // Handle Redux state changes
  useEffect(() => {
    if (changePassword_result?.data) {
      const { success, result, message } = changePassword_result.data;
      
      if (success && result) {
        // Password change successful
        setShowSuccessModal(true);
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setErrors({});
      } else if (success && !result) {
        // Password change failed (old password mismatch)
        setErrors(prev => ({
          ...prev,
          oldPassword: message || 'Old password not matched'
        }));
      } else {
        // Unexpected response
        setErrors(prev => ({
          ...prev,
          oldPassword: 'Failed to change password. Please try again.'
        }));
      }
    } else if (changePassword_result?.error) {
      // API error
      setErrors(prev => ({
        ...prev,
        oldPassword: 'Failed to change password. Please try again.'
      }));
    }
  }, [changePassword_result]);

  // Reset Redux state on component unmount
  useEffect(() => {
    return () => {
      dispatch(ReduxHelper.Actions.resetChangePassword());
    };
  }, [dispatch]);

  const validateForm = () => {
    const newErrors = {};

    if (!oldPassword.trim()) {
      newErrors.oldPassword = 'Old password is required';
    }

    if (!newPassword.trim()) {
      newErrors.newPassword = 'New password is required';
    } else if (newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
      newErrors.newPassword = 'Password must contain uppercase, lowercase, and number';
    }

    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (newPassword !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (oldPassword === newPassword) {
      newErrors.newPassword = 'New password must be different from old password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validateForm()) {
      return;
    }

    // Clear any existing old password errors before making API call
    setErrors(prev => ({
      ...prev,
      oldPassword: null
    }));

    // Get user email from secure storage
    const userInfo = JSON.parse(secureStorage.getItem('userInfo') || '{}');
    const email = userInfo.Email || secureStorage.getItem('email') || 'shaikhzeeshan@gmail.com';
    
    const payload = {
      Email: email,
      Password: oldPassword,
      NewPassword: newPassword
    };
    
    dispatch(ReduxHelper.Actions.changePassword(payload));
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Navigate back only after modal is closed
    navigate(-1);
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="flex relative h-screen overflow-hidden dark:bg-gray-900">
      {/* Sidebar */}
      <section
        id="sidebar"
        style={{ width: '22%', margin: '-8px' }}
        className={`w-80 z-50 lg:w-80 md:w-80 border-gray-200 bg-white p-2 md:static absolute h-full border-r dark:bg-black dark:border-r dark:border-gray-800 ${
          drawer ? 'md:hidden left-0' : '-left-full'
        }`}
      >
        <Sidebar handleToggle={handleToggle} />
      </section>

      {/* Main Content */}
      <section className="overflow-auto h-full w-full bg-[rgb(247,245,250)]">
        <Navbar handleToggle={handleToggle} drawer={drawer} />
        
        <div className="flex items-center justify-center p-4" style={{ fontFamily: 'Poppins, sans-serif', minHeight: 'calc(100vh - 80px)' }}>
          <div className="w-full max-w-md">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {/* Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Change Password</h2>
            <p className="text-sm text-gray-600">
              Please enter your current password and choose a new password
            </p>
          </div>

          {/* Form */}
          <div className="space-y-5">
            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Old Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showOldPassword ? 'text' : 'password'}
                  value={oldPassword}
                  onChange={(e) => {
                    setOldPassword(e.target.value);
                    setErrors({ ...errors, oldPassword: null });
                  }}
                  placeholder="Enter old password"
                  className={`w-full px-4 py-2.5 border ${
                    errors.oldPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
                <button
                  type="button"
                  onClick={() => setShowOldPassword(!showOldPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showOldPassword ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.oldPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.oldPassword}</p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => {
                    setNewPassword(e.target.value);
                    setErrors({ ...errors, newPassword: null });
                  }}
                  placeholder="Enter new password"
                  className={`w-full px-4 py-2.5 border ${
                    errors.newPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showNewPassword ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Must be at least 8 characters with uppercase, lowercase, and number
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                    setErrors({ ...errors, confirmPassword: null });
                  }}
                  placeholder="Confirm new password"
                  className={`w-full px-4 py-2.5 border ${
                    errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                  } rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeIcon className="h-5 w-5" />
                  ) : (
                    <EyeSlashIcon className="h-5 w-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                style={{ backgroundColor: loading ? '#9CA3AF' : '#7F56D9' }}
                onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#6D28D9')}
                onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#7F56D9')}
              >
                {loading ? 'Changing...' : 'Change Password'}
              </button>
            </div>
          </div>
        </div>
      </div>
        </div>
      </section>

      {/* Success Modal */}
      <SuccessModal
        open={showSuccessModal}
        onClose={handleSuccessModalClose}
        title="Password Changed Successfully!"
        iconType="success"
      />
    </div>
  );
};

export default ChangePassword;
