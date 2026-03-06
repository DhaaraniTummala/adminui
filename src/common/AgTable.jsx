import React, { useMemo, useState, useEffect } from 'react';
import { AgGridReact } from '@ag-grid-community/react';
import { ModuleRegistry } from '@ag-grid-community/core';
import { ClientSideRowModelModule } from '@ag-grid-community/client-side-row-model';
import { BiFilter, BiSearch, BiSearchAlt } from 'react-icons/bi';
import { BsArrowDownUp } from 'react-icons/bs';
import { HiOutlineDotsHorizontal } from 'react-icons/hi';
import { Button } from '@material-tailwind/react';
import InventoryConfig from '../configs/inventory.config';
import StatusIcon from '../assets/StatusIcon';

import '@ag-grid-community/styles/ag-grid.css';
import '@ag-grid-community/styles/ag-theme-quartz.css';

ModuleRegistry.registerModules([ClientSideRowModelModule]);

const TableAgGrid = () => {
  const [rowData, setRowData] = useState(generateRowData());

  function randomDate(start, end) {
    return new Date(
      start.getTime() + Math.random() * (end.getTime() - start.getTime()),
    ).toLocaleDateString();
  }

  function generateRowData() {
    const currentDate = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(currentDate.getFullYear() - 1);

    return [
      {
        'Sr no': 1,
        Module: 'Module 01',
        'Created By': 'Admin',
        'Created Date': randomDate(oneYearAgo, currentDate),
        'Modified By': 'Admin',
        'Modified Date': randomDate(oneYearAgo, currentDate),
        status: 'Pending',
      },
      {
        'Sr no': 2,
        Module: 'Module 02',
        'Created By': 'Admin',
        'Created Date': randomDate(oneYearAgo, currentDate),
        'Modified By': 'Admin',
        'Modified Date': randomDate(oneYearAgo, currentDate),
        status: 'Complete',
      },
      {
        'Sr no': 3,
        Module: 'Module 03',
        'Created By': 'Admin',
        'Created Date': randomDate(oneYearAgo, currentDate),
        'Modified By': 'Admin',
        'Modified Date': randomDate(oneYearAgo, currentDate),
        status: 'In Progress',
      },
      {
        'Sr no': 4,
        Module: 'Module 04',
        'Created By': 'Admin',
        'Created Date': randomDate(oneYearAgo, currentDate),
        'Modified By': 'Admin',
        'Modified Date': randomDate(oneYearAgo, currentDate),
        status: 'Rejected',
      },
      {
        'Sr no': 5,
        Module: 'Module 05',
        'Created By': 'Admin',
        'Created Date': randomDate(oneYearAgo, currentDate),
        'Modified By': 'Admin',
        'Modified Date': randomDate(oneYearAgo, currentDate),
        status: 'Pending',
      },
    ];
  }

  const modifiedRowData = useMemo(() => {
    return rowData.map((row, index) => {
      return { ...row, 'Sr no': index + 1 };
    });
  }, [rowData]);

  const [columnDefs, setColumnDefs] = useState(InventoryConfig.columnDefs);

  const moduleCellRenderer = ({ value, data }) => {
    const handleModuleOnClick = () => {
      const JSONRowData = JSON.stringify(data, null, 5);
      alert(JSONRowData);
    };
    return (
      <div style={{ cursor: 'pointer' }} onClick={handleModuleOnClick}>
        {value}
      </div>
    );
  };

  useEffect(() => {
    let needsUpdate = false;
    const updatedColumnDefs = columnDefs.map((colDef) => {
      //fetching each column headerName
      if (colDef.headerName === 'Action' && !colDef.pinned) {
        needsUpdate = true;
        return { ...colDef, pinned: 'right' };
      } else if (colDef.field === 'Module') {
        return {
          ...colDef,
          cellStyle: { color: 'blue' },
          cellRenderer: moduleCellRenderer,
        };
      }
      return colDef;
    });
    if (needsUpdate) {
      setColumnDefs(updatedColumnDefs); // updating columnDefs
    }
  }, [columnDefs]);

  const overlayLoadingTemplate = `<span className="ag-overlay-loading-center">Please wait while your rows are loading...</span>`;
  const overlayNoRowsTemplate = `<span className="ag-overlay-loading-center">No data found to display.</span>`;

  const onSelectionChanged = ($event) => {};

  return (
    <>
      <div className="flex justify-between">
        <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2">
          <BiSearchAlt className="text-gray-500 w-6 h-6" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full ml-2 bg-transparent border-none focus:outline-none"
          />
        </div>

        <div className="flex">
          <BiFilter className="w-10 h-7" />
          <BsArrowDownUp className="w-10 h-5" />
          <HiOutlineDotsHorizontal className="w-10 h-6" />
        </div>
      </div>
      <div className="ag-theme-quartz" style={{ height: 380, marginTop: 20 }}>
        <AgGridReact
          rowData={modifiedRowData}
          columnDefs={columnDefs}
          rowSelection="multiple"
          suppressRowClickSelection={true}
          pagination={true}
          paginationPageSize={10}
          paginationPageSizeSelector={[10, 25, 50]}
          defaultColDef={{ sortable: true, resizable: true }}
          overlayLoadingTemplate={overlayLoadingTemplate}
          overlayNoRowsTemplate={overlayNoRowsTemplate}
          onSelectionChanged={onSelectionChanged}
        />
      </div>
    </>
  );
};

export default TableAgGrid;
