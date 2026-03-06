import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import LoginPage from '../pages/auth/LoginPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import VerificationCodePage from '../pages/auth/VerificationCodePage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import AcceptTermPage from '../pages/auth/AcceptTermPage';
import Organization from '../pages/dashboard/Organization';
import NewOrganization from '../pages/dashboard/NewOrganization';
import ProjectsPage from '../pages/dashboard/Projects';
import ProjectDetailsPage from '../pages/dashboard/ProjectDetails';
import UsersPage from '../pages/dashboard/UsersPage';
import ProjectPage from '../pages/dashboard/ProjectPage';
import SignupPage from '../pages/auth/SignupPage';
import Screen3 from '../common/Screen3';
import ProjectTablePage from '../pages/dashboard/ProjectTablePage';
import Dashboard from '../pages/dashboard/Dashboard';
import MuiComponents from '../Material-UI';
import CardsLayout from '../components/CardsLayout';
import EnhancedDynamicBaseView from '../components/EnhancedDynamicBaseView';
import '../views/custom';
import { Forms } from '../maiden-core';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import Layout from '../components/Layout';
import PasswordUpdate from '../pages/dashboard/UserProfile/PasswordUpdate';
import UserProfileUpdate from '../pages/dashboard/UserProfile/UserProfileUpdate';
import ChangePassword from '../components/ChangePassword';
import UploadPDF from '../pages/dashboard/UploadPDF';
import CubeWiki from '../pages/dashboard/CubeWiki';
import NewActivity from '../pages/dashboard/NewActivity';
import Chat from '../components/Chat';
import MultiQueryResult from '../components/MultiQueryResult';
import Bridgemate from '../Bridgemate';
import AdjustStore from '../components/AdjustStore';
import ScouterScreens from '../screens';
import MapComponent from '@/pages/Map';
import OfferPostDetail from '@/screens/2f811577-56ec-4bdf-8e3c-6190fdc63ba8/OfferPostDetail';
import secureStorage from '../utils/secureStorage';
import PreventiveMaintenance from '../views/custom/PreventiveMaintenance';
import PMList from '../views/custom/PMList';
import VisitorDashboard from '../layouts/VisitorsDashboard';

const DynamicComponent = ({ identifier, tableName }) => {
  const [drawer, setDrawer] = useState(false);
  const handleToggle = () => setDrawer(!drawer);

  const location = useLocation();
  const uniqueKey = `${tableName}-${location.pathname}${location.search}`;

  return (
    <div className="flex relative h-screen overflow-hidden dark:bg-gray-900">
      <section
        id="sidebar"
        style={{ width: '22%', margin: '-8px' }}
        className={`w-80 z-50 lg:w-80  md:w-80  border-gray-200 bg-white p-2 md:static absolute h-full border-r dark:bg-black dark:border-r dark:border-gray-800 ${
          drawer ? 'md:hidden left-0' : '-left-full'
        }`}
      >
        <Sidebar handleToggle={handleToggle} />
      </section>

      <section className="overflow-auto h-full w-full bg-[rgb(247,245,250)]">
        <Navbar handleToggle={handleToggle} drawer={drawer} />
        <div className="p-4 h-auto">
          <EnhancedDynamicBaseView key={uniqueKey} identifier={identifier} tableName={tableName} />
        </div>
      </section>
    </div>
  );
};

const AllRoutes = [
  { name: 'Login', path: '/', element: <LoginPage />, private: false },
  {
    name: 'VisitorDashboard',
    path: '/VisitorDashboard',
    element: <VisitorDashboard />,
    private: false,
  },
  {
    name: 'ForgotPassword',
    path: '/forgot-password',
    element: <ForgotPasswordPage />,
    private: false,
  },
  {
    name: 'VerificationCode',
    path: '/verification-code',
    element: <VerificationCodePage />,
    private: false,
  },
  {
    name: 'ResetPassword',
    path: '/reset-password',
    element: <ResetPasswordPage />,
    private: false,
  },
  { name: 'Map', path: '/map', element: <MapComponent />, private: false },
  { name: 'Signup', path: '/signup', element: <SignupPage />, private: false },
  { name: 'Scree3', path: '/screen3', element: <Screen3 />, private: false },
  { name: 'Forms', path: '/forms', element: <Forms />, private: false },
  { name: 'password', path: '/password', element: <PasswordUpdate />, private: false },
  { name: 'changePassword', path: '/change-password', element: <ChangePassword />, private: false },
  { name: 'bridgemate', path: '/bridgemate', element: <Bridgemate />, private: false },
  {
    name: 'userProfileUpdate',
    path: '/userProfileUpdate',
    element: <UserProfileUpdate />,
    private: false,
  },
  { name: 'AdjustStore', path: '/adjuststore', element: <AdjustStore />, private: false },
  {
    name: 'NewOrganization',
    path: '/neworganization',
    element: <NewOrganization />,
    private: false,
  },
  { name: 'Dashboard', path: '/Dashboard', element: <Dashboard />, private: false },
  {
    name: 'PreventiveMaintenance',
    path: '/Asset/PreventiveMaintenance',
    element: <PreventiveMaintenance />,
    private: false,
  },
  {
    name: 'PMList',
    path: '/pm-list',
    element: <PMList />,
    private: false,
  },
  {
    name: 'CheckList',
    path: '/Asset/CheckList',
    element: <DynamicComponent identifier="CheckList" tableName="10821" />,
    private: false,
  },
  { name: 'MuiComponents', path: '/muiComponents', element: <MuiComponents />, private: false },
  { name: 'AcceptTerm', path: '/acceptterm', element: <AcceptTermPage />, private: false },
  { name: 'Organization', path: '/organization', element: <Organization />, private: false },
  { name: 'Project', path: '/projects', element: <ProjectPage />, private: false },
  { name: 'ProjectTable', path: '/projectTable', element: <ProjectTablePage />, private: false },
  { name: 'ProjectsPage', path: '/projectsPage', element: <ProjectsPage />, private: false },
  {
    name: 'Dashboard',
    path: '/ProjectDetailsPage',
    element: <ProjectDetailsPage />,
    private: false,
  },
  { name: 'UserPage', path: '/userpage', element: <UsersPage />, private: false },
  {
    name: 'OfferPostDetails',
    path: '/Enhancers/OfferPostDetails',
    element: <OfferPostDetail />,
    private: false,
  },
  {
    name: 'userProfileUpdate',
    path: '/userProfileUpdate',
    element: <UserProfileUpdate />,
    private: false,
  },

  {
    name: 'AdjustStore',
    path: '/adjuststore',
    element: <AdjustStore />,
    private: false,
  },

  {
    name: 'NewOrganization',
    path: '/neworganization',
    element: <NewOrganization />,
    private: false,
  },
  {
    name: 'Dashboard',
    path: '/dashboard',
    element: <Dashboard />,
    private: false,
  },
  {
    name: 'MuiComponents',
    path: '/muiComponents',
    element: <MuiComponents />,
    private: false,
  },
  {
    name: 'AcceptTerm',
    path: '/acceptterm',
    element: <AcceptTermPage />,
    private: false,
  },
  {
    name: 'Organization',
    path: '/organization',
    element: <Organization />,
    private: false,
  },
  {
    name: 'Project',
    path: '/projects',
    element: <ProjectPage />,
    private: false,
  },
  {
    name: 'ProjectTable',
    path: '/projectTable',
    element: <ProjectTablePage />,
    private: false,
  },
  {
    name: 'ProjectsPage',
    path: '/projectsPage',
    element: <ProjectsPage />,
    private: false,
  },
  // { name: "Dashboard", path: "/dashboard", element: <Dashboard />, private: false },
  {
    name: 'Dashboard',
    path: '/ProjectDetailsPage',
    element: <ProjectDetailsPage />,
    private: false,
  },

  {
    name: 'UserPage',
    path: '/userpage',
    element: <UsersPage />,
    private: false,
  },

  {
    name: 'OfferPostDetails',
    path: '/Enhancers/OfferPostDetails',
    element: <OfferPostDetail />,
    private: false,
  },
];

const Components = {
  Chat,
  UploadPdf: UploadPDF,
  MultiQueryResult,
  CubeWiki,
  NewActivity,
};

if (secureStorage.getItem('organizationId') === '2f811577-56ec-4bdf-8e3c-6190fdc63ba8') {
  for (var key in ScouterScreens) {
    Components[key] = ScouterScreens[key];
  }
}

function generateRoutesFromMenu(menuItem, parentPath = '') {
  const routes = [];
  const currentPath = parentPath + '/' + (menuItem.LinkUrl || menuItem.LinkUrl.replace(/\s+/g, ''));

  if (menuItem.PlantMenuSubCard && menuItem.PlantMenuSubCard.length > 0) {
    routes.push({
      name: menuItem.LinkUrl,
      path: currentPath,
      element: <CardsLayout item={menuItem} parentPath={parentPath} />,
      private: false,
    });

    menuItem.PlantMenuSubCard.forEach((card) => {
      const cardPath = currentPath + '/' + (card.LinkUrl || card.LinkUrl.replace(/\s+/g, ''));
      routes.push({
        name: card.LinkUrl,
        path: cardPath,
        element: <DynamicComponent identifier={card.LinkUrl} tableName={card.TableName} />,
        private: false,
      });
    });
  } else if (menuItem.TableName) {
    routes.push({
      name: menuItem.LinkUrl,
      path: currentPath,
      element: <DynamicComponent identifier={menuItem.LinkUrl} tableName={menuItem.TableName} />,
      private: false,
    });
  } else if (menuItem.LinkUrl === 'Dashboard') {
    routes.push({
      name: menuItem.LinkUrl,
      path: currentPath,
      element: <VisitorDashboard />,
      private: false,
    });
  } else if (menuItem.PlantMenuSub && menuItem.PlantMenuSub.length > 0) {
    routes.push({
      name: menuItem.LinkUrl,
      path: currentPath,
      element: <Dashboard />,
      private: false,
    });
  } else {
    routes.push({
      name: menuItem.LinkUrl,
      path: currentPath,
      element: <CardsLayout item={menuItem} parentPath={parentPath} />,
      private: false,
    });
  }

  if (menuItem.PlantMenuSub && menuItem.PlantMenuSub.length > 0) {
    menuItem.PlantMenuSub.forEach((sub) => {
      routes.push(...generateRoutesFromMenu(sub, currentPath));
    });
  }

  return routes;
}

if (secureStorage.getItem('menu2') !== null) {
  let parsed = JSON.parse(secureStorage.getItem('menu2') || '{}');
  let menu2 = [];

  if (parsed.Menu && parsed.Menu.length > 0) {
    menu2 = parsed.Menu[0].PlantMenu || [];
  }

  if (Array.isArray(menu2)) {
    menu2.forEach((menuItem) => {
      AllRoutes.push(...generateRoutesFromMenu(menuItem));
    });
  } else {
    console.error('menu2 is not an array:', menu2);
  }
}

export default AllRoutes;
