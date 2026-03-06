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
import { HiChevronLeft } from 'react-icons/hi';
import { HiChevronRight } from 'react-icons/hi';
import EmailAddressInputModal from '../../common/EmailAddressInputModal';
import DescriptionModal from '../../common/DescriptionModal';
import { withTranslation } from 'react-i18next';

const AddOrganizationModal = (props) => {
  const { t } = props;
  const [open, setOpen] = React.useState(false);

  const handleOpen = () => setOpen(!open);

  return (
    <>
      <Button
        style={{ background: '#056EE9' }}
        className="flex items-center gap-2 capitalize font-poppins"
        onClick={handleOpen}
        variant="gradient"
      >
        <GrAdd />
        {t('Add Organizations')}
      </Button>

      <Dialog open={open} handler={handleOpen}>
        <DialogBody>
          <div className="flex justify-between items-center ">
            <Typography className="text-left text-lg text-black font-bold">
              {' '}
              {t('Add Organizations')}
            </Typography>
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
          <EmailAddressInputModal />
          <div className="mt-5">
            {' '}
            <DescriptionModal />
          </div>
        </DialogBody>
      </Dialog>
    </>
  );
};

export default withTranslation()(AddOrganizationModal);
