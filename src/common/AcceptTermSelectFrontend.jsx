import React, { useState } from 'react';
import { Typography, Select, Option } from '@material-tailwind/react';

const AcceptTermSelectFrontend = (props) => {
  const { label, onChange } = props;
  const [selectedFrontendValue, setSelectedFrontendValue] = useState('');

  const selectFrontendHandler = (event) => {
    const selectedValue = event;
    setSelectedFrontendValue(selectedValue);
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
          className="bg-white ring-4 ring-transparent"
          labelProps={{ className: 'hidden' }}
          style={{ border: 'none', padding: 0, margin: 0 }}
          value={selectedFrontendValue}
          onChange={selectFrontendHandler}
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

export default AcceptTermSelectFrontend;
