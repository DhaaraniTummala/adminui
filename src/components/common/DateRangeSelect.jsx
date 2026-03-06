import React from 'react';
import { Select } from 'antd';

const { Option } = Select;

/**
 * Reusable Date Range selector used in toolbars across the app.
 * Props:
 *  - defaultValue: string label for default shown value (e.g., 'Select Range')
 *  - style: inline styles
 *  - onChange: (value) => void
 */
const DateRangeSelect = ({ defaultValue = 'Select Range', style = {}, onChange }) => {
  return (
    <Select
      className="custom-select"
      defaultValue={defaultValue}
      style={{ width: 150, marginLeft: '10px', ...style }}
      onChange={onChange}
    >
      <Option value="reset">Reset</Option>
      <Option value="today">Today</Option>
      <Option value="yesterday">Yesterday</Option>
      <Option value="last7days">Last 7 Days</Option>
      <Option value="last30days">Last 30 Days</Option>
      <Option value="lastMonth">Last Month</Option>
    </Select>
  );
};

export default DateRangeSelect;
