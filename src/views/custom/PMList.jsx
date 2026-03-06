import React, { useState, useEffect, useRef } from 'react';
import { message, Input, Button, Tooltip } from 'antd';
import Layout from '../../components/Layout';
import AgGrid from '../../components/ag-grid';
import API from '../../store/requests';
import moment from 'moment';
import DateRangeSelect from '../../components/common/DateRangeSelect';

const PMList = () => {
  const [loading, setLoading] = useState(false);
  const [pmData, setPmData] = useState([]);
  const [total, setTotal] = useState(0);
  const [gridApi, setGridApi] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState(null);
  const searchTimeout = useRef(null);

  // Column definitions for AG-Grid
  const columns = [
    {
      title: 'PM ID',
      dataIndex: 'PreMainLabelId',
      type: 'text',
      width: 150,
      pinned: 'left',
    },
    {
      title: 'Asset Name',
      dataIndex: 'AssetName',
      type: 'text',
      width: 200,
    },
    {
      title: 'Asset Location',
      dataIndex: 'AssetLocation',
      type: 'text',
      width: 200,
    },
    {
      title: 'Equipment ID',
      dataIndex: 'EquipmentId',
      type: 'text',
      width: 150,
    },
    {
      title: 'Checklist ID',
      dataIndex: 'CheckListLabelId',
      type: 'text',
      width: 150,
    },
    {
      title: 'Status',
      dataIndex: 'PreMainStatus',
      type: 'combo',
      renderer: 'pmStatusCellRenderer',
      width: 150,
      pinned: 'right',
    },
    {
      title: 'Maintenance Date',
      dataIndex: 'PreMainDate',
      type: 'date',
      width: 180,
    },
    {
      title: 'Days Remaining',
      dataIndex: 'DayRemaining',
      type: 'number',
      width: 150,
    },
    {
      title: 'Man Hours Spent',
      dataIndex: 'ManHoursSpent',
      type: 'number',
      width: 150,
    },
    {
      title: 'Cost',
      dataIndex: 'Cost',
      type: 'number',
      width: 120,
    },
    {
      title: 'Is Closed',
      dataIndex: 'IsClosed',
      type: 'boolean',
      width: 120,
    },
    {
      title: 'Created Date',
      dataIndex: 'CreatedDate',
      type: 'datetime',
      width: 180,
    },
  ];

  // Fetch PM data from API
  const fetchPMData = async (filters = {}) => {
    try {
      setLoading(true);

      // Build FilterInfo array based on provided filters
      const filterInfo = [];

      // Add search filter if provided
      if (filters.search && filters.search.trim() !== '') {
        filterInfo.push({
          filterTerm: filters.search.trim(),
          filterBy: 'PreMainLabelId,AssetName,AssetLocation',
          filterType: 'CONTAINS',
        });
      }

      // Add date range filters if provided
      if (filters.startDate && filters.endDate) {
        filterInfo.push({
          filterTerm: filters.startDate,
          filterBy: 'CreatedDate',
          filterType: 'DATEGREATERTHANEQUAL',
        });
        filterInfo.push({
          filterTerm: filters.endDate,
          filterBy: 'CreatedDate',
          filterType: 'DATELESSTHANEQUAL',
        });
      }

      const payload = {
        RequestType: 'PreMain_UI',
        InputJson: JSON.stringify({
          PreMainCal: [
            {
              FilterInfo: filterInfo,
            },
          ],
        }),
        action: 'JsonRequest',
      };

      const response = await API.triggerPost('Plant', payload);

      if (response?.data?.data?.PreMain && Array.isArray(response.data.data.PreMain)) {
        const pmRecords = response.data.data.PreMain;
        setPmData(pmRecords);
        setTotal(pmRecords.length);
      } else {
        setPmData([]);
        setTotal(0);
      }
    } catch (error) {
      console.error('Error fetching PM data:', error);
      message.error('Failed to load preventive maintenance data');
      setPmData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  // Load data on component mount
  useEffect(() => {
    fetchPMData();
  }, []);

  // Handle grid ready
  const onGridReady = (params) => {
    setGridApi(params.api);
  };

  // Handle load data (for pagination, sorting, filtering)
  const loadData = (options) => {
    // For now, we'll use client-side operations
    // You can enhance this to support server-side operations if needed
    console.log('Load data options:', options);
  };

  // Handle search with debounce
  const handleSearch = (value) => {
    setSearchTerm(value);

    // Clear existing timeout
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }

    // Debounce search
    searchTimeout.current = setTimeout(() => {
      fetchPMData({
        search: value,
        startDate: dateRange?.startDate,
        endDate: dateRange?.endDate,
      });
    }, 300);
  };

  // Handle date range filter
  const handleDateRangeFilter = (value) => {
    let startDate = null;
    let endDate = null;

    const now = moment();

    switch (value) {
      case 'reset':
        setDateRange(null);
        fetchPMData({ search: searchTerm });
        return;
      case 'today':
        startDate = now.startOf('day').toISOString();
        endDate = now.endOf('day').toISOString();
        break;
      case 'yesterday':
        startDate = now.subtract(1, 'days').startOf('day').toISOString();
        endDate = now.endOf('day').toISOString();
        break;
      case 'last7days':
        startDate = now.subtract(7, 'days').startOf('day').toISOString();
        endDate = moment().endOf('day').toISOString();
        break;
      case 'last30days':
        startDate = now.subtract(30, 'days').startOf('day').toISOString();
        endDate = moment().endOf('day').toISOString();
        break;
      case 'lastMonth':
        startDate = now.subtract(1, 'month').startOf('month').toISOString();
        endDate = now.subtract(1, 'month').endOf('month').toISOString();
        break;
      default:
        return;
    }

    const newDateRange = { startDate, endDate };
    setDateRange(newDateRange);
    fetchPMData({
      search: searchTerm,
      startDate,
      endDate,
    });
  };

  // Handle export
  const handleExport = () => {
    if (gridApi) {
      gridApi.exportDataAsExcel({
        fileName: 'PM_List_Export.xlsx',
      });
      message.success('Exporting data to Excel...');
    } else {
      message.error('Grid not ready for export');
    }
  };

  return (
    <div style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="container">
        {/* Filter Toolbar */}
        <div
          style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' }}
        >
          {/* Top row: Heading and Date Filter */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '16px',
            }}
          >
            {/* Left: Heading */}
            <div style={{ flex: '0 0 auto' }}>
              <h1
                style={{
                  fontSize: '24px',
                  fontWeight: '600',
                  color: '#04080B',
                  margin: 0,
                  lineHeight: '1.2',
                  fontFamily:
                    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                Preventive Maintenance List
              </h1>
            </div>

            {/* Right: Date Filter */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {/* Date Range Filter */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  borderRadius: '8px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#fff',
                  padding: '8px 16px',
                  fontSize: '14px',
                  fontWeight: '500',
                  minWidth: '80px',
                  height: '44px',
                  cursor: 'pointer',
                }}
              >
                <img src="Filter.svg" alt="Filter" style={{ width: '20px', height: '20px' }} />
                <DateRangeSelect
                  defaultValue="Filters"
                  style={{
                    border: 'none',
                    backgroundColor: 'transparent',
                    padding: '0',
                    fontSize: '14px',
                    fontWeight: '500',
                    boxShadow: 'none',
                    outline: 'none',
                    width: '120px',
                  }}
                  onChange={handleDateRangeFilter}
                />
              </div>
            </div>
          </div>
        </div>

        {/* AG-Grid Table */}
        <div className="bg-white">
          <AgGrid
            columns={columns}
            data={pmData}
            total={total}
            isFetching={loading}
            loadData={loadData}
            onGridReady={onGridReady}
            autoRefresh={false}
            pageSize={50}
            combos={{}}
            config={{}}
            dispatch={() => {}}
            gridPreferences="{}"
            onRowChange={() => {}}
          />
        </div>
      </div>
    </div>
  );
};

export default Layout(PMList);
