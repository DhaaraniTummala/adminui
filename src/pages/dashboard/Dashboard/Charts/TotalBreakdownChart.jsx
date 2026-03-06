import React, { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import API from '../../../../store/requests';
import { Select } from 'antd';

const { Option } = Select;

const TotalBreakdownChart = ({ refreshKey }) => {
  const [breakdownData, setBreakdownData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedFilter, setSelectedFilter] = useState(null); // Start with null to show placeholder

  // Fetch breakdown data from API
  const fetchBreakdownData = async (filter = 'last7days') => {
    try {
      setLoading(true);
      setError(null);

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

      // Call the /list endpoint for table 10745 with FilterInfo
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

      const response = await API.triggerPost('10745', payload);

      if (response?.data?.data) {
        // Calculate counts
        const allBreakdowns = Array.isArray(response.data.data) ? response.data.data : [];
        const totalCount = allBreakdowns.length;

        // Count critical breakdowns (based on CompliantPriorityStatus === 'High')
        const criticalCount = allBreakdowns.filter(
          (item) => item.CompliantPriorityStatus?.toLowerCase() === 'high',
        ).length;

        // Format data for chart
        const chartData = [
          { name: 'Total Breakdown', value: totalCount, color: '#10B981' },
          { name: 'Critical Breakdown', value: criticalCount, color: '#F97316' },
        ];

        setBreakdownData(chartData);
      }
    } catch (err) {
      console.error('Error fetching breakdown data:', err);
      setError('Failed to load breakdown data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on component mount and when filter changes
  useEffect(() => {
    // Use last7days as default filter if no filter is selected
    const filterToUse = selectedFilter || 'last7days';
    fetchBreakdownData(filterToUse);
  }, [selectedFilter, refreshKey]);

  // Get total and critical values for display
  const totalBreakdown = breakdownData.find((item) => item.name === 'Total Breakdown')?.value || 0;
  const criticalBreakdown =
    breakdownData.find((item) => item.name === 'Critical Breakdown')?.value || 0;

  if (loading) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Total Breakdown</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
        <h3 className="text-base font-semibold text-gray-900 mb-4">Total Breakdown</h3>
        <div className="flex items-center justify-center h-64">
          <div className="text-red-500">{error}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      {/* Header with Title and Dropdown */}
      <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 -mx-6 px-6">
        <h3 className="text-base font-semibold text-gray-900">Total Breakdown</h3>
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

      {/* Legend */}
      <div className="flex gap-6 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#10B981]"></div>
          <span className="text-xs text-gray-600">Total Breakdown : {totalBreakdown}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#F97316]"></div>
          <span className="text-xs text-gray-600">Critical Breakdown : {criticalBreakdown}</span>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={breakdownData}
            margin={{ top: 20, right: 30, left: 20, bottom: 0 }}
            style={{ marginRight: '100px' }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: '#6B7280' }}
              axisLine={{ stroke: '#E5E7EB' }}
            />
            <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} axisLine={{ stroke: '#E5E7EB' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '12px',
              }}
            />
            <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
              {breakdownData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default TotalBreakdownChart;
