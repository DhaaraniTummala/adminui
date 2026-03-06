import React from 'react';

const PriorityCellRenderer = (props) => {
  const value = props.value || '';
  const data = props.data || {};

  const numericToTextMap = { 1: 'Low', 2: 'Medium', 3: 'High' };
  let displayText = value;

  if (typeof value === 'number' || (typeof value === 'string' && !isNaN(value))) {
    const numericValue = parseInt(value);
    displayText = numericToTextMap[numericValue] || value;
  }

  if (!displayText || displayText === '') {
    const possibleFields = [
      'CompliantPriority',
      'CompliantPriorityStatus',
      'Priority',
      'PriorityStatus',
    ];
    for (const field of possibleFields) {
      if (data[field] !== undefined && data[field] !== null) {
        const fieldValue = data[field];
        if (typeof fieldValue === 'number') {
          displayText = numericToTextMap[fieldValue] || fieldValue;
        } else if (typeof fieldValue === 'string') {
          displayText = fieldValue;
        }
        break;
      }
    }
  }

  const priorityMap = {
    Low: {
      text: 'Low',
      color: '#FFFFFF',
      bg: '#12B76A',
      dot: '#FFFFFF',
    },
    Medium: {
      text: 'Medium',
      color: '#FFFFFF',
      bg: '#F79009',
      dot: '#FFFFFF',
    },
    High: {
      text: 'High',
      color: '#FFFFFF',
      bg: '#F04438',
      dot: '#FFFFFF',
    },
  };

  const priority = priorityMap[displayText] || {
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

        fontSize: '11px',
        lineHeight: '20px',
        color: priority.color,
        backgroundColor: priority.bg,
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
          backgroundColor: priority.dot,
        }}
      ></span>
      {priority.text}
    </div>
  );
};

export default PriorityCellRenderer;
