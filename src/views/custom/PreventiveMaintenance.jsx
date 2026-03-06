import React, { useState, useEffect } from 'react';
import { PlusOutlined, LeftOutlined, RightOutlined } from '@ant-design/icons';
import { Button, Spin, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import ScheduleMaintenanceDrawer from './ScheduleMaintenanceDrawer';
import PreventiveMaintenanceViewMode from '../../components/PreventiveMaintenanceViewMode';
import UpcomingPMCard from './UpcomingPMCard';
import Layout from '../../components/Layout';
import API from '../../store/requests';
import './PreventiveMaintenance.css';

// Helper function to determine status badge type for weekly calendar cards
const renderStatusBadge = (status) => {
  if (!status) return null;

  const lower = status.toLowerCase();

  if (lower.includes('over')) {
    return (
      <span
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
        style={{
          fontSize: '10px',
          backgroundColor: '#f9e4e6ff',
          color: '#B42318',
          fontWeight: 'bold',
        }}
      >
        <span
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: '#E02424',
            display: 'inline-block',
          }}
        ></span>
        Over Due
      </span>
    );
  }

  if (lower.includes('complet')) {
    return (
      <span
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
        style={{
          fontSize: '10px',
          backgroundColor: '#e6f9e6ff',
          color: '#23B418',
          fontWeight: 'bold',
        }}
      >
        <span
          style={{
            width: '5px',
            height: '5px',
            borderRadius: '50%',
            backgroundColor: '#23B418',
            display: 'inline-block',
          }}
        ></span>
        Completed
      </span>
    );
  }

  return (
    <span
      className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium"
      style={{
        fontSize: '10px',
        backgroundColor: '#FFFAEB',
        color: '#F79009',
        fontWeight: 'bold',
      }}
    >
      <span
        style={{
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: '#F79009',
          display: 'inline-block',
        }}
      ></span>
      Pending
    </span>
  );
};

const PreventiveMaintenance = () => {
  const navigate = useNavigate();
  const today = new Date();
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today.getDate());
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [drawerKey, setDrawerKey] = useState(0);
  const [loading, setLoading] = useState(false);
  const [apiData, setApiData] = useState(null);
  const [error, setError] = useState(null);
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [viewSelectedRow, setViewSelectedRow] = useState(null);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  // Load Plus Jakarta Sans font from Google Fonts
  useEffect(() => {
    const link = document.createElement('link');
    link.href =
      'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    return () => {
      document.head.removeChild(link);
    };
  }, []);

  useEffect(() => {
    fetchPreMainData();
  }, [currentWeekStart]);

  // Sync horizontal scrollbar with content
  useEffect(() => {
    const content = document.querySelector('.custom-scroll-content');
    const scrollbar = document.getElementById('horizontal-scrollbar');
    const scrollbarContent = document.querySelector('.scrollbar-content');

    if (content && scrollbar && scrollbarContent) {
      // Calculate and set scrollbar content width
      const updateScrollbarWidth = () => {
        const contentScrollWidth = content.scrollWidth;
        const contentClientWidth = content.clientWidth;

        if (contentScrollWidth > contentClientWidth) {
          // Make scrollbar content wider to enable scrolling
          scrollbarContent.style.width = `${contentScrollWidth}px`;
          scrollbar.style.display = 'block';
        } else {
          scrollbar.style.display = 'none';
        }
      };

      // Sync scroll positions
      const syncContentToScrollbar = () => {
        scrollbar.scrollLeft = content.scrollLeft;
      };

      const syncScrollbarToContent = () => {
        content.scrollLeft = scrollbar.scrollLeft;
      };

      // Initial setup
      updateScrollbarWidth();

      // Add event listeners
      content.addEventListener('scroll', syncContentToScrollbar);
      scrollbar.addEventListener('scroll', syncScrollbarToContent);
      window.addEventListener('resize', updateScrollbarWidth);

      return () => {
        content.removeEventListener('scroll', syncContentToScrollbar);
        scrollbar.removeEventListener('scroll', syncScrollbarToContent);
        window.removeEventListener('resize', updateScrollbarWidth);
      };
    }
  }, [apiData]);

  const fetchPreMainData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Format dates as YYYY-MM-DD
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      // Calculate CURRENT week (for Upcoming PM)
      const today = new Date();
      const todayDay = today.getDay();
      const todayWeekStart = new Date(today);
      todayWeekStart.setDate(today.getDate() - todayDay);
      todayWeekStart.setHours(0, 0, 0, 0);

      const todayWeekEnd = new Date(todayWeekStart);
      todayWeekEnd.setDate(todayWeekStart.getDate() + 6);
      todayWeekEnd.setHours(23, 59, 59, 999);

      // Calculate SELECTED week (for Calendar) - using state variable
      const selectedWeek = new Date(currentWeekStart); // This is the state variable
      const selectedDay = selectedWeek.getDay();
      const selectedWeekStart = new Date(selectedWeek);
      selectedWeekStart.setDate(selectedWeek.getDate() - selectedDay);
      selectedWeekStart.setHours(0, 0, 0, 0);

      const selectedWeekEnd = new Date(selectedWeekStart);
      selectedWeekEnd.setDate(selectedWeekStart.getDate() + 6);
      selectedWeekEnd.setHours(23, 59, 59, 999);

      // Fetch data for BOTH weeks (earliest start to latest end)
      const fetchStart = todayWeekStart < selectedWeekStart ? todayWeekStart : selectedWeekStart;
      const fetchEnd = todayWeekEnd > selectedWeekEnd ? todayWeekEnd : selectedWeekEnd;

      const payload = {
        RequestType: 'PreMain_UI',
        InputJson: JSON.stringify({
          PreMainCal: [
            {
              FilterInfo: [
                {
                  StartDate: formatDate(fetchStart),
                  EndDate: formatDate(fetchEnd),
                },
              ],
            },
          ],
        }),
        action: 'JsonRequest',
      };

      const response = await API.triggerPost('Plant', payload);

      if (response?.data) {
        setApiData(response.data);
      }
    } catch (err) {
      setError(err.message || 'Failed to load data');
      message.error('Failed to load preventive maintenance data');
    } finally {
      setLoading(false);
    }
  };

  // Navigate to previous/next week
  const navigateWeek = (direction) => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + direction * 7);
    setCurrentWeekStart(newDate);
  };

  const handleScheduleNew = () => {
    setDrawerKey((prev) => prev + 1);
    setIsDrawerOpen(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerOpen(false);
  };

  const handleSubmit = (values) => {
    setIsDrawerOpen(false);
    fetchPreMainData();
  };

  const handleOpenView = (task) => {
    setViewSelectedRow({
      PreMainCalId: task.PreMainCalId,
      PreMainLabelId: task.id,
      PreMainId: task.PreMainId,
      CheckListId: task.CheckListId,
    });
    setIsViewOpen(true);
  };

  const handleCloseView = () => {
    setIsViewOpen(false);
    setViewSelectedRow(null);
  };

  const handleViewSuccess = () => {
    setIsViewOpen(false);
    setViewSelectedRow(null);
    fetchPreMainData();
  };

  const transformApiData = (apiResponse) => {
    const records = apiResponse?.data?.PreMain;

    if (!records || !Array.isArray(records)) {
      return { maintenanceSchedule: {}, upcomingTasks: [] };
    }

    const maintenanceSchedule = {};
    const upcomingTasks = [];

    // Calculate current week range for filtering Upcoming PM
    const today = new Date();
    const todayDay = today.getDay();
    const todayWeekStart = new Date(today);
    todayWeekStart.setDate(today.getDate() - todayDay);
    todayWeekStart.setHours(0, 0, 0, 0);

    const todayWeekEnd = new Date(todayWeekStart);
    todayWeekEnd.setDate(todayWeekStart.getDate() + 6);
    todayWeekEnd.setHours(23, 59, 59, 999);

    records.forEach((record) => {
      console.log(record);
      const date = new Date(record.PreMainDate);
      const day = date.getDate();

      const diffTime = date - today;
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      let status = 'pending';
      if (record.PreMainStatus?.toLowerCase().includes('over')) status = 'overdue';
      else if (record.PreMainStatus?.toLowerCase().includes('complet')) status = 'completed';

      const scheduleItem = {
        id: record.PreMainLabelId,
        PreMainCalId: record.PreMainCalId,
        PreMainId: record.PreMainId,
        CheckListId: record.CheckListId,
        CheckListLabelId: record.CheckListLabelId,
        DayRemaining: record.DayRemaining,
        title: record.AssetName || record.EquipmentId || 'Maintenance Task',
        date: date.toLocaleDateString('en-GB').replace(/\//g, '-'),
        daysRemaining: Math.abs(daysRemaining),
        status: status,
        code: `${record.CheckListLabelId || 'N/A'} • ${record.EquipmentId}`,
      };

      if (!maintenanceSchedule[day]) maintenanceSchedule[day] = [];
      maintenanceSchedule[day].push(scheduleItem);

      // Only add to upcomingTasks if:
      // 1. IsClosed is false
      // 2. Task date is within CURRENT week (not selected week)
      if (!record.IsClosed) {
        const isInCurrentWeek = date >= todayWeekStart && date <= todayWeekEnd;

        if (isInCurrentWeek) {
          upcomingTasks.push({
            id: record.PreMainLabelId,
            PreMainCalId: record.PreMainCalId,
            PreMainId: record.PreMainId,
            title: record.AssetName || record.EquipmentId || 'Maintenance Task',
            daysRemaining: Math.abs(daysRemaining),
            DayRemaining: record.DayRemaining,
            status: status,
            CheckListLabelId: record.CheckListLabelId || 'N/A',
            EquipmentId: record.EquipmentId,
            maintenanceDate: new Date(record.PreMainDate)
              .toLocaleDateString('en-GB')
              .replace(/\//g, '-'),
            completedDate: record.IsClosed
              ? new Date(record.PreMainDate).toLocaleDateString('en-GB').replace(/\//g, '-')
              : null,
            dueDate: !record.IsClosed
              ? new Date(record.PreMainDate).toLocaleDateString('en-GB').replace(/\//g, '-')
              : null,
            createdDate: new Date(record.CreatedDate)
              .toLocaleDateString('en-GB')
              .replace(/\//g, '-'),
          });
        }
      }
    });

    return { maintenanceSchedule, upcomingTasks };
  };

  const { maintenanceSchedule, upcomingTasks } = apiData
    ? transformApiData(apiData)
    : { maintenanceSchedule: {}, upcomingTasks: [] };

  const getDaysInMonth = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const getFirstDayOfMonth = (date) => new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  const formatMonthYear = (date) =>
    date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    for (let i = 0; i < firstDay; i++) {
      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 0);
      const prevDay = prevMonth.getDate() - (firstDay - i - 1);
      days.push(
        <div
          key={`prev-${i}`}
          className="h-6 w-6 flex items-center justify-center text-gray-400 text-xs"
        >
          {prevDay}
        </div>,
      );
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const isSelected = day === selectedDate;
      const hasEvents = maintenanceSchedule[day]?.length > 0;
      days.push(
        <div
          key={day}
          onClick={() => {
            setSelectedDate(day);
            // Update week view when calendar date is clicked
            const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            setCurrentWeekStart(clickedDate);
          }}
          className={`h-7 w-7 flex items-center justify-center text-xs cursor-pointer rounded-full transition-colors ${
            isSelected
              ? 'bg-[#6941C6] text-white'
              : hasEvents
                ? 'text-[#6941C6] font-medium hover:bg-[#6941C6]'
                : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {day.toString().padStart(2, '0')}
        </div>,
      );
    }

    const totalCells = Math.ceil((firstDay + daysInMonth) / 7) * 7;
    const remainingCells = totalCells - (firstDay + daysInMonth);
    for (let i = 1; i <= remainingCells; i++) {
      days.push(
        <div
          key={`next-${i}`}
          className="h-8 w-8 flex items-center justify-center text-gray-400 text-xs"
        >
          {i.toString().padStart(2, '0')}
        </div>,
      );
    }
    return days;
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <Spin size="large" />
            <p className="mt-4 text-gray-600">Loading Preventive Maintenance data...</p>
          </div>
        </div>
      );
    }

    return (
      <div
        className="p-2  min-h-screen"
        style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", marginTop: '-10px' }}
      >
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-[24px] font-semibold text-gray-900 mb-1">Preventive Maintenance</h1>
          <div className="flex gap-3">
            <Button
              className="border-gray-300"
              onClick={() => navigate('/Asset/CheckList')}
              style={{
                padding: '24px',
                color: '#7F56D9',
                borderColor: '#7F56D9',
                fontSize: '14px',
              }}
            >
              <img src="CheckList.svg" alt="CheckList" style={{ width: '18px', height: '18px' }} />
              Check Lists
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              className="bg-[#6941C6] border-[#6941C6] "
              onClick={handleScheduleNew}
              style={{
                fontSize: '14px',
                padding: '24px 24px',
                color: '#fff',
                borderColor: '#6941C6',
                backgroundColor: '#6941C6',
                hover: {
                  backgroundColor: '#6941C6',
                  borderColor: '#6941C6',
                },
              }}
            >
              Schedule
            </Button>
          </div>
        </div>

        <div className="flex gap-6">
          <div className="w-80 flex-shrink-0" style={{ maxHeight: '750px' }}>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <Button type="text" icon={<LeftOutlined />} onClick={() => navigateMonth(-1)} />
                <h3 className="font-semibold text-gray-900">{formatMonthYear(currentDate)}</h3>
                <Button type="text" icon={<RightOutlined />} onClick={() => navigateMonth(1)} />
              </div>
              <div className="grid grid-cols-7 gap-1 mb-2 text-center text-sm font-medium text-gray-500">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((d) => (
                  <div key={d} className="py-2">
                    {d}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-900">Upcoming Preventive Maintenance</h3>
                {/* <h4 
                  className="p-0 text-sm cursor-pointer hover:underline" 
                  style={{ fontWeight: 'bold', color: '#6941C6' }}
                  onClick={() => navigate('/Asset/CheckList')}
                >
                  Check Lists
                </h4> */}
              </div>
              <hr style={{ marginBottom: '8px', width: '320px', marginLeft: '-15px' }} />
              <div
                className="space-y-3 overflow-y-auto custom-scroll"
                style={{
                  height: '250px',
                }}
              >
                {upcomingTasks.map((task) => (
                  <UpcomingPMCard key={task.id} task={task} onClick={handleOpenView} />
                ))}
              </div>
            </div>
          </div>

          <div
            className="flex-1 bg-white border rounded-lg shadow-sm p-5 overflow-y-auto custom-scroll"
            style={{
              maxHeight: '630px',
              scrollBehavior: 'smooth',
            }}
          >
            {/* Horizontal scroll section with footer */}
            <div className="horizontal-section-with-footer">
              <div className="relative overflow-x-hidden custom-scroll-content">
                {(() => {
                  // Get current week's days dynamically
                  const weekStart = new Date(currentWeekStart);
                  const currentDay = weekStart.getDay();
                  const startOfWeek = new Date(weekStart);
                  startOfWeek.setDate(weekStart.getDate() - currentDay);

                  // Generate 7 days starting from Sunday
                  const weekDays = [];
                  const dayNames = [
                    'Sunday',
                    'Monday',
                    'Tuesday',
                    'Wednesday',
                    'Thursday',
                    'Friday',
                    'Saturday',
                  ];

                  for (let i = 0; i < 7; i++) {
                    const date = new Date(startOfWeek);
                    date.setDate(startOfWeek.getDate() + i);
                    weekDays.push({
                      day: dayNames[date.getDay()],
                      date: date.getDate(),
                      fullDate: date,
                    });
                  }

                  return weekDays;
                })().map((info, idx) => (
                  <div
                    key={info.day}
                    className={`flex ${idx > 0 ? 'border-t border-gray-200' : ''}`}
                    style={{ minHeight: '120px' }}
                  >
                    <div
                      className="text-center border-r border-gray-200 sticky left-0 bg-white z-10 flex flex-col justify-center py-4"
                      style={{ width: '90px', minWidth: '90px' }}
                    >
                      <div className="text-xs text-gray-400 mb-1">{info.day}</div>
                      <div
                        onClick={() => setSelectedDate(info.date)}
                        className={`text-3xl font-semibold cursor-pointer ${
                          info.date === selectedDate ? 'text-[#6941C6]' : 'hover:text-[#6941C6]'
                        }`}
                      >
                        {info.date}
                      </div>
                    </div>

                    <div
                      className="flex gap-3 flex-1 py-4 px-3 items-start"
                      style={{
                        minWidth: 'max-content',
                      }}
                    >
                      {(maintenanceSchedule[info.date] || []).map((task) => (
                        <div
                          key={task.id}
                          className="p-3 rounded-lg border flex-shrink-0 flex flex-col gap-2 hover:shadow-sm cursor-pointer"
                          style={{
                            width: '250px',
                            backgroundColor:
                              task.status === 'completed'
                                ? 'rgba(236, 253, 243, 1)'
                                : task.status === 'overdue'
                                  ? 'rgba(254, 243, 242, 1)'
                                  : 'rgba(255, 251, 235, 1)',

                            border:
                              task.status === 'completed'
                                ? '2px solid #027A48'
                                : task.status === 'overdue'
                                  ? '2px solid #FF4D4F'
                                  : '2px solid #B54708',
                          }}
                          onClick={() => handleOpenView(task)}
                        >
                          <div className="flex justify-between items-center">
                            <span
                              style={{ color: '#6941C6', fontSize: '10px', fontWeight: 'bold' }}
                            >
                              {task.id}
                            </span>
                            {renderStatusBadge(task.status)}
                          </div>

                          <h4 className="font-medium text-xs leading-tight line-clamp-2">
                            {task.title}
                          </h4>

                          <div className="mt-auto text-[10px]">
                            <p className="text-gray-500">
                              {task.date} {task.DayRemaining}
                            </p>
                            <p
                              className="text-[#18181A] mt-1"
                              style={{
                                fontWeight: '400',
                                fontSize: '10px',
                                fontFamily: 'sans-serif',
                              }}
                            >
                              {task.code}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer with horizontal scrollbar */}
              <div className="horizontal-scroll-footer">
                <div className="horizontal-scrollbar" id="horizontal-scrollbar">
                  <div className="scrollbar-content"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {renderContent()}
      <ScheduleMaintenanceDrawer
        key={drawerKey}
        open={isDrawerOpen}
        onClose={handleDrawerClose}
        onFinish={handleSubmit}
      />
      {isViewOpen && (
        <PreventiveMaintenanceViewMode
          showRowDetail={isViewOpen}
          onClose={handleCloseView}
          onSuccess={handleViewSuccess}
          selectedRowData={viewSelectedRow}
        />
      )}
    </>
  );
};

export default Layout(PreventiveMaintenance);
