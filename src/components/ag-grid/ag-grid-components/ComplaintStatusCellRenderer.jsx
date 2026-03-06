import React from 'react';

const ComplaintStatusCellRenderer = (props) => {
  const value = props.value || '';
  const data = props.data || {};

  // Get display text from value or fallback fields
  let displayText = value;

  if (!displayText || displayText === '') {
    const possibleFields = ['CompliantStatus', 'Status'];
    for (const field of possibleFields) {
      if (data[field] !== undefined && data[field] !== null) {
        displayText = data[field];
        break;
      }
    }
  }

  // Complaint Status color mapping
  const statusMap = {
    Pending: {
      text: 'Pending',
      color: '#F79009',
      bg: '#FFFAEB',
      dot: '#F79009',
    },
    BreakDown: {
      text: 'BreakDown',
      color: '#6172F3',
      bg: '#EEF4FF',
      dot: '#6172F3',
    },
    Observation: {
      text: 'Observation',
      color: '#6172F3',
      bg: '#EEF4FF',
      dot: '#6172F3',
    },

    Closed: {
      text: 'Closed',
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

export default ComplaintStatusCellRenderer;
