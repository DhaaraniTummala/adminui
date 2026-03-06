import React, { useState, useEffect } from 'react';
import API from '../../../store/requests';
import moment from 'moment';
import { Select } from 'antd';
import { ASSET_STATUS_IDS } from '../../../configs/assetConstants';

const { Option } = Select;

const DecommissionedAssets = ({ refreshKey }) => {
  const [dateFilter, setDateFilter] = useState(null); // Start with null to show placeholder
  const [assetsData, setAssetsData] = useState([]);
  const [loading, setLoading] = useState(false);

  // Get date range based on filter value
  const getDateRangeFilter = (filterValue) => {
    const today = new Date();
    let fromDate, toDate;

    switch (filterValue) {
      case 'today':
        fromDate = new Date(today);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(today);
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'yesterday':
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 1);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(today);
        toDate.setDate(today.getDate() - 1);
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'last7days':
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 7);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(today);
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'last30days':
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 30);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(today);
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'lastMonth':
        fromDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        toDate = new Date(today.getFullYear(), today.getMonth(), 0, 23, 59, 59);
        break;
      case 'reset':
      default:
        // Reset defaults to last 7 days
        fromDate = new Date(today);
        fromDate.setDate(today.getDate() - 7);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(today);
        toDate.setHours(23, 59, 59, 999);
    }

    return { fromDate, toDate };
  };

  // Fetch decommissioned (withdrawn) assets from API
  const fetchDecommissionedAssets = async (filterValue) => {
    try {
      setLoading(true);
      const { fromDate, toDate } = getDateRangeFilter(filterValue);

      const payload = {
        action: 'List',
        pageNo: 0,
        pageSize: 50,
        filterInfo: [
          // Date range filters
          {
            filterTerm: moment(fromDate).format('YYYY-MM-DD HH:mm:ss'),
            filterBy: 'CreatedDate',
            filterType: 'DATEGREATERTHANEQUAL',
          },
          {
            filterTerm: moment(toDate).format('YYYY-MM-DD HH:mm:ss'),
            filterBy: 'CreatedDate',
            filterType: 'DATELESSERTHANEQUAL',
          },
          // Status filter for Withdrawn assets - using constant from assetConstants
          {
            filterTerm: ASSET_STATUS_IDS.WITHDRAWN,
            filterBy: 'AssetStatusTypeId',
            filterType: 'MULTI',
          },
        ],
      };

      const response = await API.triggerPost('10738', payload);

      if (response?.data?.data) {
        setAssetsData(response.data.data.slice(0, 5));
      } else {
        setAssetsData([]);
      }
    } catch (error) {
      console.error('Error fetching decommissioned assets:', error);
      setAssetsData([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle filter change
  const handleDateFilterChange = (value) => {
    // If reset is selected, change it back to last7days
    const filterValue = value === 'reset' ? 'last7days' : value;
    setDateFilter(filterValue);
    fetchDecommissionedAssets(filterValue);
  };

  // Fetch data on component mount
  useEffect(() => {
    // Use last7days as default if no filter selected
    fetchDecommissionedAssets(dateFilter || 'last7days');
  }, [dateFilter, refreshKey]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 h-[300px] overflow-y-auto">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-base font-semibold text-gray-900">
          No of Assets Withdrawn from service
        </h3>
        <Select
          value={dateFilter}
          onChange={handleDateFilterChange}
          placeholder="Filters"
          style={{
            width: 150,
            padding: '10px 20px',
            backgroundColor: '#FCFCFD',
            borderColor: '#F2F4F7',
          }}
          className="border border-gray-200 rounded px-4 py-1 text-xs bg-white text-gray-600"
        >
          <Option value="last7days">This Week</Option>
          <Option value="today">Today</Option>
          <Option value="yesterday">Yesterday</Option>
          <Option value="last30days">Last 30 Days</Option>
          <Option value="lastMonth">Last Month</Option>
        </Select>
      </div>
      <div className="space-y-3">
        {loading ? (
          <div className="text-center py-8 text-gray-500">Loading...</div>
        ) : assetsData.length > 0 ? (
          assetsData.map((asset, index) => (
            <div
              key={index}
              className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-[#FCFCFD] rounded flex items-center justify-center">
                  <img src="login.svg" alt="" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{asset.AssetName}</p>
                  <p className="text-xs text-gray-500">
                    {asset.EquipmentId} {moment(asset.CreatedDate).format('MMM DD')}
                  </p>
                </div>
              </div>
              <span
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{ backgroundColor: '#FEF3F2', color: '#B42318', padding: '6px 12px' }}
              >
                • Withdrawn
              </span>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-gray-500">No decommissioned assets found</div>
        )}
      </div>
    </div>
  );
};

export default DecommissionedAssets;
