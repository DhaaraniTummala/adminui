import React, { useCallback, useState, useEffect } from 'react';
import ViewRegistry from '../../core/ViewRegistry';
import ComplaintViewMode from '../../components/ComplaintViewMode';
import AssetComplaintModal from './AssetComplaintModal';
import API from '../../store/requests';
import secureStorage from '../../utils/secureStorage';

const style = document.createElement('style');
style.innerHTML = `
/* Remove vertical grid lines (column separators) */
.ag-theme-alpine .ag-cell,
.ag-theme-alpine .ag-header-cell {
  border-right: none !important;
}

/* Remove border line for left pinned area */
.ag-pinned-left-header,
.ag-pinned-left-cols-container {
  border-right: none !important;
}
`;
document.head.appendChild(style);

// Constants
const TABLE_NAME = '10744';
const ENTITY_NAME = 'AssetCompliant';
const DISPLAY_NAME = 'Complaints';

// Component for creating new complaints
const NewComplaintModal = ({ onSuccess }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = useCallback(() => setIsModalVisible(true), []);
  const closeModal = useCallback(() => setIsModalVisible(false), []);

  useEffect(() => {
    const handleShowModal = () => {
      console.log('showNewComplaintModal event received');
      showModal();
    };
    window.addEventListener('showNewComplaintModal', handleShowModal);
    return () => window.removeEventListener('showNewComplaintModal', handleShowModal);
  }, [showModal]);

  return (
    <AssetComplaintModal
      visible={isModalVisible}
      onClose={closeModal}
      onSuccess={() => {
        closeModal();
        if (onSuccess) onSuccess();
      }}
    />
  );
};

// Component for viewing complaint details
const ComplaintViewer = ({ onSuccess }) => {
  const [isViewerVisible, setIsViewerVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [isClosing, setIsClosing] = useState(false);
  const [selectedAssetDetails, setSelectedAssetDetails] = useState(null);
  const closeModal = useCallback(() => setIsViewerVisible(false), []);
  const showViewer = useCallback((rowData, assetDetails) => {
    console.log('showViewer called with:', { rowData, assetDetails });
    setSelectedRow(rowData);
    setSelectedAssetDetails(assetDetails || null);
    setIsViewerVisible(true);
    setIsClosing(false);
  }, []);

  const closeViewer = useCallback(() => {
    console.log('closeViewer called, isClosing:', isClosing);
    if (isClosing) return;

    setIsClosing(true);
    setIsViewerVisible(false);

    const timer = setTimeout(() => {
      console.log('Timer fired, clearing state');
      setSelectedRow(null);
      setSelectedAssetDetails(null);
      setIsClosing(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [isClosing]);

  useEffect(() => {
    const handleShowViewer = (e) => {
      console.log('showComplaintViewer event received:', e);
      if (!e.detail?.rowData) {
        console.log('No rowData in event detail, returning');
        return;
      }

      if (!isViewerVisible) {
        console.log('Showing viewer with data:', e.detail);
        showViewer(e.detail.rowData, e.detail.assetDetails);
      } else {
        console.log('Viewer already visible, closing and reopening');
        closeViewer();
        setTimeout(() => showViewer(e.detail.rowData, e.detail.assetDetails), 350);
      }
    };

    window.addEventListener('showComplaintViewer', handleShowViewer);
    return () => {
      window.removeEventListener('showComplaintViewer', handleShowViewer);
    };
  }, [isViewerVisible, showViewer, closeViewer]);

  return (
    <ComplaintViewMode
      showRowDetail={isViewerVisible}
      onClose={closeModal}
      selectedRowData={selectedRow}
      assetDetails={selectedAssetDetails}
      onSuccess={() => {
        closeModal();
        if (onSuccess) onSuccess();
      }}
    />
  );
};

// Create the customizations
const createAssetCompliantCustomizations = () => {
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
  const handleCreateClick = () => {
    console.log('handleCreateClick called - dispatching showNewComplaintModal event');
    window.dispatchEvent(new Event('showNewComplaintModal'));
  };

  const handleRowDoubleClick = async (node) => {
    console.log('handleRowDoubleClick called with node:', node);
    if (!node?.data) {
      console.log('No node data found, returning');
      return;
    }

    let assetDetails = null;
    try {
      const complaintGuid = node.data.AssetCompliantId || node.data.ComplaintId || null;
      console.log('Fetching asset details for complaint GUID:', complaintGuid);
      if (complaintGuid) {
        const response = await API.triggerPost('10744', {
          Guid: complaintGuid,
          action: 'LoadView',
        });
        assetDetails = Array.isArray(response?.data) ? response.data[0] : response?.data || null;
        console.log('Asset details fetched:', assetDetails);
      }
    } catch (err) {
      console.error('Error fetching asset details:', err);
      assetDetails = null;
    }

    console.log('Dispatching showComplaintViewer event with:', {
      rowData: node.data,
      assetDetails,
    });
    window.dispatchEvent(
      new CustomEvent('showComplaintViewer', {
        detail: { rowData: node.data, assetDetails },
      }),
    );
  };

  return {
    tableName: TABLE_NAME,
    entityName: ENTITY_NAME,
    displayName: DISPLAY_NAME,
    title: 'Complaints',
    // subTitle: 'Effortlessly Manage And Track Complaints related to Assets',
    defaultFilterInfo: defaultFilterInfo,
    onCreateRow: handleCreateClick,
    onRowDoubleClicked: handleRowDoubleClick,

    customizeGridColumns(columns) {
      if (!Array.isArray(columns)) return columns;

      let updatedColumns = [...columns];

      // For non-admin users, hide SectionTypeId and LocationTypeId columns
      /*if (!isAdmin) {
        const columnsToHide = ['SectionTypeId', 'LocationTypeId'];
        updatedColumns = updatedColumns.filter(column => !columnsToHide.includes(column.dataIndex));
      }*/

      // pinned Asset ID column to the left
      const assetIdIndex = updatedColumns.findIndex(
        (col) => col.dataIndex === 'AssetId' || col.dataIndex === 'EquipmentId',
      );

      if (assetIdIndex !== -1) {
        const assetIdColumn = updatedColumns.splice(assetIdIndex, 1)[0];
        assetIdColumn.pinned = 'left';
        assetIdColumn.lockPinned = true;
        assetIdColumn.width = assetIdColumn.width || 120;
        updatedColumns.unshift(assetIdColumn);
      }

      // pinned Complaint ID column to the left
      const complaintIdIndex = updatedColumns.findIndex(
        (col) => col.dataIndex === 'AssetCompliantId' || col.dataIndex === 'AssetCompliantLabelId',
      );

      if (complaintIdIndex !== -1) {
        const complaintIdColumn = updatedColumns.splice(complaintIdIndex, 1)[0];
        complaintIdColumn.pinned = 'left';
        complaintIdColumn.lockPinned = true;
        complaintIdColumn.width = complaintIdColumn.width || 120;
        updatedColumns.unshift(complaintIdColumn);
      }

      // Pinned Compliant Status column to the right
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

      // Remove Action column and ModifiedBy/ModifiedDate columns
      return updatedColumns.filter(
        (col) =>
          col.dataIndex !== 'Action' &&
          col.dataIndex !== 'ModifiedBy' &&
          col.dataIndex !== 'ModifiedDate',
      );
    },

    renderCustomUI: (state, setState, config) => {
      const handleSuccess = () => {
        if (typeof state?.refreshData === 'function') {
          state.refreshData();
        }
      };

      return (
        <>
          <ComplaintViewer onSuccess={handleSuccess} />
          <NewComplaintModal onSuccess={handleSuccess} />
        </>
      );
    },
  };
};

// Create and export the customizations
const assetCompliantCustomizations = createAssetCompliantCustomizations();
ViewRegistry.registerEntityCustomizations(TABLE_NAME, assetCompliantCustomizations);

export default assetCompliantCustomizations;
