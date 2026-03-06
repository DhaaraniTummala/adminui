import React from 'react';
import PropTypes from 'prop-types';
import { Dropdown, Menu } from 'antd';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import '../index.css';

const DropOption = ({ onMenuClick, menuOptions = [], buttonStyle, dropdownProps }) => {
  const menu = (
    <Menu
      className="dark:bg-gray-800 dark:border bg-white"
      style={{ marginTop: '5px' }}
      onClick={onMenuClick}
    >
      {menuOptions.map((item) => (
        <Menu.Item key={item.key}>{item.name}</Menu.Item>
      ))}
    </Menu>
  );

  const MoreVertIconStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    marginTop: '8px',
  };

  return (
    <Dropdown overlay={menu} {...dropdownProps}>
      <div style={MoreVertIconStyle}>
        <MoreVertIcon />
      </div>
    </Dropdown>
  );
};

DropOption.propTypes = {
  onMenuClick: PropTypes.func,
  menuOptions: PropTypes.array.isRequired,
  buttonStyle: PropTypes.object,
  dropdownProps: PropTypes.object,
};

export default DropOption;
