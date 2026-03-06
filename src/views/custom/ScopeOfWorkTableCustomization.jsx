import ViewRegistry from '../../core/ViewRegistry';
import React from 'react';
import { Dropdown, Menu, Button as AntButton } from 'antd';
import { MoreOutlined } from '@ant-design/icons';

const scopeOfWorkCustomizations = {
  customizeGridColumns: (columns) => {
    return [
      {
        headerName: 'S.no',
        field: 'SerialNumber',
        width: 80,
        valueGetter: (params) => {
          return params.node ? params.node.rowIndex + 1 : '';
        },
      },
      {
        headerName: 'Item order',
        field: 'ItemOrder',
        width: 120,
      },
      {
        headerName: 'Description',
        field: 'Description',
        width: 200,
      },
      {
        headerName: 'Delivery date',
        field: 'DeliveryDate',
        width: 130,
        valueFormatter: (params) => {
          if (!params.value) return '';
          // Convert YYYY-MM-DD to DD-MM-YYYY
          const date = new Date(params.value);
          if (isNaN(date.getTime())) return params.value;
          const day = String(date.getDate()).padStart(2, '0');
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const year = date.getFullYear();
          return `${day}-${month}-${year}`;
        },
      },
      {
        headerName: 'Quantity',
        field: 'Quantity',
        width: 100,
      },
      {
        headerName: 'Net unit cost',
        field: 'NetUnitCost',
        width: 130,
      },
      {
        headerName: 'sgst',
        field: 'SGSTTax',
        width: 80,
        valueFormatter: (params) => {
          return params.value ? `${params.value}%` : '';
        },
      },
      {
        headerName: 'cgst',
        field: 'CGSTTax',
        width: 80,
        valueFormatter: (params) => {
          return params.value ? `${params.value}%` : '';
        },
      },
      {
        headerName: 'igst',
        field: 'IGSTTax',
        width: 80,
        valueFormatter: (params) => {
          return params.value ? `${params.value}%` : '';
        },
      },
      {
        headerName: 'Amount (without taxes)',
        field: 'Amount',
        width: 150,
      },
      {
        headerName: 'Action',
        field: 'Action',
        width: 100,
        cellRenderer: (params) => {
          const menu = (
            <Menu>
              <Menu.Item
                key="edit"
                onClick={() => {
                  if (params.context?.onEdit) {
                    params.context.onEdit(params.data);
                  }
                }}
              >
                Edit
              </Menu.Item>
              <Menu.Item
                key="delete"
                danger
                onClick={() => {
                  if (params.context?.onDelete) {
                    params.context.onDelete(params.data);
                  }
                }}
              >
                Delete
              </Menu.Item>
            </Menu>
          );

          return (
            <Dropdown overlay={menu} trigger={['click']}>
              <AntButton
                type="text"
                icon={<MoreOutlined style={{ fontSize: '20px', fontWeight: 'bold' }} />}
                style={{ padding: '4px 8px' }}
              />
            </Dropdown>
          );
        },
      },
    ];
  },
};

ViewRegistry.registerEntityCustomizations('10819', scopeOfWorkCustomizations);
export default scopeOfWorkCustomizations;
