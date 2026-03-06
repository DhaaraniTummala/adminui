import React from 'react';

// Render status badge for PM cards
const renderStatusBadge = (status) => {
  if (!status) return null;

  const lower = status.toLowerCase();

  // Overdue
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

  // Completed
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

  // Pending (default)
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

/**
 * UpcomingPMCard Component
 * Displays a single preventive maintenance task card with details
 *
 * @param {Object} task - The PM task object
 * @param {Function} onClick - Handler for card click
 */
const UpcomingPMCard = ({ task, onClick }) => {
  return (
    <div
      className="p-3 rounded-lg border cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(task)}
    >
      {/* Header: PM ID and Status Badge */}
      <div className="flex justify-between items-start mb-2">
        <span style={{ color: '#6941C6', fontSize: '10px', fontWeight: 'bold' }}>{task.id}</span>
        {renderStatusBadge(task.status)}
      </div>

      <hr style={{ marginBottom: '10px' }} />

      {/* Title */}
      <p className="text-sm font-medium">{task.title}</p>

      {/* Days Remaining */}
      <p className="text-xs text-[#475467] mb-3">{task.daysRemaining} Days Remaining</p>

      <hr style={{ marginBottom: '8px' }} />

      {/* Task Details */}
      <div className="space-y-1 text-xs">
        <div className="flex justify-between">
          <span className="text-[#475467]">Checklist ID</span>
          <span className="font-medium">{task.CheckListLabelId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#475467]">Asset ID</span>
          <span className="font-medium">{task.EquipmentId}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-[#475467]">Maintenance Date</span>
          <span className="font-medium">{task.maintenanceDate}</span>
        </div>
        {!!task.completedDate && (
          <div className="flex justify-between">
            <span className="text-[#475467]">Completed</span>
            <span className="font-medium">{task.completedDate}</span>
          </div>
        )}
        {!!task.dueDate && (
          <div className="flex justify-between">
            <span className="text-[#475467]">Due Date</span>
            <span className="font-medium">{task.dueDate}</span>
          </div>
        )}
        <div className="flex justify-between">
          <span className="text-[#475467]">Created Date</span>
          <span className="font-medium">{task.createdDate}</span>
        </div>
      </div>
    </div>
  );
};

export default UpcomingPMCard;
