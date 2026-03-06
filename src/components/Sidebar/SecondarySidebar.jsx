import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import DashbordIcon from '../../assets/DashbordIcon';
import DashbordIconActive from '../../assets/DashbordIconActive';
import { MdClose } from 'react-icons/md';
// import FirstSidebar from "./FirstSidebar";
import { MdDashboard, MdAssignment, MdWork, MdSettings } from 'react-icons/md';
import { FaUsers, FaProjectDiagram, FaBrain, FaClipboardList } from 'react-icons/fa';
import secureStorage from '../../utils/secureStorage';

export default function Sidebar({ handleToggle }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isCollapsed, setIsCollapsed] = useState(true);

  let menu = JSON.parse(secureStorage.getItem('menu') || '[]');

  const handleNavigate = (path) => navigate(path.replace(/\s+/g, '-'));

  // ---- ICON ----
  const iconMap = {
    'On Boarding': <FaClipboardList />,
    'Work Tracking': <MdWork />,
    'Asset Management': <MdDashboard />,
    'Entry Management': <MdAssignment />,
    'User Management': <FaUsers />,
    'Project Tracking': <FaProjectDiagram />,
    'AI Management': <FaBrain />,
  };

  /*
 Injecting Cards manually
 let manageFiles = [
   {
     cardText: 'Manage Files',
     children: null,
     displayText: 'Manage Files',
     hideCard: false,
     hideHeader: false,
     menuId: 'b340b97a-42a3-4718-a13f-0bc48b0a6f8f',
     subText: '',
     tableName: null,
     url: 'UploadPdf',
   },
 ];
 // Find the "AI Management" item and add "manageFiles" if not already present
 menu = menu.map((menuItem) => {
   if (menuItem.cardText === 'AI Management') {
     const foundManageFiles = menuItem.children?.some(
       (child) => child.cardText === 'Manage Files',
     );
     if (!foundManageFiles) {
       if (menuItem.children) {
         menuItem.children.push(...manageFiles);
       } else {
         menuItem.children = manageFiles;
       }
     }
   }
   return menuItem;
 });
 // Set the updated menu back in local storage
 secureStorage.setItem('menu', JSON.stringify(menu));
 */

  const UserProfileSetting = [
    { name: 'User Profile', path: '/userProfileUpdate', icon: <FaUsers /> },
    { name: 'Password', path: '/password', icon: <MdSettings /> },
  ];

  const navLinks = [
    {
      name: 'Dashboard',
      icon: <MdDashboard />,
      activeIcon: <MdDashboard />,
      path: '/dashboard',
    },
    /*{
      name: 'Tailwind Component',
      icon: <DashbordIcon />,
      activeIcon: <DashbordIconActive />,
      path: '/forms',
    },
    {
     name: 'Organization',
     icon: <DashbordIcon />,
     activeIcon: <DashbordIconActive />,
     path: '/OnBoarding/Organization',
   },
    {
      name: 'Projects',
      icon: <DashbordIcon />,
      activeIcon: <DashbordIconActive />,
      path: '/OnBoarding/Project',
    },
    {
      name: 'Material UI Component',
      icon: <DashbordIcon />,
      activeIcon: <DashbordIconActive />,
      path: '/muiComponents',
    },*/
  ];

  const navLinksModules = [];
  menu.forEach((menuItem) => {
    const sanitizedPaths = menuItem.url.replace(/\s+/g, '%20');

    let newNavItem = {
      name: menuItem.cardText,
      path: '/' + sanitizedPaths,
      icon: iconMap[menuItem.cardText] || <MdAssignment />,
      activeIcon: iconMap[menuItem.cardText] || <MdAssignment />,
    };

    //{
    //  name: "Reports",
    // icon: <DashbordIcon />,
    // activeIcon: <DashbordIconActive />,
    // path: "/Reports",
    //},

    // {
    //   name: "Masters",
    //   icon: <DashbordIcon />,
    //   activeIcon: <DashbordIconActive />,
    //   path: "/UserManagement",
    //   child: [
    //     {
    //       name: "User Management",
    //       path: "/userpage",
    //       icon: <SubIcons />,
    //       activeIcon: <SubIcons />,
    //     },
    //     {
    //       name: "Designations",
    //       path: "/Masters/UserManagement",
    //       icon: <SubIcons />,
    //       activeIcon: <SubIcons />,
    //     },
    //     {
    //       name: "Roles",
    //       path: "/Masters/UserManagement",
    //       icon: <SubIcons />,
    //       activeIcon: <SubIcons />,
    //     },
    //     {
    //       name: "Access Control",
    //       path: "/Masters/UserManagement",
    //       icon: <SubIcons />,
    //       activeIcon: <SubIcons />,
    //     },
    //   ],
    // },
    if (menuItem.children && menuItem.children.length > 0) {
      newNavItem.child = menuItem.children.map((childItem) => ({
        name: childItem.cardText,
        path: '/' + menuItem.cardText + '/' + childItem.url,
        icon: iconMap[childItem.cardText] || <MdAssignment />,
      }));
    }

    navLinksModules.push(newNavItem);
  });
  const isActive = (path) => pathname.startsWith(path);

  return (
    <div className="flex h-screen">
      {/* Right Sidebar */}
      <div className="w-80 h-screen flex flex-col border-l border-gray-200 bg-white">
        {/* Header */}
        <div className="px-4 py-3 flex justify-between items-center border-b">
          <h1
            onClick={() => navigate('/dashboard')}
            className="text-xl font-bold text-blue-600 cursor-pointer truncate"
          >
            MaidenCube
          </h1>
          <MdClose
            onClick={handleToggle}
            className="text-gray-600 text-xl md:hidden cursor-pointer"
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Main Section */}
          <div className="py-4">
            <div className="px-4 mb-2">
              <h3 className="text-xs font-semibold text-gray-600 uppercase">Main</h3>
            </div>
            <div className="space-y-1">
              {navLinks.map((item) => (
                <div
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className={`mx-2 px-3 py-2 rounded-md cursor-pointer transition-colors flex items-center ${
                    isActive(item.path)
                      ? 'bg-[#FCFAFF] text-[#7F56D9] border-r-2 border-[#6941C6]'
                      : 'text-[#475467] hover:bg-[#FCFAFF]'
                  }`}
                >
                  <div className="mr-3 flex items-center justify-center w-5 h-5">
                    {isActive(item.path) ? item.activeIcon : item.icon}
                  </div>
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Modules Section */}
          <div className="py-4">
            <div className="px-4 mb-2">
              <h3 className="text-xs font-semibold text-gray-600 uppercase">Modules</h3>
            </div>
            <div className="space-y-1">
              {navLinksModules.map((item) => (
                <div
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className={`mx-2 px-3 py-2 rounded-md cursor-pointer transition-colors flex items-center ${
                    isActive(item.path)
                      ? 'bg-[#FCFAFF] text-[#7F56D9] border-r-2 border-[#6941C6]'
                      : 'text-[#475467] hover:bg-[#FCFAFF]'
                  }`}
                >
                  <div className="mr-3 flex items-center justify-center w-5 h-5">{item.icon}</div>
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Profile Setting */}
          <div className="py-4">
            <div className="px-4 mb-2">
              <h3 className="text-xs font-semibold text-gray-600 uppercase">Profile Setting</h3>
            </div>
            <div className="space-y-1">
              {UserProfileSetting.map((item) => (
                <div
                  key={item.name}
                  onClick={() => handleNavigate(item.path)}
                  className={`mx-2 px-3 py-2 rounded-md cursor-pointer transition-colors flex items-center ${
                    isActive(item.path)
                      ? 'bg-[#FCFAFF] text-[#7F56D9] border-r-2 border-[#6941C6]'
                      : 'text-[#475467] hover:bg-[#FCFAFF]'
                  }`}
                >
                  <div className="mr-3 flex items-center justify-center w-5 h-5">{item.icon}</div>
                  <span className="text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                    {item.name}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
