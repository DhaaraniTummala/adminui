import React, { useState } from 'react';
import Sidebar from '../Sidebar';
import Navbar from '../Navbar';

const Layout = (Child) => {
  return function Component(props) {
    const [drawer, setDrawer] = useState(false);
    const handleToggle = () => setDrawer(!drawer);

    return (
      <div className="flex relative h-screen overflow-hidden dark:bg-red-100">
        {/* Sidebar */}
        <section
          id="sidebar"
          style={{ margin: '-8px' }}
          className={`w-80 z-50 lg:w-80  md:w-80  border-gray-200 bg-white p-2 md:static absolute h-full border-r dark:bg-black dark:border-r dark:border-gray-800 ${
            drawer ? 'md:hidden left-0' : '-left-full'
          }`}
        >
          <Sidebar handleToggle={handleToggle} />
        </section>

        {/* Navbar & Child */}
        <section className="overflow-auto h-full w-full bg-white">
          <Navbar handleToggle={handleToggle} drawer={drawer} />
          <div className="p-4 min-h-full bg-white dark:bg-gray-900">
            <Child {...props} className="dark:bg-gray-700" />
          </div>
        </section>
      </div>
    );
  };
};

export default Layout;
