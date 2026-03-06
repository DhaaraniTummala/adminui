/**
 * Visitor Tracking (Table 10826) Customizations
 */
import React, { useState, useEffect, useCallback } from 'react';
import ViewRegistry from '../../core/ViewRegistry';
import VisitorTrackingDetailView from '../../components/VisitorTracking/VisitorTrackingDetailView';
import VisitorTrackingForm from '../../components/VisitorTracking/VisitorTrackingForm';
import { enhanceTrackingFormConfig, beforeTrackingSave } from '../../utils/trackingHelpers';

const TABLE_NAME = '10826';

// Component for viewing visitor details
const VisitorDetailViewer = () => {
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

    window.addEventListener('showVisitorViewer', handleShowViewer);
    return () => {
      window.removeEventListener('showVisitorViewer', handleShowViewer);
    };
  }, [showViewer]);

  const handleRefresh = useCallback(() => {
    // Dispatch custom event to refresh the grid
    window.dispatchEvent(new CustomEvent('refreshVisitorGrid'));
  }, []);

  return (
    <VisitorTrackingDetailView
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
    node.data.Id || node.data.id || node.data.VisitorTrackingId || node.data.Guid || node.data.guid;

  if (recordId) {
    // Dispatch custom event to show the viewer
    window.dispatchEvent(
      new CustomEvent('showVisitorViewer', {
        detail: { recordId },
      }),
    );
  } else {
    console.log('❌ VisitorTracking: No record ID found in data:', node.data);
  }
};

const visitorTrackingCustomizations = {
  tableName: TABLE_NAME,
  entityName: 'VisitorTracking',
  displayName: 'Visitor Tracking',

  onRowDoubleClicked: handleRowDoubleClick,

  enhanceFormConfig: enhanceTrackingFormConfig,

  beforeSave: beforeTrackingSave,

  // Use TrackingSimpleForm with built-in two-column layout
  customFormComponent: VisitorTrackingForm,

  // Customize grid columns to rename Image column header and pin Status to right
  customizeGridColumns: (columns) => {
    const imageColumn = columns.find((col) => col.dataIndex === 'ImageUrl');
    if (imageColumn) {
      imageColumn.header = 'Image';
      imageColumn.title = 'Image';
      imageColumn.imageWidth = '48px'; // Square dimensions for circular profile pic
      imageColumn.imageHeight = '48px'; // Square dimensions for circular profile pic
    }

    // Find and pin Status column to the right (same approach as Asset.jsx)
    // The Status column's dataIndex is 'InStatus'
    const statusIndex = columns.findIndex((col) => col.dataIndex === 'InStatus');

    if (statusIndex !== -1) {
      const statusColumn = columns.splice(statusIndex, 1)[0];
      statusColumn.pinned = 'right';
      statusColumn.lockPinned = true;
      statusColumn.width = statusColumn.width || 150;
      // Use trackingStatusCellRenderer for CHECK IN/CHECK OUT colors (same pattern as Work Order)
      statusColumn.cellRenderer = 'trackingStatusCellRenderer';
      columns.push(statusColumn);
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

        window.addEventListener('refreshVisitorGrid', handleRefresh);
        return () => {
          window.removeEventListener('refreshVisitorGrid', handleRefresh);
        };
      }, []);

      return <VisitorDetailViewer />;
    };

    return <RefreshListener />;
  },
};

// Register with ViewRegistry
ViewRegistry.registerEntityCustomizations(TABLE_NAME, visitorTrackingCustomizations);

export default visitorTrackingCustomizations;
