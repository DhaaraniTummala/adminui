import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { Typography, Input } from '@material-tailwind/react';
import React, { useState } from 'react';

const EmailAddressInputModal = (props) => {
  const { label, icon, action } = props;
  const [showPass, setShowPass] = useState(false);
  const handleShowPass = () => setShowPass((prev) => !prev);
  return (
    <div className=" flex flex-col   border border-purple-800 p-1 rounded-md h-20">
      <Typography variant="small" color="gray" className="p-0 m-0 text-xs">
        Organization Name
      </Typography>

      <Input
        shadow={false}
        type={`${false ? 'text' : 'Enter Name'}`}
        placeholder="Enter Name"
        variant="static"
        className=" bg-white p-0 m-0  ring-4 ring-transparent "
        labelProps={{
          className: 'hidden',
        }}
        containerProps={{ className: 'min-w-[100px] -mt-5' }}
        style={{ border: 'none', padding: 0, margin: 0 }}
      />
    </div>
  );
};

export default EmailAddressInputModal;
