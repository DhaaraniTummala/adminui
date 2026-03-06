import React from 'react';
import { Typography } from '@material-tailwind/react';
import { AppBar, Toolbar, InputBase, IconButton, Badge } from '@mui/material';
import {
  Search as SearchIcon,
  Notifications as NotificationsIcon,
  Settings as SettingsIcon,
} from '@mui/icons-material';

const Navbar = () => {
  return (
    <AppBar position="fixed" style={{ background: '#FFF' }} elevation={1}>
      <Toolbar className="flex flex-col md:flex-row justify-between items-center">
        <div className="flex items-center h-full">
          <Typography className="text-black  font-poppins mt-4 md:mt-0">Organization</Typography>
        </div>
        <div className="flex items-center mt-4 md:mt-0 h-full relative mb-2">
          <InputBase
            placeholder="Search"
            className="p-2 pl-5 rounded-l-lg focus:outline-none focus:bg-gray-900 h-11 text-[12px]"
            style={{ background: '#F7F9FB' }}
          />
          <div className="pl-3 flex items-center pointer-events-none mr-2">
            <SearchIcon
              className="text-black z-10 p-1 rounded-r-lg"
              style={{
                background: '#F7F9FB',
                width: '30px',
                height: '44px',
                cursor: 'pointer',
                marginLeft: '-12px',
              }}
            />
          </div>
          <IconButton
            color="default"
            className="ml-4"
            style={{ background: '#F7F9FB', borderRadius: '8px' }}
          >
            <Badge badgeContent={0} color="error">
              <NotificationsIcon />
            </Badge>
          </IconButton>
          <IconButton
            color="default"
            className="ml-2"
            style={{
              background: '#F7F9FB',
              borderRadius: '8px',
              marginLeft: '6px',
            }}
          >
            <SettingsIcon />
          </IconButton>
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
