import Layout from '../../../components/Layout';
import { withTranslation } from 'react-i18next';
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import Chat from '../../../components/Chat';
import NewlyAddedAssets from './NewlyAddedAssets';
import DecommissionedAssets from './DecommissionedAssets';
import UpcomingPreventiveMaintenance from './UpcomingPreventiveMaintenance';
import TotalBreakdownChart from './Charts/TotalBreakdownChart';
import NoOfAssets from './NoOfAssets';

const Dashboard = (props) => {
  const { t } = props;
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    fetchBreakdownData(); // your API
  }, [refreshKey]);

  const fetchBreakdownData = () => {
    // your API call
  };

  const ticketStatusData = [
    { name: 'Not Assigned : 05', value: 5, color: '#F97316' },
    { name: 'Assigned : 10', value: 10, color: '#10B981' },
    { name: 'On Going : 10', value: 10, color: '#8B5CF6' },
  ];

  const utilizationData = [
    { name: 'Category_01', value: 75.06 },
    { name: 'Category_02', value: 66.67 },
    { name: 'Category_03', value: 46.0 },
    { name: 'Category_04', value: 33.33 },
    { name: 'Category_05', value: 26.67 },
  ];

  const assetsMeantimeData = [
    {
      id: '01',
      assetId: 'ASSET-01',
      assetName: 'Asset Name Here',
      meanTime: 'XX Hours',
      failureTime: 'XX Hours',
    },
    {
      id: '02',
      assetId: 'ASSET-02',
      assetName: 'Asset Name Here',
      meanTime: 'XX Hours',
      failureTime: 'XX Hours',
    },
    {
      id: '03',
      assetId: 'ASSET-03',
      assetName: 'Asset Name Here',
      meanTime: 'XX Hours',
      failureTime: 'XX Hours',
    },
    {
      id: '04',
      assetId: 'ASSET-04',
      assetName: 'Asset Name Here',
      meanTime: 'XX Hours',
      failureTime: 'XX Hours',
    },
    {
      id: '05',
      assetId: 'ASSET-05',
      assetName: 'Asset Name Here',
      meanTime: 'XX Hours',
      failureTime: 'XX Hours',
    },
  ];

  // Mean Time to Repair Data
  const meanTimeRepairData = [
    { name: 'Electrical', value: 30, color: '#EF4444' },
    { name: 'Critical Equipment', value: 25, color: '#F59E0B' },
    { name: 'Met', value: 45, color: '#3B82F6' },
  ];

  // Section Wise Breakdown Data
  const sectionBreakdownData = [
    { name: 'Section Name', value: 19 },
    { name: 'Section Name', value: 24 },
    { name: 'Section Name', value: 16 },
    { name: 'Section Name', value: 20 },
    { name: 'Section Name', value: 10 },
  ];

  return (
    <div className="min-h-screen relative" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Dashboard Content - Always rendered */}
      <Chat />
      <div className="container mx-auto px-6 py-6">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-[24px] font-semibold text-[#04080B] mb-2">
              Welcome Back To Assets Dashboard!
            </h1>
            <p className="text-[#04080B] text-sm">
              Manage Your Assets, Monitor Performance, Track Status, And Maximize Value — All From
              One Powerful Dashboard
            </p>
          </div>
          {/* <div className="text-right bg-[#F9FAFB] p-2 rounded">
            <p className="flex gap-2 items-center text-xs text-gray-500 italic">
              <img
                src="rotate-right.svg"
                alt=""
                className="cursor-pointer"
                onClick={() => setRefreshKey((prev) => prev + 1)}
              />
              <span className="font-semibold text-black not-italic">Last Login</span> : Wednesday,
              11 June 2025, 9:32 AM
            </p>
          </div> */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <NoOfAssets refreshKey={refreshKey} />

          <TotalBreakdownChart refreshKey={refreshKey} />

          <div className="lg:row-span-2">
            <UpcomingPreventiveMaintenance refreshKey={refreshKey} />
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 -mx-6 px-6">
              <h3 className="text-base font-semibold text-gray-900">Ticket Status</h3>
              <select className="border border-gray-200 rounded px-2 py-1 text-xs bg-white text-gray-600">
                <option>This Week</option>
              </select>
            </div>
            <div className="flex items-center">
              {/* Pie Chart */}
              <div className="w-1/2">
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={ticketStatusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {ticketStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend */}
              <div className="w-1/2 pl-4">
                <div className="space-y-2">
                  {ticketStatusData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: entry.color }}
                      ></div>
                      <span className="text-xs text-gray-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Row 2, Col 2 - Assets Availability */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200 -mx-6 px-6">
              <h3 className="text-base font-semibold text-gray-900">Assets Availability</h3>
              <select className="border border-gray-200 rounded px-2 py-1 text-xs bg-white text-gray-600">
                <option>This Week</option>
              </select>
            </div>
            <div className="space-y-3">
              {utilizationData.map((item, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name}</span>
                    <span className="font-medium text-gray-900">{item.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-orange-500 h-2 rounded-full"
                      style={{ width: `${item.value}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Section - Data Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Newly Added Assets */}
          <NewlyAddedAssets refreshKey={refreshKey} />

          {/* No of Assets Decommissioned */}
          <DecommissionedAssets refreshKey={refreshKey} />
        </div>

        {/* Additional Sections */}
        <div className="mt-8 space-y-6">
          {/* Assets Meantime B/W Failure Time Table */}
          <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-semibold text-gray-900">
                Assets Meantime B/W Failure Time
              </h3>
              <select className="border border-gray-200 rounded px-2 py-1 text-xs bg-white text-gray-600">
                <option>This Week</option>
              </select>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      #
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      Asset ID
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      Asset Name
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      Mean Time
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-medium text-gray-500 uppercase">
                      Failure Time
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {assetsMeantimeData.map((item, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-900">{item.id}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{item.assetId}</td>
                      <td className="py-3 px-4 text-sm text-gray-900">{item.assetName}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{item.meanTime}</td>
                      <td className="py-3 px-4 text-sm text-gray-500">{item.failureTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Bottom Row - Mean Time to Repair and Section Wise Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Mean Time to Repair */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-900">Mean Time to Repair</h3>
                <select className="border border-gray-200 rounded px-2 py-1 text-xs bg-white text-gray-600">
                  <option>This Week</option>
                </select>
              </div>
              <div className="flex items-center">
                {/* Pie Chart */}
                <div className="flex-1">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={meanTimeRepairData}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={0}
                        dataKey="value"
                      >
                        {meanTimeRepairData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>

                {/* Legend */}
                <div className="flex-1 pl-4">
                  <div className="space-y-2">
                    {meanTimeRepairData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: entry.color }}
                        ></div>
                        <span className="text-xs text-gray-600">{entry.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Section Wise Breakdown */}
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-semibold text-gray-900">Section Wise Breakdown</h3>
                <select className="border border-gray-200 rounded px-2 py-1 text-xs bg-white text-gray-600">
                  <option>This Week</option>
                </select>
              </div>
              <div className="space-y-3">
                {sectionBreakdownData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between py-2">
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center">
                        <svg
                          className="w-3 h-3 text-gray-500"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-900">{item.name}</span>
                    </div>
                    <span className="text-lg font-semibold text-gray-900">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withTranslation()(Layout(Dashboard));
