import React from 'react';
import { Link } from 'react-router-dom';
import GridActionMenu from '../shared/grid-action-menu.component';

import GridHeaderCheckbox from '../shared/grid-header-checkbox.component';

import StatusIcon from '../assets/StatusIcon';
import CustomPopover from '../common/CustomPopover';

const statusCellStyle = (params) => {
  let statusColor = '';
  let statusIconColor = '';
  switch (params.status) {
    case 'Pending':
      statusColor = '[#59A8D4]';
      statusIconColor = '#59A8D4';
      break;
    case 'Complete':
      statusColor = '[#4AA785]';
      statusIconColor = '#4AA785';
      break;
    case 'In Progress':
      statusColor = '[#0ea5e9]';
      statusIconColor = '#8A8CD9';
      break;
    case 'Rejected':
      statusColor = '[#6b7280]';
      statusIconColor = '#1C1C1C66';
      break;
    default:
      //   statusColor = "red";
      //   statusIconColor = "red";
      break;
  }
  return { color: statusColor, iconColor: statusIconColor };
};

const columnDefs = [
  {
    checkboxSelection: true,
    headerComponent: GridHeaderCheckbox,
    pinned: 'left',
    lockPinned: true,
    // suppressMenu: true,
    width: 60,
    cellStyle: {
      paddingLeft: '30px',
      borderRight: 'none',
    },
    headerComponentParams: {
      borderRight: 'none',
    },
  },
  {
    field: 'Sr no',
    sortable: true,
    // filter: true,
    lockPinned: true,
    suppressMenu: true,
    floatingFilterComponent: 'GridTextFilterComponent',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
    width: 80,
    headerComponentParams: {
      borderLeft: 'none',
    },
    cellStyle: {
      borderLeft: 'none',
    },
  },
  {
    field: 'Module',
    sortable: true,
    // filter: true,
    lockPinned: true,
    suppressMenu: true,
    floatingFilterComponent: 'GridTextFilterComponent',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
    width: 160,
  },
  {
    field: 'Created By',
    sortable: true,
    // filter: true,
    lockPinned: true,
    suppressMenu: true,
    floatingFilterComponent: 'GridTextFilterComponent',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
    width: 160,
  },
  {
    field: 'Created Date',
    sortable: true,
    // filter: true,
    lockPinned: true,
    suppressMenu: true,
    floatingFilterComponent: 'GridTextFilterComponent',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
    width: 160,
  },
  {
    field: 'Modified By',
    sortable: true,
    // filter: true,
    lockPinned: true,
    suppressMenu: true,
    floatingFilterComponent: 'GridTextFilterComponent',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
    width: 160,
  },
  {
    field: 'Modified Date',
    sortable: true,
    // filter: true,
    lockPinned: true,
    suppressMenu: true,
    floatingFilterComponent: 'GridTextFilterComponent',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
    width: 160,
  },
  {
    headerName: 'Status',
    field: 'status',
    sortable: true,
    filter: true,
    lockPinned: true,
    suppressMenu: true,
    floatingFilterComponent: 'GridTextFilterComponent',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
    width: 160,
    cellRenderer: ({ data }) => (
      <div className="flex items-center">
        <StatusIcon color={statusCellStyle(data).iconColor} />
        <span className={`ml-2 text-${statusCellStyle(data).color}`}>
          {/* <span className='ml-2 text-[#59A8D4]'> */}
          {data?.status}
        </span>
      </div>
    ),
  },

  {
    headerName: 'Action',
    width: 130,
    sortable: false,
    filter: false,
    cellRenderer: CustomPopover,
    cellRendererParams: {
      menuCallback: (fn) => fn,
      menus: [
        {
          key: 'edit',
          title: 'View Tables',
        },
        {
          key: 'delete',
          title: 'Delete Module',
        },
      ],
    },
  },
];

const defaultColDef = {
  minWidth: 40,
  resizable: true,
  floatingFilter: true,
};

const mainMenus = [
  {
    key: 'create',
    title: 'Create',
    alwaysEnable: true,
  },
  {
    key: 'deletes',
    title: 'Delete',
    disabled: true,
  },
];

const listUrl = 'inventory/list';

const InventoryConfig = {
  columnDefs,
  defaultColDef,
  mainMenus,
  listUrl,
};

export default InventoryConfig;
