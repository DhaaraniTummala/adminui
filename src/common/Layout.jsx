import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';

const Layout = ({ children }) => {
  return (
    <div>
      <Navbar />
      {children}
      <div
        className="px-8 p-2 mt-[100px]  w-[100%]"
        style={{ borderTop: '1px solid rgba(28, 28, 28, 0.2)' }}
      >
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
