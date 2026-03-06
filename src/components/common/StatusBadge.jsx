import React from 'react';

const StatusBadge = ({ 
  statusId, 
  size = 'default', 
  showDot = true,
  customStyle = {} 
}) => {
  if (!statusId) return null;

  // Centralized status mapping
  const statusMap = {
    '4004a900-94ed-4beb-aae1-d5672ca444ab': {
      text: 'Active',
      color: 'rgba(2, 122, 72, 1)', // Green
      backgroundColor: 'rgba(236, 253, 243, 1)', // Light green
    },
    'f796d898-ca79-4ace-bf6e-e57f615a8f5d': {
      text: 'Request',
      color: 'rgba(53, 56, 205, 1)', // Blue
      backgroundColor: 'rgba(240, 242, 255, 1)', // Light blue
    },
    '31f98cb3-6f0c-49fa-b526-db07aa6fd59e': {
      text: 'Withdrawn',
      color: 'rgba(180, 35, 24, 1)', // Red
      backgroundColor: 'rgba(254, 242, 242, 1)', // Light red
    },
  };

  const status = statusMap[statusId] || {
    text: statusId,
    color: '#8c8c8c', // Default gray for unknown statuses
    backgroundColor: '#f5f5f5', // Default background
  };

  // Size configurations
  const sizeConfig = {
    small: {
      padding: '2px 8px',
      fontSize: '10px',
      height: '20px',
      dotSize: '4px',
    },
    default: {
      padding: '4px 12px',
      fontSize: '12px',
      height: '24px',
      dotSize: '5px',
    },
    large: {
      padding: '6px 16px',
      fontSize: '14px',
      height: '28px',
      dotSize: '6px',
    },
    grid: {
      padding: '1px 20px',
      fontSize: '11px',
      height: '30px',
      dotSize: '5px',
    }
  };

  const config = sizeConfig[size] || sizeConfig.default;

  return (
    <div style={{ 
      display: 'inline-flex', 
      alignItems: 'center', 
      gap: '5px',
      backgroundColor: status.backgroundColor,
      padding: config.padding,
      borderRadius: '16px',
      fontSize: config.fontSize,
      height: config.height,
      ...customStyle
    }}>
      {showDot && (
        <span
          style={{
            display: 'inline-block',
            width: config.dotSize,
            height: config.dotSize,
            borderRadius: '50%',
            backgroundColor: status.color,
            flexShrink: 0,
          }}
        />
      )}
      <span style={{ 
        color: status.color,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        fontWeight: size === 'default' ? 500 : 'normal'
      }}>
        {status.text}
      </span>
    </div>
  );
};

export default StatusBadge;
