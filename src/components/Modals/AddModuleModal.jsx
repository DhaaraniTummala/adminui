import React from 'react';
import {
  Button,
  Dialog,
  DialogHeader,
  DialogBody,
  DialogFooter,
  Typography,
} from '@material-tailwind/react';
import { GrAdd } from 'react-icons/gr';
import { CustomEmailInput } from '../../maiden-core/ui-components';
import { HiChevronLeft } from 'react-icons/hi';
import { HiChevronRight } from 'react-icons/hi';

const AddModuleModal = () => {
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(!open);

  return (
    <>
      <Button
        className="flex gap-3 bg-[#056EE9] capitalize"
        onClick={handleOpen}
        variant="gradient"
      >
        <GrAdd />
        Add Module
      </Button>

      <Dialog open={open} handler={handleOpen}>
        <DialogBody>
          <div className="flex justify-between items-center">
            <Typography className="text-left text-lg text-black">Add Module</Typography>
            <div className="flex items-center">
              <Button
                className="mr-2 bg-[#F7F9FB] capitalize text-black flex text-xs h-10 w-24 hover:bg-blue-700 hover:text-white"
                onClick={handleOpen}
              >
                <HiChevronLeft className="text-lg" /> Back
              </Button>
              <Button
                size="small"
                className="bg-black capitalize flex h-10 w-24  text-xs  hover:bg-blue-gray-100 hover:text-black"
                onClick={handleOpen}
              >
                Save <HiChevronRight className="text-lg" />
              </Button>
            </div>
          </div>
        </DialogBody>

        <DialogBody>
          <CustomEmailInput label={'Module Name'} />
          <CustomEmailInput label={'Module Name'} />
        </DialogBody>
        <DialogFooter></DialogFooter>
      </Dialog>
    </>
  );
};

export default AddModuleModal;
