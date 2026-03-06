import React, { useState, useEffect } from 'react';
import API from '../../../store/requests';
import moment from 'moment';
import './Charts/dashboard.css';

const UpcomingPreventiveMaintenance = ({ refreshKey }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date().getDate());
  const [maintenanceData, setMaintenanceData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());

  // Fetch PM data from API based on selected week
  const fetchPMData = async () => {
    try {
      setLoading(true);

      // Calculate week start and end dates based on currentWeekStart
      const weekStart = new Date(currentWeekStart);
      const currentDay = weekStart.getDay();
      const startOfWeek = new Date(weekStart);
      startOfWeek.setDate(weekStart.getDate() - currentDay);

      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);

      // Format dates as YYYY-MM-DD
      const formatDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const payload = {
        RequestType: 'PreMain_UI',
        InputJson: JSON.stringify({
          PreMainCal: [
            {
              FilterInfo: [
                {
                  StartDate: formatDate(startOfWeek),
                  EndDate: formatDate(endOfWeek),
                },
              ],
            },
          ],
        }),
        action: 'JsonRequest',
      };

      const response = await API.triggerPost('Plant', payload);

      if (response?.data?.data) {
        // Transform API data to display format
        const transformedData = transformApiData(response.data.data);

        setMaintenanceData(transformedData);
      } else if (response?.data) {
        // Fallback: try response.data directly
        const transformedData = transformApiData(response.data);
        setMaintenanceData(transformedData);
      }
    } catch (error) {
      setMaintenanceData([]);
    } finally {
      setLoading(false);
    }
  };

  // Transform API response to usable format
  const transformApiData = (apiResponse) => {
    const tasks = [];

    try {
      // API structure: response.data.data.PreMain is an ARRAY of PM objects
      if (apiResponse && apiResponse.PreMain && Array.isArray(apiResponse.PreMain)) {
        // Iterate through the PreMain array directly
        apiResponse.PreMain.forEach((pm, index) => {
          const transformedItem = {
            id: pm.PreMainLabelId || pm.PreMainId || 'N/A',
            title: pm.AssetLocation || pm.AssetName || 'Asset Name',
            assetId: pm.AssetId || '',
            assetLabelId: pm.AssetLabelId || '',
            checkListId: pm.CheckListLabelId || '',
            date: pm.PreMainDate ? moment(pm.PreMainDate).format('MMM DD, YYYY') : '',
            status: pm.PreMainStatus || 'Pending',
            daysRemaining: pm.DayRemaining || pm.DaysRemaining || 0,
          };
          tasks.push(transformedItem);
        });
      } else {
      }
    } catch (error) {
      console.error('Error transforming PM data:', error);
    }

    return tasks;
  };

  // Calendar helper functions
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

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(
        <div key={`empty-${i}`} className="p-2 text-center text-xs text-gray-300">
          {new Date(currentDate.getFullYear(), currentDate.getMonth(), -firstDay + i + 1).getDate()}
        </div>,
      );
    }

    // Days of current month
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === new Date().getDate() &&
        currentDate.getMonth() === new Date().getMonth() &&
        currentDate.getFullYear() === new Date().getFullYear();

      const isSelected = day === selectedDate;

      days.push(
        <div
          key={day}
          onClick={() => {
            setSelectedDate(day);
            // Set currentWeekStart to the clicked date to trigger week-based filtering
            const clickedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            setCurrentWeekStart(clickedDate);
          }}
          className={`p-2 text-center text-xs cursor-pointer rounded-full ${
            isToday
              ? 'bg-[#6941C6] text-white font-semibold'
              : isSelected
                ? 'bg-[#F9F5FF] text-[#6941C6] font-semibold'
                : 'hover:bg-gray-100'
          }`}
        >
          {day}
        </div>,
      );
    }

    return days;
  };

  // Render status badge
  const renderStatusBadge = (status) => {
    const statusLower = status.toLowerCase();

    if (statusLower.includes('complet')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#ECFDF3] text-[#027A48]">
          • Completed
        </span>
      );
    } else if (statusLower.includes('over') || statusLower.includes('due')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FEF3F2] text-[#B42318]">
          • Over Due
        </span>
      );
    } else if (statusLower.includes('progress')) {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#EEF4FF] text-[#3538CD]">
          • In Progress
        </span>
      );
    } else {
      return (
        <span className="px-3 py-1 rounded-full text-xs font-medium bg-[#FFFAEB] text-[#F79009]">
          • Pending
        </span>
      );
    }
  };

  // Fetch data when component mounts or when week changes
  useEffect(() => {
    fetchPMData();
  }, [currentWeekStart, refreshKey]);

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
      {/* Title */}
      <div className="mb-4">
        <h3 className="text-base font-semibold text-gray-900">Preventive maintenances</h3>
      </div>

      {/* Date Navigation */}
      <div className="flex justify-center items-center gap-4 mb-4">
        <button className="p-1 hover:bg-gray-100 rounded" onClick={() => navigateMonth(-1)}>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <span className="text-sm font-medium">{formatMonthYear(currentDate)}</span>
        <button className="p-1 hover:bg-gray-100 rounded" onClick={() => navigateMonth(1)}>
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="mb-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
            <div
              key={`${day}-${index}`}
              className="p-2 text-xs font-medium text-gray-500 text-center"
            >
              {day}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">{renderCalendar()}</div>
      </div>

      {/* Upcoming Preventive maintenances */}
      <hr style={{ border: 'none', height: '1px', backgroundColor: '#EAECF0', margin: '10px 0' }} />
      <div>
        <div className="flex justify-between items-center mb-3">
          <h4 className="text-sm font-medium text-gray-900">Upcoming Preventive maintenances</h4>
        </div>

        <hr
          style={{ border: 'none', height: '1px', backgroundColor: '#EAECF0', margin: '10px 0' }}
        />

        <div className="scroll-container-bottom">
          <div className="scroll-content space-y-3">
            {loading ? (
              <div className="text-center py-8 text-gray-500">Loading...</div>
            ) : maintenanceData.length > 0 ? (
              maintenanceData.map((item, index) => (
                <div
                  key={index}
                  className="p-4 border border-gray-200 rounded-lg hover:shadow-sm transition-shadow"
                >
                  {/* Top row: PM ID and Status Badge */}
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-[#6941C6]">{item.id}</span>
                    {renderStatusBadge(item.status)}
                  </div>

                  <hr
                    style={{
                      border: 'none',
                      height: '1px',
                      backgroundColor: '#EAECF0',
                      margin: '6px 0',
                    }}
                  />

                  {/* Asset Title */}
                  <h4 className="text-base font-medium text-[#18181A] mb-1">{item.title}</h4>

                  {/* Days Remaining */}
                  <p className="text-sm text-[#475467]">
                    {item.daysRemaining === '-' || item.daysRemaining === 0
                      ? 'Due today'
                      : `${item.daysRemaining}`}
                  </p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No upcoming maintenance found</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpcomingPreventiveMaintenance;
