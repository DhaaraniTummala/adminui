import React from 'react';

const TrackingStatusCellRenderer = (props) => {
  const value = props.value || '';
  const data = props.data || {};

  let displayText = value;

  if (!displayText || displayText === '') {
    const possibleFields = ['InStatus', 'Status', 'TrackingStatus'];
    for (const field of possibleFields) {
      if (data[field] !== undefined && data[field] !== null) {
        displayText = data[field];
        break;
      }
    }
  }

  if (!displayText || displayText === '') {
    const isCheckedOut = data.OutDateTime !== null && data.OutDateTime !== undefined;
    displayText = isCheckedOut ? 'CHECK OUT' : 'CHECK IN';
  }

  const statusMap = {
    'CHECK IN': {
      text: 'CHECK IN',
      color: '#027A48',
      bg: '#ECFDF3',
      dot: '#12B76A',
    },
    'CHECK OUT': {
      text: 'CHECK OUT',
      color: '#B42318',
      bg: '#FEF3F2',
      dot: '#F04438',
    },
  };

  const statusUpper = displayText.toUpperCase().trim();
  const status = statusMap[statusUpper] || {
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
        textTransform: 'uppercase',
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

export default TrackingStatusCellRenderer;
