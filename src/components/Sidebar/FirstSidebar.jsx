import React from 'react';
import { MdDashboard, MdSettings, MdAssignment } from 'react-icons/md';
import { FaUsers, FaBox, FaTools } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import menuData from '../Sidebar/menuData.json';

export default function FirstSidebar({ activeParent, setActiveParent }) {
  const navigate = useNavigate();

  const parentIcons = {
    Admin: <FaUsers />,
    AssetManagement: <FaBox />,
    Settings: <MdSettings />,
    WorkOrders: <MdAssignment />,
    Reports: <FaTools />,
  };

  const parents = [
    { id: 'dashboard', name: 'Dashboard', icon: <MdDashboard /> },
    ...menuData.PlantMenu.map((menu) => ({
      id: menu.Menu,
      name: menu.Menu,
      icon: parentIcons[menu.Menu] || <MdSettings />, // fallback
    })),
  ];

  return (
    <div className="w-20 bg-[#6941C6] flex flex-col items-center py-6 font-jakarta">
      <div className="flex flex-col items-center">
        <img src="main_logo.png" alt="Logo" className="w-10 h-10 mb-4" />

        <div className="w-10 border-b" style={{ borderColor: '#9E77ED' }}></div>
      </div>

      <div className="mt-4 flex flex-col items-center space-y-4">
        {parents.map((parent) => {
          const isActiveParent = activeParent === parent.id;

          return (
            <div
              key={parent.id}
              onClick={() => {
                if (parent.id === 'dashboard') {
                  navigate('/dashboard');
                }
                setActiveParent(parent.id);
              }}
              className={`w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-all duration-300
                ${
                  isActiveParent
                    ? 'bg-[#9E77ED] text-white'
                    : 'text-white hover:bg-[#9E77ED] hover:text-white'
                }`}
            >
              <div className="text-xl">{parent.icon}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
