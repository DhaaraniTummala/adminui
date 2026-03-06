import React from 'react';
import { formatText } from '../core/utils';

/**
 * Creates a generic section with a title and configurable grid layout
 * @param {Object} params - Configuration object
 * @param {string} params.title - Section title
 * @param {Array} params.fields - Array of field configurations
 * @param {Object} params.rowData - Data object containing the field values
 * @param {number} [params.columnCount=2] - Number of columns in the grid (1-4)
 * @param {Object} [params.styles] - Custom styles object
 * @returns {JSX.Element} - Rendered section component
 */
export const createGenericSection = ({ title, fields, rowData, columnCount = 2, styles = {} }) => {
  // Validate column count
  const validColumnCount = Math.max(1, Math.min(4, parseInt(columnCount) || 2));

  // Default styles
  const defaultStyles = {
    section: {
      border: '1px solid #e5e7eb',
      borderRadius: '8px',
      overflow: 'hidden',
      marginBottom: '16px',
      ...styles.section,
    },
    header: {
      background: 'rgb(105 65 198)',
      color: '#fff',
      padding: '12px 16px',
      borderBottom: '1px solid #ececec',
      ...styles.header,
    },
    title: {
      margin: 0,
      fontSize: '14px',
      fontWeight: 600,
      ...styles.title,
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${validColumnCount}, 1fr)`,
      gap: '12px 24px',
      padding: '16px',
      background: 'white',
      ...styles.grid,
    },
    field: {
      ...styles.field,
    },
    label: {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#475467',
      margin: '0 0 4px 0',
      ...styles.label,
    },
    value: {
      fontFamily: 'sans-serif',
      fontSize: '12px',
      color: '#18181A',
      margin: 0,
      wordBreak: 'break-word',
      ...styles.value,
    },
  };

  // Format value based on type
  const formatValue = (value, formatter, rowData) => {
    // If value is nullish, avoid calling formatter and show a placeholder
    if (value === null || value === undefined || value === '') {
      return '-';
    }
    if (typeof formatter === 'function') {
      return formatter(value, rowData);
    }
    return formatText(value);
  };

  return (
    <div style={defaultStyles.section}>
      <div style={defaultStyles.header}>
        <p style={defaultStyles.title}>{title}</p>
      </div>
      <div style={defaultStyles.grid}>
        {fields.map((field, idx) => {
          const fieldKey = typeof field === 'string' ? field : field.key || field.dataIndex;
          const fieldLabel = field.title || field.headerName || fieldKey;
          const fieldValue = rowData[fieldKey];
          const formatter = field.formatter || field.render;

          return (
            <div key={idx} style={defaultStyles.field}>
              <p style={defaultStyles.label}>{fieldLabel}</p>
              <p style={defaultStyles.value}>{formatValue(fieldValue, formatter, rowData)}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default {
  createGenericSection,
};
