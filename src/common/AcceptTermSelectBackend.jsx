import React, { useState } from 'react';
import { EyeIcon, EyeSlashIcon } from '@heroicons/react/24/solid';
import { Typography, Select, Option } from '@material-tailwind/react';

const AcceptTermSelectBackend = (props) => {
  const { label, icon, action, onChange } = props;
  const [selectedValue, setSelectedValue] = useState('');

  const selectbackendChangeHandler = (event) => {
    setSelectedValue(selectedValue);
    onChange(event);
  };

  return (
    <>
      <div className="flex flex-col border border-gray-300 p-2 rounded-md" style={{ height: 57 }}>
        <Typography variant="small" color="gray" className="text-xs">
          {label}
        </Typography>

        <Select
          variant="static"
          className="bg-white ring-4 ring-transparent"
          labelProps={{ className: 'hidden' }}
          style={{ border: 'none', padding: 0, margin: 0 }}
          value={selectedValue}
          onChange={selectbackendChangeHandler}
        >
          <Option value="" disabled>
            Select
          </Option>
          <Option value="Beginner">Beginner</Option>
          <Option value="Intermediate">Intermediate</Option>
          <Option value="Expert">Expert</Option>
        </Select>
      </div>
    </>
  );
};

export default AcceptTermSelectBackend;
