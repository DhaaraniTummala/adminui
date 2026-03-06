import React from 'react';
import { formatText } from '../core/utils';
import moment from 'moment';

/**
 * Creates a tracking detail section with form-style layout (no purple box)
 * Specifically for Vehicle and Visitor tracking detail views
 * @param {Object} params - Configuration object
 * @param {Array} params.fields - Array of field configurations
 * @param {Object} params.rowData - Data object containing the field values
 * @param {number} [params.columnCount=3] - Number of columns in the grid (default 3)
 * @returns {JSX.Element} - Rendered section component
 */
export const createTrackingDetailSection = ({ fields, rowData, columnCount = 3 }) => {
  // Validate column count
  const validColumnCount = Math.max(1, Math.min(4, parseInt(columnCount) || 3));

  // Styles matching the form layout
  const styles = {
    grid: {
      display: 'grid',
      gridTemplateColumns: `repeat(${validColumnCount}, 1fr)`,
      gap: '24px 20px',
      width: '100%',
    },
    field: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      fontWeight: 500,
      fontSize: '12px',
      color: '#18181A',
      marginBottom: '6px',
    },
    value: {
      padding: '10px 12px',
      border: '1px solid #F2F4F7',
      borderRadius: '8px',
      fontSize: '14px',
      color: '#475467',
      backgroundColor: '#F9FAFB',
      minHeight: '40px',
      display: 'flex',
      alignItems: 'center',
    },
  };

  // Format value based on type
  const formatValue = (field, value, rowData) => {
    // If value is nullish, show placeholder
    if (value === null || value === undefined || value === '') {
      return '-';
    }

    // Check field type for special formatting
    if (field.type === 'date' && value) {
      return moment(value).format('DD-MM-YYYY');
    }
    if (field.type === 'datetime' && value) {
      return moment(value).format('DD-MM-YYYY HH:mm');
    }
    if (field.type === 'boolean' || field.type === 'toggle') {
      return value ? 'Yes' : 'No';
    }

    // Use custom formatter if provided
    if (typeof field.formatter === 'function') {
      return field.formatter(value, rowData);
    }
    if (typeof field.render === 'function') {
      return field.render(value, rowData);
    }

    return formatText(value);
  };

  return (
    <div style={styles.grid}>
      {fields.map((field, idx) => {
        const fieldKey = typeof field === 'string' ? field : field.key || field.dataIndex;
        const fieldLabel = field.title || field.headerName || fieldKey;
        const fieldValue = rowData[fieldKey];
        const isFullWidth = field.fullWidth === true;

        // Style for full-width fields (like Remarks/textarea)
        const fieldStyle = isFullWidth
          ? { ...styles.field, gridColumn: '1 / -1' } // Span all columns
          : styles.field;

        const valueStyle = isFullWidth
          ? {
              ...styles.value,
              minHeight: '100px', // Taller for textarea-like fields
              alignItems: 'flex-start', // Align text to top
              whiteSpace: 'pre-wrap', // Preserve line breaks
              wordBreak: 'break-word', // Break long words
            }
          : styles.value;

        return (
          <div key={idx} style={fieldStyle}>
            <label style={styles.label}>{fieldLabel}</label>
            <div style={valueStyle}>{formatValue(field, fieldValue, rowData)}</div>
          </div>
        );
      })}
    </div>
  );
};

export default {
  createTrackingDetailSection,
};
