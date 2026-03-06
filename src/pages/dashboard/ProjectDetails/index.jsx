import React from 'react';
import Layout from '../../../components/Layout';

import { Button, Typography } from '@material-tailwind/react';
import { GrAdd } from 'react-icons/gr';
import { AgGridReact } from 'ag-grid-react';

// import "ag-grid-community/styles//ag-grid.css";
// import "ag-grid-community/styles//ag-theme-quartz.css";

const ProjectDetailsPage = () => {
  const rowData = [
    {
      headerModule: 'Module 1',
      createdBy: 'Admin',
      createdDate: '20.02.2023',
      modifyBy: 'Admin',
      modifyDate: '22.02.2023',
      status: 'Pending',
      action: 'Edit',
    },
    {
      headerModule: 'Module 1',
      createdBy: 'Admin',
      createdDate: '20.02.2023',
      modifyBy: 'Admin',
      modifyDate: '22.02.2023',
      status: 'Pending',
      action: 'Edit',
    },
    {
      headerModule: 'Module 1',
      createdBy: 'Admin',
      createdDate: '20.02.2023',
      modifyBy: 'Admin',
      modifyDate: '22.02.2023',
      status: 'Pending',
      action: 'Edit',
    },
    {
      headerModule: 'Module 1',
      createdBy: 'Admin',
      createdDate: '20.02.2023',
      modifyBy: 'Admin',
      modifyDate: '22.02.2023',
      status: 'Pending',
      action: 'Edit',
    },
    // Add more data as needed
  ];

  const columnDefs = [
    {
      headerName: 'Select',
      checkboxSelection: true,
      headerCheckboxSelection: true,
    },
    { headerName: 'Header Module', field: 'headerModule' },
    { headerName: 'Created By', field: 'createdBy' },
    { headerName: 'Created Date', field: 'createdDate' },
    { headerName: 'Modify By', field: 'modifyBy' },
    { headerName: 'Modify Date', field: 'modifyDate' },
    { headerName: 'Status', field: 'status' },
    { headerName: 'Action', field: 'action' },
  ];

  const gridOptions = {
    pagination: true,
    paginationPageSize: 10, // Number of rows per page
  };

  return (
    <div>
      <div className="flex justify-between mt-4">
        <Typography className="text-xl text-black font-bold">Project 01</Typography>
        <Button className="flex gap-3 bg-[#6499E9]">
          <GrAdd />
          Add Module
        </Button>
      </div>

      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4 mt-6">
        <div
          className="ag-theme-quartz w-full"
          style={{
            height: '500px',
            width: '1100px',
          }}
        >
          <AgGridReact
            className=" w-full"
            columnDefs={columnDefs}
            rowData={rowData}
            gridOptions={gridOptions}
          ></AgGridReact>
        </div>
      </div>
    </div>
  );
};

export default Layout(ProjectDetailsPage);
