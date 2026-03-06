import React, { useCallback, useState, useEffect } from 'react';
import ViewRegistry from '../../core/ViewRegistry';
import AddUserModel from './AddUserModel';
import { add } from 'lodash';

const TABLE_NAME = '10689';
const ENTITY_NAME = 'User';
const DISPLAY_NAME = 'Users';

const NewUserModal = ({ onSuccess }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = useCallback(() => setIsModalVisible(true), []);
  const closeModal = useCallback(() => setIsModalVisible(false), []);

  useEffect(() => {
    const handleShowModal = () => showModal();
    window.addEventListener('showNewUserModal', handleShowModal);
    return () => window.removeEventListener('showNewUserModal', handleShowModal);
  }, [showModal]);

  return (
    <AddUserModel
      visible={isModalVisible}
      toggle={closeModal}
      onSuccess={() => {
        closeModal();
        if (onSuccess) onSuccess();
      }}
      activeRecordId="NEW_RECORD"
      initialData={null}
    />
  );
};

// Component for viewing/adding/editing users
const UserManagementViewer = ({ onSuccess, mode = 'add', selectedRow }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [activeRow, setActiveRow] = useState(selectedRow || null);

  const showModal = useCallback((rowData = null, modeType = 'add') => {
    setActiveRow(rowData);
    setIsModalVisible(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalVisible(false);
    setActiveRow(null);
  }, []);

  return (
    <AddUserModel
      visible={isModalVisible}
      toggle={closeModal}
      onSuccess={onSuccess}
      activeRecordId={activeRow?.UserId || 'NEW_RECORD'}
      initialData={activeRow}
    />
  );
};

// Create the customizations
const createUserManagementCustomizations = () => {
  const handleCreateClick = () => {
    window.dispatchEvent(new Event('showNewUserModal'));
  };
  return {
    tableName: TABLE_NAME,
    entityName: ENTITY_NAME,
    displayName: DISPLAY_NAME,
    title: 'Users',
    subTitle: '',
    onCreateRow: handleCreateClick,
    renderCustomUI: (state, setState, config) => {
      const handleSuccess = () => {
        if (typeof state?.refreshData === 'function') {
          state.refreshData();
        }
      };

      return (
        <>
          <UserManagementViewer onSuccess={handleSuccess} />
          <NewUserModal onSuccess={handleSuccess} />
        </>
      );
    },
    customizeGridColumns(columns) {
      if (!Array.isArray(columns)) return columns;
      const updatedColumns = [...columns];
      // Remove Action column and audit columns (CreatedBy, CreatedDate, ModifiedBy, ModifiedDate)
      return updatedColumns.filter(
        (col) =>
          col.dataIndex !== 'Action'
        // col.dataIndex !== 'CreatedBy' &&
        // col.dataIndex !== 'CreatedDate' &&
        // col.dataIndex !== 'ModifiedBy' &&
        // col.dataIndex !== 'ModifiedDate'
      );
    },
  };
};

// Create and export the customizations
const userManagementCustomizations = createUserManagementCustomizations();
ViewRegistry.registerEntityCustomizations(TABLE_NAME, userManagementCustomizations);

export default userManagementCustomizations;
