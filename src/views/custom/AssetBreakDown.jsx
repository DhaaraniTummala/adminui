import React, { useCallback, useState, useEffect } from 'react';
import ViewRegistry from '../../core/ViewRegistry';
import BreakDownViewMode from '../../components/BreakDownViewMode';
import AssetComplaintModal from './AssetComplaintModal';
import API from '../../store/requests';
import ComplaintViewMode from '@/components/ComplaintViewMode';
import secureStorage from '../../utils/secureStorage';

const TABLE_NAME = '10745';
const ENTITY_NAME = 'AssetBreakDown';
const DISPLAY_NAME = 'Breakdowns';

// Component for viewing breakdown details
const BreakDownViewer = ({ onSuccess }) => {
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isClosing, setIsClosing] = useState(false);

  const showViewer = useCallback((rowData) => {
    setSelectedRow(rowData);
    setIsViewerVisible(true);
    setIsClosing(false);
  }, []);

  const closeViewer = useCallback(() => {
    if (isClosing) return;

    setIsClosing(true);
    setIsViewerVisible(false);

    // Reset after animation completes
    const timer = setTimeout(() => {
      setSelectedRow(null);
      setIsClosing(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [isClosing]);

  useEffect(() => {
    const handleShowViewer = (e) => {
      if (!e.detail?.rowData) return;

      if (isViewerVisible || isClosing) {
        closeViewer();
        setTimeout(() => showViewer(e.detail.rowData), 350);
      } else {
        showViewer(e.detail.rowData);
      }
    };

    window.addEventListener('showBreakDownViewer', handleShowViewer);
    return () => {
      window.removeEventListener('showBreakDownViewer', handleShowViewer);
    };
  }, [isViewerVisible, isClosing, showViewer, closeViewer]);

  return (
    <BreakDownViewMode
      showRowDetail={isViewerVisible}
      onClose={closeViewer}
      selectedRowData={selectedRow}
      onSuccess={() => {
        closeViewer();
        if (onSuccess) onSuccess();
      }}
    />
  );
};

const ComplaintViewer = ({ onSuccess }) => {
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);

  const showViewer = useCallback((rowData) => {
    setSelectedRow(rowData);
    setIsViewerVisible(true);
  }, []);

  const closeViewer = useCallback(() => {
    setIsViewerVisible(false);
    setSelectedRow(null);
  }, []);

  useEffect(() => {
    const handleShowComplaint = (e) => {
      if (!e.detail?.rowData) return;

      if (isViewerVisible) {
        closeViewer();
        setTimeout(() => showViewer(e.detail.rowData), 100);
      } else {
        showViewer(e.detail.rowData);
      }
    };

    window.addEventListener('showComplaintViewer', handleShowComplaint);
    return () => {
      window.removeEventListener('showComplaintViewer', handleShowComplaint);
    };
  }, [isViewerVisible, showViewer, closeViewer]);

  if (!selectedRow) return null;

  return (
    <ComplaintViewMode
      showRowDetail={isViewerVisible}
      onClose={closeViewer}
      selectedRowData={selectedRow}
      assetDetails={selectedRow}
      onSuccess={() => {
        closeViewer();
        if (onSuccess) onSuccess();
      }}
    />
  );
};

// Create the customizations
const createAssetBreakDownCustomizations = () => {
  // Get user info from secureStorage
  const isAdmin = secureStorage.getItem('isAdmin') === 'true';
  const sectionTypeId = secureStorage.getItem('sectionTypeId');
  const locationTypeId = secureStorage.getItem('locationTypeId');

  // Set default filters for non-admin users
  const defaultFilterInfo = [];
  if (!isAdmin && sectionTypeId !== 'null' && locationTypeId !== 'null') {
    defaultFilterInfo.push(
      {
        filterTerm: sectionTypeId,
        filterBy: 'SectionTypeId',
        filterType: 'MULTI',
      },
      {
        filterTerm: locationTypeId,
        filterBy: 'LocationTypeId',
        filterType: 'MULTI',
      },
    );
  }
  const handleRowDoubleClick = async (node) => {
    if (!node?.data) return;

    try {
      const compliantId = node.data.AssetCompliantId;
      const isClosed = node.data?.IsClosed;

      let fullData = node.data;
      if (compliantId) {
        const response = await API.triggerPost('10744', {
          Guid: compliantId,
          action: 'LoadView',
        });
        fullData = response?.data
          ? Array.isArray(response.data)
            ? response.data[0]
            : response.data
          : node.data;
      }

      if (isClosed === true) {
        window.dispatchEvent(
          new CustomEvent('showComplaintViewer', {
            detail: { rowData: fullData },
          }),
        );
      } else {
        window.dispatchEvent(
          new CustomEvent('showBreakDownViewer', {
            detail: { rowData: fullData },
          }),
        );
      }
    } catch (error) {
      console.error('Error loading breakdown details:', error);
    }
  };

  return {
    tableName: TABLE_NAME,
    entityName: ENTITY_NAME,
    displayName: DISPLAY_NAME,
    title: 'Breakdowns',
    // subTitle: 'Effortlessly Manage And Track Asset Breakdowns',
    defaultFilterInfo: defaultFilterInfo,
    hideNewButton: true,
    toolbarConfig: {
      includeAdd: false,
    },
    onRowDoubleClicked: handleRowDoubleClick,

    customizeGridColumns(columns) {
      if (!Array.isArray(columns)) return columns;

      let updatedColumns = [...columns];

      // For non-admin users, hide SectionTypeId and LocationTypeId columns
      /*if (!isAdmin) {
        const columnsToHide = ['SectionTypeId', 'LocationTypeId'];
        updatedColumns = updatedColumns.filter(column => !columnsToHide.includes(column.dataIndex));
      }*/

      // Add Cost column formatter with commas
      updatedColumns = updatedColumns.map((column) => {
        if (column.dataIndex === 'Cost') {
          return {
            ...column,
            type: 'number',
            renderer: 'C2',
          };
        }
        return column;
      });

      // Pinned Status column to the right
      const statusColumns = updatedColumns.filter((col) => col.dataIndex === 'CompliantStatus');

      statusColumns.forEach((statusColumn) => {
        const statusIndex = updatedColumns.findIndex((col) => col === statusColumn);
        if (statusIndex !== -1) {
          const column = updatedColumns.splice(statusIndex, 1)[0];
          column.pinned = 'right';
          column.lockPinned = true;
          column.width = column.width || 100;
          updatedColumns.push(column);
        }
      });

      // Remove Action column
      return updatedColumns.filter((col) => col.dataIndex !== 'Action');
    },

    renderCustomUI: (state, setState, config) => {
      const handleSuccess = () => {
        if (typeof state?.refreshData === 'function') {
          state.refreshData();
        }
      };

      return (
        <>
          <BreakDownViewer onSuccess={handleSuccess} />
          <ComplaintViewer onSuccess={handleSuccess} />
        </>
      );
    },
  };
};

// Create and export the customizations
const assetBreakDownCustomizations = createAssetBreakDownCustomizations();
ViewRegistry.registerEntityCustomizations(TABLE_NAME, assetBreakDownCustomizations);

export default assetBreakDownCustomizations;
