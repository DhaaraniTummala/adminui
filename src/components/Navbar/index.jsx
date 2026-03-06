import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HiOutlineSearch } from 'react-icons/hi';
import secureStorage from '../../utils/secureStorage';

const Navbar = (props) => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(false);
  const [userProfile, setUserProfile] = useState({});
  const login_result = useSelector((state) => state?.login);
  const { handleToggle, drawer } = props;

  useEffect(() => {
    const loadUserData = () => {
      // First try to get from login result
      if (login_result?.data?.userInfo) {
        const { Email, UserId, Name } = login_result.data.userInfo;
        setUserProfile({
          Email,
          UserId,
          Name,
        });
        // Store in secure storage
        secureStorage.setItem('email', Email);
        secureStorage.setItem('userId', UserId);
        secureStorage.setItem('userName', Name);
      } else {
        // If not in login result, try to get from secureStorage
        try {
          // First try to get from userInfo object
          const storedUserInfo = secureStorage.getItem('userInfo');
          if (storedUserInfo) {
            const userInfo =
              typeof storedUserInfo === 'string' ? JSON.parse(storedUserInfo) : storedUserInfo;

            setUserProfile({
              Email: userInfo.Email || userInfo.email || '',
              UserId: userInfo.UserId || userInfo.userId || '',
              Name: userInfo.Name || userInfo.name || userInfo.userName || '',
            });
          } else {
            // Fallback to individual fields if userInfo object doesn't exist
            const email = secureStorage.getItem('email');
            const name = secureStorage.getItem('userName');
            const userId = secureStorage.getItem('userId');

            if (email || name || userId) {
              setUserProfile({
                Email: email || '',
                UserId: userId || '',
                Name: name || '',
              });
            }
          }
        } catch (e) {
          console.error('Error parsing user info:', e);
        }
      }
    };

    loadUserData();
  }, [login_result]);

  const showProfile = () => {
    setProfile(!profile);
  };

  const userProfileSetting = () => {
    navigate('/userProfileUpdate');
  };

  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-end sticky top-0  z-50">
      {/* Search Bar */}
      {/* <div className="flex-1 max-w-md">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <img src="search-normal.png" alt="" className="h-5 w-5 text-gray-500" />
          </div>
          <input
            type="text"
            placeholder="Search..."
            className="block  pl-10 pr-3 py-2 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
        </div>
      </div> */}

      {/* Right Section */}
      <div className="flex items-center space-x-4">
        {/* <img
          src="NotificationNav.svg"
          alt="Notification"
          className="w-8 h-8 object-cover cursor-pointer"
        /> */}

        {/* User Profile */}
        <div className="relative">
          <div onClick={showProfile} className="flex items-center space-x-3 cursor-pointer">
            {/* <img src="Frame 427320091.png" alt="Profile" className="w-8 h-8 object-cover" /> */}
            <div className="text-sm">
              <div className="font-medium text-gray-900">{userProfile.Name || 'Jane Cooper'}</div>
              <div className="text-gray-500">
                {userProfile.Email || secureStorage.getItem('email') || 'jane@example.com'}
              </div>
            </div>
            <svg
              className="w-4 h-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M19 9l-7 7-7-7"
              ></path>
            </svg>
          </div>

          {profile && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                {/* <button
                  onClick={userProfileSetting}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                  My Profile
                </button> */}
                <hr className="border-gray-200" />
                <button
                  onClick={() => {
                    setProfile(false);
                    navigate('/change-password');
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 11c0-1.657 1.343-3 3-3s3 1.343 3 3v1h1a2 2 0 012 2v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5a2 2 0 012-2h1v-1a5 5 0 1110 0v1"
                    />
                  </svg>
                  Change Password
                </button>
                <hr className="border-gray-200" />
                <button
                  onClick={() => {
                    secureStorage.clear();
                    sessionStorage.clear();
                    navigate('/');
                  }}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                >
                  <svg
                    className="w-4 h-4 mr-3"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    ></path>
                  </svg>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
