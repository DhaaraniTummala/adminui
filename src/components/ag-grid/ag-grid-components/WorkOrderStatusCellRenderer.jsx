import React from 'react';

const WorkOrderStatusCellRenderer = (props) => {
  const value = props.value || '';
  const data = props.data || {};

  console.log(data)

  // Get display text from value or fallback fields
  let displayText = value;

  if (!displayText || displayText === '') {
    const possibleFields = ['Status', 'WorkOrderStatus', 'WOStatus'];
    for (const field of possibleFields) {
      if (data[field] !== undefined && data[field] !== null) {
        displayText = data[field];
        break;
      }
    }
  }

  // Check IsClosed field to determine status if no explicit status
  // Standard logic: IsClosed = false means "Open" (work order is still open/active)
  //                 IsClosed = true means "Closed" (work order is completed)
  if (!displayText || displayText === '') {
    const isClosed = data.IsClosed === true;
    displayText = isClosed ? 'Closed' : 'Open';
  }

  // Work Order Status color mapping
  const statusMap = {
    Open: {
      text: 'Open',
      color: '#027A48',
      bg: '#ECFDF3',
      dot: '#12B76A',
    },
    Closed: {
      text: 'Closed',
      color: '#B42318',
      bg: '#FEF3F2',
      dot: '#F04438',
    },
    'In Progress': {
      text: 'In Progress',
      color: '#6172F3',
      bg: '#EEF4FF',
      dot: '#6172F3',
    },
    Completed: {
      text: 'Completed',
      color: '#12B76A',
      bg: '#ECFDF3',
      dot: '#12B76A',
    },
  };

  const status = statusMap[displayText] || {
    text: displayText || 'Unknown',
    color: '#FFFFFF',
    bg: '#6B7280',
    dot: '#FFFFFF',
  };

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        height: '23px',
        padding: '0 12px',
        borderRadius: '9999px',
        fontSize: '12px',
        lineHeight: '20px',
        color: status.color,
        backgroundColor: status.bg,
        fontFamily: 'Poppins, sans-serif',
        textTransform: 'capitalize',
        boxSizing: 'border-box',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '4px',
          height: '4px',
          borderRadius: '50%',
          backgroundColor: status.dot,
        }}
      ></span>
      {status.text}
    </div>
  );
};

export default WorkOrderStatusCellRenderer;
