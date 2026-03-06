import React, { useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { URL } from '../app-config';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { Select, Button } from 'antd';
import Layout from './Layout';
import API from '../store/requests';
import secureStorage from '../utils/secureStorage';

const { Option } = Select;

const MultiQueryResult = () => {
  const [rowData, setRowData] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');

  const handleChange = (event) => {
    setSelectedOption(event);
  };

  const handleSubmit = async () => {
    const response = await LoadMultiQueryAPI(selectedOption);
    setRowData(response.data.data);
  };

  const LoadMultiQueryAPI = async (APIName) => {
    let params = {
      action: 'LoadMultiQueryAPI',
      OrganizationId: secureStorage.getItem('organizationId'),
      APIName: APIName,
    };
    return await API.triggerPost('Misc', params);
  };

  const columnDefs = [
    { headerName: 'Column Name', field: 'ColumnName' },
    { headerName: 'Column Value', field: 'ColumnValue' },
  ];

  return (
    <div>
      <br />
      <Select value={selectedOption} onChange={handleChange} style={{ width: 250 }}>
        <Option value="">Select</Option>
        <Option value="Dashboard">Dashboard</Option>
        <Option value="Login">Login</Option>
      </Select>
      <Button style={{ marginLeft: '10px' }} onClick={handleSubmit}>
        Submit
      </Button>
      <br />
      <br />
      <div className="ag-theme-alpine" style={{ height: '50vh', width: '100%' }}>
        <AgGridReact
          rowData={rowData}
          columnDefs={columnDefs}
          pagination={true}
          paginationPageSize={10}
          suppressCellSelection={true}
        />
      </div>
    </div>
  );
};

export default Layout(MultiQueryResult);
