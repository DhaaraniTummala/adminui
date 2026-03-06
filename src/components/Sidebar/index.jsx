import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import * as MdIcons from 'react-icons/md';
import secureStorage from '../../utils/secureStorage';

export default function Sidebar({ handleToggle }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [activeParent, setActiveParent] = useState('Dashboard');
  const [menuData, setMenuData] = useState([]);
  const [baseUrl, setBaseUrl] = useState('');

  useEffect(() => {
    const storedMenu = secureStorage.getItem('menu2');
    if (storedMenu) {
      try {
        const parsed = JSON.parse(storedMenu);

        if (parsed.Menu && parsed.Menu.length > 0) {
          if (parsed.Menu[0].Misc && parsed.Menu[0].Misc.length > 0) {
            setBaseUrl(parsed.Menu[0].Misc[0].IconUrl || '');
          }
          setMenuData(parsed.Menu[0].PlantMenu || []);
        }
      } catch (err) {
        console.error('Error parsing menu2:', err);
      }
    }
  }, []);

  const parents = [
    ...(menuData || []).map((menu) => {
      return {
        id: menu.LinkUrl?.replace(/\s+/g, ''),
        name: menu.DisplayName,
        //IconUrl + IconPath
        icon:
          baseUrl && menu.IconPath ? (
            <img
              src={`${baseUrl}${menu.IconPath}`}
              alt={menu.LinkUrl}
              className="w-6 h-6 brightness-0 invert"
              style={{ filter: 'brightness(0) invert(1)' }}
            />
          ) : null,
      };
    }),
  ];

  useEffect(() => {
    if (pathname === '/Dashboard' || pathname === '/dashboard') {
      setActiveParent('Dashboard');
    } else {
      const parts = pathname.split('/').filter(Boolean);
      if (parts.length > 0) {
        const firstPart = parts[0];
        // Check if the first part matches any menu item
        const matchesMenu = menuData.some(
          (menu) => menu.LinkUrl?.replace(/\s+/g, '') === firstPart,
        );

        // If it matches a menu, set it as active, otherwise keep Dashboard as default
        if (matchesMenu) {
          setActiveParent(firstPart);
        } else {
          // For non-menu pages (like change-password, userProfileUpdate, etc.), keep Dashboard active
          setActiveParent('Dashboard');
        }
      }
    }
  }, [pathname, menuData]);

  return (
    <div className="flex h-screen font-jakarta">
      {/* Left Purple Sidebar */}
      <div className="bg-[#6941C6] flex flex-col items-center relative" style={{ width: '4rem' }}>
        {/* Logo - positioned at top with navbar height (py-4 = 16px top + 16px bottom = 32px, plus content height) */}
        <div
          className="flex flex-col items-center justify-center"
          style={{ height: '72px', paddingTop: '8px', paddingBottom: '8px' }}
        >
          <img src="New-Palntiqx.svg" alt="Logo" className="w-10 h-10 mb-2" />
          <div className="w-10 border-b border-purple-300"></div>
        </div>

        {/* Parent Icons - aligned with content */}
        <div className="flex flex-col space-y-6 items-center" style={{ marginTop: '16px' }}>
          {parents.map((parent) => (
            <div key={parent.id} className="flex flex-col items-center">
              <div
                onClick={() => {
                  setActiveParent(parent.id);
                  if (parent.id === 'Dashboard') {
                    navigate('/Dashboard');
                  } else {
                    navigate('/' + parent.id);
                  }
                }}
                className={`relative flex items-center justify-center w-11 h-11 rounded-xl cursor-pointer group
                  ${
                    activeParent === parent.id
                      ? 'bg-[#b299eb] text-white'
                      : 'text-white hover:bg-[#b299eb]'
                  }`}
              >
                {parent.icon}
                {/* Tooltip */}
                <span
                  className="absolute left-14 px-2 py-1 bg-black text-white text-xs rounded opacity-0 
                  group-hover:opacity-100 transition-opacity whitespace-nowrap"
                  style={{ pointerEvents: 'none' }}
                >
                  {parent.name}
                </span>
              </div>

              {/* Active menu name below icon */}
              {activeParent === parent.id && (
                <span className="text-white text-[10px] mt-1 text-center font-medium">
                  {parent.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Right White Sidebar */}
      <div className="w-[220px] h-screen flex flex-col border-l border-gray-200 bg-white">
        {/* Header - matches navbar height with padding */}
        <div className="px-6 py-4 flex justify-between items-center border-b">
          <h1
            onClick={() => {
              navigate('/Dashboard');
              setActiveParent('Dashboard');
            }}
            className="text-xl font-semibold text-blue-600 cursor-pointer truncate"
          >
            <img src="PlantiqX-final-logo.png" alt="" style={{ width: '151px', height: '40px' }} />
          </h1>
          <MdIcons.MdClose
            onClick={handleToggle}
            className="text-gray-600 text-xl md:hidden cursor-pointer"
          />
        </div>

        {/* Submenus - aligned with content */}
        <div
          className="flex-1"
          style={{ paddingTop: '35px', paddingLeft: '24px', paddingRight: '24px' }}
        >
          <div className="w-full">
            {activeParent === 'Dashboard' ? (
              <div
                onClick={() => navigate('/Dashboard')}
                className={`px-3 py-2 rounded-md cursor-pointer flex items-center transition-all duration-200 
                ${
                  pathname === '/Dashboard'
                    ? 'bg-[#6941C6] text-[#fff] border-r-2 border-[#6941C6]'
                    : 'text-[#475467] hover:bg-[#FCFAFF]'
                } `}
              >
                <span className="text-sm font-medium">Dashboard</span>
              </div>
            ) : (
              menuData
                .filter((menu) => menu.LinkUrl?.replace(/\s+/g, '') === activeParent)
                .map((menu) => (
                  <div key={menu.PlantMenuId}>
                    {menu.PlantMenuSub?.map((sub) => {
                      const subPath = `/${menu.LinkUrl.replace(/\s+/g, '')}/${sub.LinkUrl}`;
                      const isActive = pathname === subPath || pathname.startsWith(subPath + '/');
                      const subIcon = sub.IconPath ? `${baseUrl}${sub.IconPath}` : null;

                      return (
                        <div
                          key={sub.PlantMenuId}
                          className={`px-2 py-3 rounded-md cursor-pointer text-sm transition-all duration-200 flex items-center gap-1
      ${
        isActive
          ? 'bg-[#6941C6] text-[#fff] border-r-2 border-[#6941C6] font-medium'
          : 'text-gray-700 hover:text-[#7F56D9] hover:bg-[#FCFAFF] font-normal'
      }`}
                          onClick={() => navigate(subPath)}
                        >
                          {/* Submenu Icon */}
                          {subIcon && (
                            <img
                              src={subIcon}
                              alt={sub.LinkUrl}
                              className="w-5 h-5"
                              style={{
                                filter: isActive
                                  ? 'brightness(0) invert(1)'
                                  : 'invert(41%) sepia(0%) saturate(0%) hue-rotate(0deg) brightness(97%) contrast(90%)',
                              }}
                            />
                          )}

                          <span className="whitespace-nowrap text-[12px]">{sub.DisplayName}</span>
                        </div>
                      );
                    })}
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
