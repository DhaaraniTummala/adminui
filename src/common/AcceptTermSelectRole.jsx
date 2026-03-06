import React, { useState } from 'react';
import { Typography, Select, Option } from '@material-tailwind/react';

const AcceptTermSelectRole = (props) => {
  const { label, onChange } = props;
  const [selectedValue, setSelectedValue] = useState('');

  const selectRoleHandler = (event) => {
    const selectedValue = event;
    setSelectedValue(selectedValue);
    onChange(selectedValue);
  };

  return (
    <>
      <div className="flex flex-col border border-gray-300 p-2 rounded-md" style={{ height: 57 }}>
        <Typography variant="small" color="gray" className="text-xs">
          {label}
        </Typography>

        <Select
          variant="static"
          className="bg-white ring-4 ring-transparent w-3"
          labelProps={{ className: 'hidden' }}
          style={{ border: 'none', padding: 0, margin: 0, width: '100%' }}
          value={selectedValue}
          onChange={selectRoleHandler}
        >
          <Option value="" disabled>
            Select
          </Option>
          <Option value="Student">Student</Option>
          <Option value="Organization">Organization</Option>
          <Option value="Researcher">Researcher</Option>
        </Select>
      </div>
    </>
  );
};

export default AcceptTermSelectRole;
