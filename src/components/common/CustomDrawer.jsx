import React from 'react';
import { Drawer } from 'antd';
import { Box } from '@mui/material';

/**
 * Generic custom drawer component with consistent styling
 * @param {Object} props - Component props
 * @param {boolean} props.open - Whether drawer is open
 * @param {Function} props.onClose - Close handler
 * @param {string} props.title - Drawer title
 * @param {React.ReactNode} props.children - Drawer content
 * @param {string} [props.width] - Drawer width (default: 'calc(100vw - 60px)')
 * @param {string} [props.placement] - Drawer placement (default: 'right')
 * @param {boolean} [props.destroyOnClose] - Destroy content on close (default: true)
 * @param {Object} [props.headerStyle] - Custom header styles
 * @param {Object} [props.bodyStyle] - Custom body styles
 * @param {Object} [props.containerStyle] - Custom container styles
 * @returns {JSX.Element} - Rendered drawer component
 */
const CustomDrawer = ({
  open,
  onClose,
  title,
  children,
  width = 'calc(100vw - 60px)',
  placement = 'right',
  destroyOnClose = true,
  headerStyle = {},
  bodyStyle = {},
  containerStyle = {},
  zIndex,
}) => {
  // Default styles
  const defaultHeaderStyle = {
    padding: '24px 24px',
    borderBottom: '1px solid #e5e7eb',
    backgroundColor: 'rgba(105, 65, 198, 1)',
    borderRadius: '8px 8px 0 0',
    textAlign: 'center',
    color: '#ffffff',
    ...headerStyle,
  };

  const defaultBodyStyle = {
    padding: '0',
    backgroundColor: '#ffffff',
    fontSize: '16px',
    borderRadius: '0 0 8px 8px',
    overflowY: 'auto',
    height: 'calc(100vh - 140px)', // Account for header and margins
    ...bodyStyle,
  };

  const defaultContainerStyle = {
    padding: '0',
    ...containerStyle,
  };

  return (
    <>
      <style>{`
        .custom-drawer-header .ant-drawer-header {
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }
        .custom-drawer-header .ant-drawer-header .ant-drawer-title {
          flex: 1 !important;
          text-align: center !important;
        }
        .custom-drawer-header .ant-drawer-header .ant-drawer-close {
          position: absolute !important;
          right: 24px !important;
          color: #fff !important;
        }
        .custom-drawer-header .ant-drawer-body {
          overflow-y: auto !important;
          height: calc(100vh - 140px) !important;
          padding: 0 !important;
        }
      `}</style>
      <Drawer
        open={open}
        onClose={onClose}
        width={width}
        placement={placement}
        className="form-drawer custom-drawer-header"
        destroyOnClose={destroyOnClose}
        closable={true}
        title={title}
        zIndex={zIndex}
        style={{
          top: '20px',
          height: 'calc(100vh - 40px)',
          left: '40px',
        }}
        drawerStyle={{
          borderRadius: '8px',
          margin: '10px 0 20px 0',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        }}
        headerStyle={defaultHeaderStyle}
        bodyStyle={defaultBodyStyle}
      >
        {children}
      </Drawer>
    </>
  );
};

export default CustomDrawer;
