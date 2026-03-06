import React from 'react';
import { createGenericSection } from '../../utils/sectionUtils';
import Dates from '../../core/utils/date';
import { formatBoolean } from '../../core/utils';

/**
 * Shared AssetDetailsSection component for consistent display across ComplaintViewMode and BreakDownViewMode
 * @param {Object} props - Component props
 * @param {Object} props.assetDetails - Asset details data (primary data source)
 * @param {Object} props.selectedRowData - Selected row data (fallback for assetDetails)
 * @param {Object} props.styles - Custom styles to override defaults
 * @returns {JSX.Element} - Rendered asset details section
 */
const AssetDetailsSection = ({ assetDetails, selectedRowData, isClosed, styles = {} }) => {
  const rawData = assetDetails || selectedRowData || {};
  let parsedAsset = null;

  try {
    const arr = JSON.parse(rawData.AssetJson);
    if (Array.isArray(arr) && arr.length > 0) parsedAsset = arr[0];
  } catch (err) {
    console.warn('Error parsing AssetJson:', err);
    parsedAsset = null;
  }

  // Provide fallback empty object if parsedAsset is null to prevent null reference errors
  const safeRowData = parsedAsset || {};

  return createGenericSection({
    title: 'Asset Details',
    fields: [
      {
        key: 'EquipmentId',
        title: 'Equipment Id',
      },
      { key: 'AssetName', title: 'Asset Name' },

      {
        key: 'AssetCategory',
        title: 'Category',
      },

      {
        key: 'Section',
        title: 'Section',
      },
      {
        key: 'Location',
        title: 'Location',
      },

      {
        key: 'Status',
        title: 'Status',
      },
    ],
    rowData: safeRowData,
    columnCount: isClosed ? 4 : 2,
    styles: {
      header: {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        backgroundColor: 'rgb(105, 65, 198)',
        color: '#fff',
        ...styles.header,
      },
      label: { fontSize: '11px', color: '#475467', margin: '0 0 4px 0', ...styles.label },
      value: { fontSize: '11px', fontWeight: 600, margin: 0, ...styles.value },
      ...styles,
    },
  });
};

export default AssetDetailsSection;
