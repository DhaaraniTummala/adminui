import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { Typography, Input, Textarea } from '@material-tailwind/react';
import React, { useState } from 'react';

const DescriptionModal = (props) => {
  const { label, icon, action } = props;
  const [showPass, setShowPass] = useState(false);
  const handleShowPass = () => setShowPass((prev) => !prev);
  return (
    <div className=" flex flex-col p-2  border border-gray-300  rounded-md ">
      <Typography variant="small" color="gray" className="p-0 m-0 text-xs">
        Sort Description
      </Typography>

      <Textarea
        shadow={false}
        type={`${false ? 'text' : 'Sort Description'}`}
        placeholder="Enter here"
        variant="static"
        className=" bg-white p-0 m-0  ring-4 ring-transparent  "
        labelProps={{
          className: 'hidden',
        }}
        containerProps={{ className: 'min-w-[100px] -mt-5' }}
        style={{ border: 'none', padding: 0, margin: 0 }}
      />
    </div>
  );
};

export default DescriptionModal;
