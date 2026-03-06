import React, { useState, useEffect, useCallback } from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import ViewRegistry from '../../core/ViewRegistry';
import secureStorage from '../../utils/secureStorage';
import CheckListModal from './CheckListModal';
import UIHelper from '../../components/BaseView/UIHelper';

// Get the entity mapping to add fields to the details array
const entityMapping = JSON.parse(secureStorage.getItem('entityMapping') || '{}');

// Try to find the CheckList configuration by searching through all entities
let checkListConfig = null;
let checkListTableId = null;

// First try by key name
const possibleNames = ['CheckList', 'checklist', 'Check List', 'CHECKLIST', 'Check_List'];
for (const name of possibleNames) {
  if (entityMapping[name]) {
    checkListConfig = entityMapping[name];
    checkListTableId = name;

    break;
  }
}

// If not found by key, search by title/entity name
if (!checkListConfig) {
  console.log('Not found by key, searching by title/entity name...');
  for (const [tableId, config] of Object.entries(entityMapping)) {
    if (
      config.title &&
      config.title.toLowerCase().includes('check') &&
      config.title.toLowerCase().includes('list')
    ) {
      checkListConfig = config;
      checkListTableId = tableId;

      break;
    }
    if (config.entity && config.entity.toLowerCase().includes('checklist')) {
      checkListConfig = config;
      checkListTableId = tableId;

      break;
    }
  }
}

if (checkListConfig && checkListConfig.details) {
  // First, remove any existing duplicates of our custom fields
  const fieldsToCheck = ['ItemName', 'RequiredActions', 'Parameters'];
  fieldsToCheck.forEach((fieldName) => {
    const indices = [];
    checkListConfig.details.forEach((item, index) => {
      if (item.dataIndex === fieldName) {
        indices.push(index);
      }
    });

    // If duplicates found, remove all instances
    if (indices.length > 1) {
      // Remove in reverse order to maintain correct indices
      for (let i = indices.length - 1; i >= 0; i--) {
        checkListConfig.details.splice(indices[i], 1);
      }
    } else if (indices.length === 1) {
      // Remove the single instance so we can add it fresh
      checkListConfig.details.splice(indices[0], 1);
    }
  });

  // Update the entityMapping in sessionStorage after removing the fields
  secureStorage.setItem('entityMapping', JSON.stringify(entityMapping));
} else {
  console.warn(' CheckList configuration not found');
}

// Modal component wrapper
const CheckListModalWrapper = ({ onSuccess }) => {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const showModal = useCallback(() => setIsModalVisible(true), []);
  const closeModal = useCallback(() => setIsModalVisible(false), []);

  useEffect(() => {
    const handleShowModal = () => showModal();
    window.addEventListener('showCheckListModal', handleShowModal);
    return () => window.removeEventListener('showCheckListModal', handleShowModal);
  }, [showModal]);

  return (
    <CheckListModal
      visible={isModalVisible}
      onClose={closeModal}
      onSuccess={() => {
        closeModal();
        if (onSuccess) onSuccess();
      }}
    />
  );
};

// Get user permissions and location data
const isAdmin = secureStorage.getItem('isAdmin') === 'true';
const sectionTypeId = secureStorage.getItem('sectionTypeId') || '00000000-0000-0000-0000-000000000000';
const locationTypeId = secureStorage.getItem('locationTypeId') || '00000000-0000-0000-0000-000000000000';

// Create customizations object with custom save handler and toolbar
const checkListCustomizations = {
  // Add default filter info for non-admin users
  defaultFilterInfo: (!isAdmin && sectionTypeId != 'null' && locationTypeId != 'null') ? [
    {
      filterTerm: sectionTypeId,
      filterBy: 'SectionTypeId',
      filterType: 'MULTI'
    },
    {
      filterTerm: locationTypeId,
      filterBy: 'LocationTypeId',
      filterType: 'MULTI'
    }
  ] : [],

  // Hide SectionTypeId and LocationTypeId columns for non-admin users
  //hiddenColumns: !isAdmin ? ['SectionTypeId', 'LocationTypeId'] : [],
  // Override the save behavior to only send AssetId
  beforeSave: function (request) {
    console.log('CheckList beforeSave - Original request:', request);

    // Remove ItemName, RequiredActions, and Parameters from the request object
    delete request.ItemName;
    delete request.RequiredActions;
    delete request.Parameters;

    console.log('CheckList beforeSave - Filtered request (only AssetId):', request);
  },

  // Override the default Add button click behavior
  onCreateRow: () => {
    window.dispatchEvent(new CustomEvent('showCheckListModal'));
  },

  onRowDoubleClicked: (node) => {
    if (node?.data) {
      const currentPath = window.location.hash.split('?')[0];
      const checkListId = node.data.CheckListId;

      if (checkListId) {
        window.location.hash = `${currentPath}?mode=viewDetail&Id=${checkListId}`;
      }
    }
  },

  // Render custom UI components (modal)
  renderCustomUI: (state) => {
    const handleSuccess = () => {
      if (typeof state?.refreshData === 'function') {
        state.refreshData();
      }
    };

    return <CheckListModalWrapper onSuccess={handleSuccess} />;
  },

  // Hide the Edit button in details view
  hideEditButton: true,

  // Render child grid directly in the details page
  renderCustomContent: (_, formProps) => {
    return (
      <>
        {formProps?.selectedRow?.CheckListId && (
          <div style={{ marginTop: '40px' }}>
            <div
              style={{
                borderRadius: '6px',
                marginBottom: '20px',
                backgroundColor: '#fafafa',
              }}
            >
              {/* <div style={{ padding: '0px' }}>
                {UIHelper.createChildGrid('10822', 'CheckList', formProps?.selectedRow, {
                  hidePaging: true,
                  pagination: false,
                  hideToolbar: false,
                  showActions: true,
                  onSuccess: () => {
                    // Reload check list data after child grid update
                    if (formProps?.onReload) {
                      formProps.onReload();
                    }
                  },
                })}
              </div> */}
            </div>
          </div>
        )}
      </>
    );
  },
};

// Register with the found table ID and possible variations
const possibleTableIds = ['10821', 'CheckList', 'checklist', 'Check List', 'CHECKLIST', 'Check_List'];

// If we found the actual table ID, add it to the list
if (checkListTableId && !possibleTableIds.includes(checkListTableId)) {
  possibleTableIds.push(checkListTableId);
  console.log(`Added discovered table ID to registration list: ${checkListTableId}`);
}

console.log('=== CheckList.jsx: Registering customizations ===');
possibleTableIds.forEach((tableId) => {
  ViewRegistry.registerEntityCustomizations(tableId, checkListCustomizations);
  console.log(`✓ Registered Check List customizations for table: ${tableId}`);
});
console.log('=== CheckList.jsx: Registration complete ===');
console.log('CheckList customizations object:', checkListCustomizations);

export default checkListCustomizations;
