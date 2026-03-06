import React from 'react';

import {
  Popover,
  PopoverHandler,
  PopoverContent,
  Button,
  Input,
  Typography,
  IconButton,
} from '@material-tailwind/react';
import StatusIcon from '../assets/StatusIcon';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EyeIcon from '../assets/EyesIcon';
import TrashIcon from '../assets/TrashIcon';
const CustomPopover = () => {
  return (
    <Popover placement="bottom">
      <PopoverHandler>
        <IconButton
          color="white"
          aria-label="more"
          id="long-button"
          aria-controls={open ? 'long-menu' : undefined}
          aria-expanded={open ? 'true' : undefined}
          aria-haspopup="true"
          className="action-icon"
          // onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>
      </PopoverHandler>
      <PopoverContent className="w-40">
        <div className="flex items-center ">
          <Button variant="text" className="flex items-center gap-2 capitalize font-poppins ">
            <EyeIcon color="#000000" />
            Upload Files
          </Button>
        </div>

        <div className="flex items-center">
          <Button
            variant="text"
            className="flex items-center gap-2 capitalize font-poppins"
            color="red"
          >
            <TrashIcon color="#000000" />
            Delete Module
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default CustomPopover;
