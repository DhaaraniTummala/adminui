/**
 * Vehicle Tracking (Table 10825) Customizations
 */
import React, { useState, useEffect, useCallback } from 'react';
import ViewRegistry from '../../core/ViewRegistry';
import VehicleTrackingDetailView from '../../components/VehicleTracking/VehicleTrackingDetailView';
import VehicleTrackingForm from '../../components/VehicleTracking/VehicleTrackingForm';
import { enhanceTrackingFormConfig, beforeTrackingSave } from '../../utils/trackingHelpers';

const TABLE_NAME = '10825';

// Component for viewing vehicle details
const VehicleDetailViewer = () => {
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [selectedRecordId, setSelectedRecordId] = useState(null);

  const closeViewer = useCallback(() => {
    setIsViewerVisible(false);
    setSelectedRecordId(null);
  }, []);

  const showViewer = useCallback((recordId) => {
    setSelectedRecordId(recordId);
    setIsViewerVisible(true);
  }, []);

  useEffect(() => {
    const handleShowViewer = (e) => {
      if (e.detail?.recordId) {
        showViewer(e.detail.recordId);
      }
    };

    window.addEventListener('showVehicleViewer', handleShowViewer);
    return () => {
      window.removeEventListener('showVehicleViewer', handleShowViewer);
    };
  }, [showViewer]);

  const handleRefresh = useCallback(() => {
    // Dispatch custom event to refresh the grid
    window.dispatchEvent(new CustomEvent('refreshVehicleGrid'));
  }, []);

  return (
    <VehicleTrackingDetailView
      visible={isViewerVisible}
      recordId={selectedRecordId}
      onClose={closeViewer}
      onRefresh={handleRefresh}
    />
  );
};

// Handle row double-click
const handleRowDoubleClick = (node) => {
  if (!node?.data) {
    return;
  }

  // Try different possible ID field names
  const recordId =
    node.data.Id || node.data.id || node.data.VehicleTrackingId || node.data.Guid || node.data.guid;

  if (recordId) {
    // Dispatch custom event to show the viewer
    window.dispatchEvent(
      new CustomEvent('showVehicleViewer', {
        detail: { recordId },
      }),
    );
  } else {
    console.log('❌ VehicleTracking: No record ID found in data:', node.data);
  }
};

const vehicleTrackingCustomizations = {
  tableName: TABLE_NAME,
  entityName: 'VehicleTracking',
  displayName: 'Vehicle Tracking',

  onRowDoubleClicked: handleRowDoubleClick,

  enhanceFormConfig: enhanceTrackingFormConfig,

  beforeSave: beforeTrackingSave,

  // Use TrackingSimpleForm with built-in two-column layout
  customFormComponent: VehicleTrackingForm,

  // Customize grid columns to rename Image column header and pin Status to right
  customizeGridColumns: (columns) => {
    console.log(
      '🔍 VehicleTracking - All column dataIndex values:',
      columns.map((c) => c.dataIndex),
    );

    const imageColumn = columns.find((col) => col.dataIndex === 'ImageUrl');
    if (imageColumn) {
      imageColumn.header = 'Vehicle Image';
      imageColumn.title = 'Vehicle Image';
      imageColumn.imageWidth = '72px'; // Custom width for vehicle images
      imageColumn.imageHeight = '48px'; // Custom height for vehicle images
    }

    // Find and pin Status column to the right (same approach as Asset.jsx)
    // The Status column's dataIndex is 'InStatus'
    const statusIndex = columns.findIndex((col) => col.dataIndex === 'InStatus');

    if (statusIndex !== -1) {
      const statusColumn = columns.splice(statusIndex, 1)[0];
      console.log(
        '🔍 VehicleTracking - Status column BEFORE modification:',
        JSON.stringify(statusColumn, null, 2),
      );

      statusColumn.pinned = 'right';
      statusColumn.lockPinned = true;
      statusColumn.width = statusColumn.width || 150;
      // Use trackingStatusCellRenderer for CHECK IN/CHECK OUT colors (same pattern as Work Order)
      statusColumn.cellRenderer = 'trackingStatusCellRenderer';

      console.log(
        '🔍 VehicleTracking - Status column AFTER modification:',
        JSON.stringify(statusColumn, null, 2),
      );
      columns.push(statusColumn);
    } else {
      console.log(
        '❌ VehicleTracking - Status column not found! Available columns:',
        columns.map((c) => ({ dataIndex: c.dataIndex, title: c.title })),
      );
    }

    return columns;
  },

  renderCustomUI: (context) => {
    const RefreshListener = () => {
      useEffect(() => {
        const handleRefresh = () => {
          if (context?.refreshData) {
            context.refreshData();
          }
        };

        window.addEventListener('refreshVehicleGrid', handleRefresh);
        return () => {
          window.removeEventListener('refreshVehicleGrid', handleRefresh);
        };
      }, []);

      return <VehicleDetailViewer />;
    };

    return <RefreshListener />;
  },
};

// Register with ViewRegistry
ViewRegistry.registerEntityCustomizations(TABLE_NAME, vehicleTrackingCustomizations);

export default vehicleTrackingCustomizations;
