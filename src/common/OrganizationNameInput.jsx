import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { Typography, Input } from '@material-tailwind/react';
import React, { useState } from 'react';

const OrganizationNameInput = (props) => {
  const { label, icon, action } = props;
  const [showPass, setShowPass] = useState(false);
  const handleShowPass = () => setShowPass((prev) => !prev);
  return (
    <div className=" flex flex-col   border border-gray-300 p-1 rounded-md h-14">
      <Typography variant="small" color="gray" className="p-0 m-0 text-xs">
        {label}
      </Typography>

      <Input
        {...props}
        shadow={false}
        type={`${false ? 'text' : 'Organization Name'}`}
        placeholder={props.placeholder}
        variant="static"
        className=" bg-white p-2 m-0  ring-4 ring-transparent "
        labelProps={{
          className: 'hidden',
        }}
        containerProps={{ className: 'min-w-[100px] -mt-5' }}
        style={{ border: 'none', padding: 0, margin: 0 }}

        // icon={
        //   showPass ? (
        //     <EyeIcon
        //       onClick={handleShowPass}
        //       className="h-5 w-5 text-blue-500 cursor-pointer"
        //     />
        //   ) : (
        //     <EyeSlashIcon
        //       onClick={handleShowPass}
        //       className="h-5 w-5 cursor-pointer"
        //     />
        //   )
        // }
      />
    </div>
  );
};

export default OrganizationNameInput;
