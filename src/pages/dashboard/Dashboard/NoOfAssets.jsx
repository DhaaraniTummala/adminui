import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import API from '../../../store/requests';
import { Select } from 'antd';

const { Option } = Select;

// Custom Tooltip Component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div
        style={{
          backgroundColor: '#fff',
          padding: '10px 15px',
          border: '1px solid #e5e7eb',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        }}
      >
        <p style={{ margin: 0, fontSize: '14px', fontWeight: '500', color: '#374151' }}>
          {data.name}
        </p>
        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#6b7280' }}>
          value : {data.value}
        </p>
      </div>
    );
  }
  return null;
};

const NoOfAssets = ({ refreshKey }) => {
  const [assetsData, setAssetsData] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);
  const [selectedFilter, setSelectedFilter] = useState(null); // Start with null to show placeholder

  // Color palette for asset types
  const assetTypeColors = [
    '#6B46C1',
    '#8B5CF6',
    '#A78BFA',
    '#C4B5FD',
    '#DDD6FE',
    '#E9D5FF',
    '#F3E8FF',
  ];

  // Fetch assets data and group by Asset Type
  const fetchAssetsData = async (filter = 'last7days') => {
    try {
      setAssetsLoading(true);

      // Helper function to format date as YYYY-MM-DD HH:mm:ss
      const formatDateTime = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      };

      // Calculate date range based on selected filter
      const endDate = new Date();
      const startDate = new Date();

      switch (filter) {
        case 'today':
          startDate.setHours(0, 0, 0, 0);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'yesterday':
          startDate.setDate(startDate.getDate() - 1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setDate(endDate.getDate() - 1);
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'last7days':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case 'last30days':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case 'lastMonth':
          startDate.setMonth(startDate.getMonth() - 1);
          startDate.setDate(1);
          startDate.setHours(0, 0, 0, 0);
          endDate.setDate(0); // Last day of previous month
          endDate.setHours(23, 59, 59, 999);
          break;
        case 'reset':
          // Reset to default (last 7 days)
          startDate.setDate(startDate.getDate() - 7);
          break;
        default:
          startDate.setDate(startDate.getDate() - 7); // Default to last 7 days
      }

      const payload = {
        action: 'List',
        pageNo: 0,
        pageSize: 10000,
        filterInfo: [
          {
            filterTerm: formatDateTime(startDate),
            filterBy: 'CreatedDate',
            filterType: 'DATEGREATERTHANEQUAL',
          },
          {
            filterTerm: formatDateTime(endDate),
            filterBy: 'CreatedDate',
            filterType: 'DATELESSERTHANEQUAL',
          },
        ],
      };

      const response = await API.triggerPost('10738', payload);

      if (response?.data?.data && Array.isArray(response.data.data)) {
        const assets = response.data.data;

        console.log('Assets data:', assets);

        // Group assets by AssetType
        const assetTypeCounts = {};
        assets.forEach((asset) => {
          const Asset = asset.Asset || 'Unknown';
          assetTypeCounts[Asset] = (assetTypeCounts[Asset] || 0) + 1;
        });

        // Convert to chart data format
        const chartData = Object.entries(assetTypeCounts)
          .map(([type, count], index) => ({
            name: `${type} : ${count}`,
            value: count,
            color: assetTypeColors[index % assetTypeColors.length],
          }))
          .sort((a, b) => b.value - a.value);

        setAssetsData(chartData);
      } else {
        setAssetsData([]);
      }
    } catch (error) {
      console.error('Error fetching assets data:', error);
      setAssetsData([]);
    } finally {
      setAssetsLoading(false);
    }
  };

  // Fetch on mount and when filter changes
  useEffect(() => {
    // Use last7days as default filter if no filter is selected
    const filterToUse = selectedFilter || 'last7days';
    fetchAssetsData(filterToUse);
  }, [selectedFilter, refreshKey]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-[#EAECF0]">
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-[#EAECF0] -mx-6 px-6">
        <h3 className="text-[16px] font-semibold text-[#04080B]">No of Assets</h3>
        <Select
          value={selectedFilter}
          onChange={(value) => setSelectedFilter(value)}
          placeholder="Filters"
          style={{
            width: 150,
            padding: '10px 20px',
            backgroundColor: '#FCFCFD',
            borderColor: '#F2F4F7',
          }}
          className="border border-gray-200 rounded px-4 py-1 text-xs bg-white text-gray-600"
        >
          <Option value="last7days">Last 7 Days</Option>
          <Option value="today">Today</Option>
          <Option value="yesterday">Yesterday</Option>
          <Option value="last30days">Last 30 Days</Option>
          <Option value="lastMonth">Last Month</Option>
        </Select>
      </div>
      <div className="flex items-center">
        {assetsLoading ? (
          <div className="flex-1 flex items-center justify-center h-[100px]">
            <p className="text-gray-500 text-sm">Loading assets data...</p>
          </div>
        ) : assetsData.length === 0 ? (
          <div className="flex-1 flex items-center justify-center h-[100px]">
            <p className="text-gray-500 text-sm">No assets data available</p>
          </div>
        ) : (
          <>
            {/* Pie Chart */}
            <div className="flex-1 flex items-center justify-center ml-4 mt-8">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={assetsData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={0}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                  >
                    {assetsData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="flex-1 mt-8">
              <div className="space-y-2">
                {assetsData.map((entry, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className="text-xs text-gray-700">{entry.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default NoOfAssets;
