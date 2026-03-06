import React from 'react';

const PMStatusCellRenderer = (props) => {
  const status = props.value;

  if (!status) {
    return <span style={{ color: '#999' }}>-</span>;
  }

  const lower = status.toLowerCase();

  let config = {
    text: status,
    color: '#F79009',
    backgroundColor: '#FFFAEB',
  };

  // Completed
  if (lower.includes('complet')) {
    config = {
      text: 'Completed',
      color: '#027A48',
      backgroundColor: '#ECFDF3',
    };
  }
  // Over Due
  else if (lower.includes('over')) {
    config = {
      text: 'Over Due',
      color: '#B42318',
      backgroundColor: '#FEF3F2',
    };
  }
  // Pending
  else if (lower.includes('pend')) {
    config = {
      text: 'Pending',
      color: '#B54708',
      backgroundColor: '#FFFAEB',
    };
  }

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '5px',
        backgroundColor: config.backgroundColor,
        padding: '4px 12px',
        borderRadius: '16px',
        fontSize: '11px',
        height: '28px',
      }}
    >
      <span
        style={{
          display: 'inline-block',
          width: '5px',
          height: '5px',
          borderRadius: '50%',
          backgroundColor: config.color,
          flexShrink: 0,
        }}
      />
      <span
        style={{
          color: config.color,
          fontWeight: 'bold',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {config.text}
      </span>
    </div>
  );
};

export default PMStatusCellRenderer;
