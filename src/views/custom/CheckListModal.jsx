import React, { useState, useEffect, useCallback } from 'react';
import { Button, message, Modal, Table } from 'antd';
import API from '../../store/requests';
import SuccessModal from '../../components/common/SuccessModal';
import CustomDrawer from '../../components/common/CustomDrawer';
import AssetSearchAndDetails from '../../components/AssetDetails/AssetSearchAndDetails';

export default function CheckListModal({
  visible,
  onClose,
  tableName = '10738', // CheckList table
  title = 'Check List',
  onSuccess,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [checkListItems, setCheckListItems] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [itemForm, setItemForm] = useState({ itemName: '', parameters: '' });
  const [fieldErrors, setFieldErrors] = useState({
    itemName: '',
    parameters: '',
  });
  const [assetError, setAssetError] = useState('');
  const [checkListName, setCheckListName] = useState('');
  const [checkListNameError, setCheckListNameError] = useState('');
  const [assetId, setAssetId] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showItemSuccessModal, setShowItemSuccessModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [itemSuccessMessage, setItemSuccessMessage] = useState('');
  const [warningMessage, setWarningMessage] = useState('');
  const [submittingItem, setSubmittingItem] = useState(false);

  // Debounced API call for asset search
  const fetchAssetsBySearch = useCallback(async (searchString) => {
    try {
      setIsLoading(true);
      const payload = {
        RequestType: 'AssetSearch',
        InputJson: JSON.stringify({ AssetSearch: [{ SearchString: searchString }] }),
        action: 'JsonRequest',
      };
      const response = await API.triggerPost('Plant', payload);
      const assets = (response?.data?.data || []).map((item) => ({
        AssetId: item.AssetId,
        AssetInfo: item.AssetInfo,
      }));
      setSuggestions(assets);
    } catch (error) {
      console.error('fetchAssetsBySearch error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Debounce timer ref
  const debounceTimerRef = React.useRef(null);

  // Cleanup debounce timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // Load items from cache on mount
  useEffect(() => {
    const cacheKey = 'checkList_temp_10822';
    const cached = localStorage.getItem(cacheKey);
    if (cached) {
      try {
        const parsedCache = JSON.parse(cached);
        setCheckListItems(parsedCache.gridData || []);
      } catch (e) {
        console.error('Error loading cache:', e);
        setCheckListItems([]);
      }
    }
  }, []);

  // Save to cache whenever items change
  useEffect(() => {
    const cacheKey = 'checkList_temp_10822';
    const cacheData = {
      gridData: checkListItems,
      lastUpdated: new Date().toISOString(),
    };
    localStorage.setItem(cacheKey, JSON.stringify(cacheData));
  }, [checkListItems]);

  // Listen for clear event
  useEffect(() => {
    const handleClearCache = () => {
      setCheckListItems([]);
      localStorage.removeItem('checkList_temp_10822');
    };
    window.addEventListener('clearCheckListCache', handleClearCache);
    return () => {
      window.removeEventListener('clearCheckListCache', handleClearCache);
    };
  }, []);

  // Reset all form fields and clear cache
  const resetForm = useCallback(() => {
    setSearchQuery('');
    setSuggestions([]);
    setSelectedAsset(null);
    setSubmitting(false);
    setIsLoading(false);
    setCheckListItems([]);
    setCheckListName('');
    setCheckListNameError('');
    localStorage.removeItem('checkList_temp_10822');
  }, []);

  // Handle drawer close
  const handleDrawerClose = useCallback(() => {
    resetForm();
    onClose();
  }, [resetForm, onClose]);

  // Handle modal visibility changes
  useEffect(() => {
    if (visible) {
      resetForm();
    }
  }, [visible, resetForm]);

  const handleSearchChange = useCallback(
    (e) => {
      const query = e.target.value;
      setSearchQuery(query);

      // Clear previous timer
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      // If query is empty, clear suggestions
      if (query.trim().length === 0) {
        setSuggestions([]);
        return;
      }

      // Set new timer for debounced API call
      debounceTimerRef.current = setTimeout(() => {
        fetchAssetsBySearch(query);
      }, 500); // 500ms debounce delay
    },
    [fetchAssetsBySearch],
  );

  const handleAssetSelect = useCallback(async (asset) => {
    setSearchQuery(asset.AssetInfo || '');
    setAssetId(asset.AssetId);
    setSuggestions([]);
    setAssetError(''); // Clear error when asset is selected
    try {
      setIsLoading(true);
      const payload = { Guid: asset.AssetId };
      const response = await API.triggerPost('10738', { ...payload, action: 'LoadView' });
      if (response?.data) {
        setSelectedAsset(Array.isArray(response.data) ? response.data[0] : response.data);
      }
    } catch (error) {
      message.error('Failed to load asset details');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleAddItem = () => {
    setEditingItemIndex(null);
    setItemForm({ itemName: '', parameters: '' });
    setShowItemModal(true);
  };

  const handleEditItem = (item, index) => {
    setEditingItemIndex(index);
    setItemForm({
      itemName: item.ItemName || '',
      parameters: item.RequiredParameter || '',
    });
    setShowItemModal(true);
  };

  const handleDeleteItem = (index) => {
    const updatedItems = checkListItems.filter((_, i) => i !== index);
    setCheckListItems(updatedItems);
    message.success('Item removed');
  };

  const handleModalClose = () => {
    setShowItemModal(false);
    setEditingItemIndex(null);
    setItemForm({ itemName: '', parameters: '' });
    setFieldErrors({ itemName: '', parameters: '' });
  };

  const handleSubmitItem = () => {
    // Reset errors
    const errors = {
      itemName: '',
      parameters: '',
    };

    let hasError = false;

    // Validate Item Name
    if (!itemForm.itemName.trim()) {
      errors.itemName = 'Item Name is required';
      hasError = true;
    }

    // Validate Parameters
    if (!itemForm.parameters.trim()) {
      errors.parameters = 'Parameters is required';
      hasError = true;
    }

    setFieldErrors(errors);

    if (hasError) {
      return; // Don't proceed if there are errors
    }

    const newItem = {
      ItemName: itemForm.itemName,
      RequiredParameter: itemForm.parameters,
    };

    let updatedItems;
    if (editingItemIndex !== null) {
      // Edit existing item
      updatedItems = checkListItems.map((item, index) =>
        index === editingItemIndex ? newItem : item,
      );
      setItemSuccessMessage('Item updated successfully!');
    } else {
      // Add new item
      updatedItems = [...checkListItems, newItem];
      setItemSuccessMessage('Item added successfully!');
    }

    setCheckListItems(updatedItems);
    handleModalClose();

    // Show success modal
    setShowItemSuccessModal(true);
  };

  const saveCheckList = async () => {
    // Validate asset selection
    if (!selectedAsset) {
      setAssetError('Please select an asset');
      return;
    }

    // Validate CheckListName
    if (!checkListName.trim()) {
      setCheckListNameError('Check List Name is required');
      return;
    }

    // Check if items exist
    if (checkListItems.length === 0) {
      setWarningMessage('Please add at least one check list item');
      setShowWarningModal(true);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        action: 'JsonRequest',
        RequestType: 'CheckList_Add',
        InputJson: JSON.stringify({
          CheckList: [
            {
              AssetId: selectedAsset.AssetId,
              CheckListName: checkListName,
              CheckListItemJson: checkListItems,
            },
          ],
        }),
      };

      const response = await API.triggerPost('Plant', payload);

      if (response && !response.error) {
        // Extract success message from API response
        const apiMessage =
          response?.data?.data?.Result?.[0]?.SucessMessage || 'Check list saved successfully';
        setSuccessMessage(apiMessage);

        // Clear cache after successful save
        localStorage.removeItem('checkList_temp_10822');
        setShowSuccessModal(true);
      } else {
        message.error(response?.data?.info || 'Failed to save check list');
      }
    } catch (error) {
      console.error('Error saving check list:', error);
      message.error('Error while saving check list');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible) return null;

  return (
    <>
      <SuccessModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          resetForm();
          if (onSuccess) onSuccess();
        }}
        title={successMessage}
        iconType="success"
      />

      {/* Success Modal for Add/Edit Item */}
      <SuccessModal
        open={showItemSuccessModal}
        onClose={() => {
          setShowItemSuccessModal(false);
        }}
        title={itemSuccessMessage}
        iconType="success"
      />

      {/* Warning Modal for No Items */}
      <SuccessModal
        open={showWarningModal}
        onClose={() => {
          setShowWarningModal(false);
        }}
        title={warningMessage}
        iconType="warning"
      />
      <style>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
            max-height: 0;
          }
          to {
            opacity: 1;
            transform: translateY(0);
            max-height: 200px;
          }
        }
        
        /* Simple section styling */
        .checklist-section-header {
          font-weight: 600;
          font-size: 13px;
          color: rgba(0, 0, 0, 0.85);
          margin-bottom: 16px;
          padding-bottom: 8px;
          border-bottom: 1px solid #f0f0f0;
        }
        
        .checklist-table {
          width: 100%;
          border-collapse: collapse;
        }
        .checklist-table th {
          text-align: left;
          padding: 12px;
          font-size: 12px;
          font-weight: 500;
          color: #595959;
          background-color: #fafafa;
          border-bottom: 1px solid #f0f0f0;
        }
        .checklist-table td {
          padding: 12px;
          vertical-align: middle;
          border-bottom: 1px solid #f0f0f0;
        }
        .checklist-input {
          width: 100%;
          border: 1px solid #d9d9d9;
          borderRadius: '2px',
          padding: '6px 11px',
          fontSize: '13px',
          outline: 'none',
        }
        .checklist-input:focus {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
        }
        .checklist-textarea {
          width: 100%;
          border: 1px solid #d9d9d9;
          resize: 'vertical',
          minHeight: '60px',
        }
        .checklist-textarea:focus {
          border-color: #1890ff;
          box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
        }
      `}</style>
      <CustomDrawer
        title="Add Check List"
        open={visible}
        onClose={handleDrawerClose}
        width="80%"
        destroyOnClose
        bodyStyle={{
          padding: '0',
          backgroundColor: '#fff',
          display: 'flex',
          flexDirection: 'column',
          height: 'calc(100% - 40px)',
          overflow: 'hidden',
          margin: '20px 0',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px' }}>
            {/* Asset Details Section */}
            <div className="border border-[#EAEAEA] rounded-[3px] mb-6">
              <h3
                className="px-4 py-2 border-b border-[#EAEAEA] font-semibold text-[#101828] text-[13px]"
                style={{
                  background: 'rgb(105, 65, 198)',
                  color: '#fff',
                  borderRadius: '5px 5px 0 0',
                }}
              >
                Asset Details
              </h3>

              {/* Asset Search and Details Component */}
              <div className="p-4">
                <AssetSearchAndDetails
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  suggestions={suggestions}
                  selectedAsset={selectedAsset}
                  setSelectedAsset={setSelectedAsset}
                  onSearchChange={handleSearchChange}
                  onAssetSelect={handleAssetSelect}
                  placeholder="Search assets..."
                />

                {/* Asset Error Message */}
                {assetError && (
                  <span
                    style={{
                      color: '#EF4444',
                      fontSize: '12px',
                      marginTop: '4px',
                      display: 'block',
                    }}
                  >
                    {assetError}
                  </span>
                )}
              </div>
            </div>

            {/* Check List Name Section */}
            <div className="border border-[#EAEAEA] rounded-[3px] mb-6">
              <h3
                className="px-4 py-2 border-b border-[#EAEAEA] font-semibold text-[#101828] text-[13px]"
                style={{
                  background: 'rgb(105, 65, 198)',
                  color: '#fff',
                  borderRadius: '5px 5px 0 0',
                }}
              >
                Check List Name
              </h3>

              <div className="p-4">
                <input
                  type="text"
                  placeholder="Enter Check List Name"
                  value={checkListName}
                  onChange={(e) => {
                    setCheckListName(e.target.value);
                    if (checkListNameError) {
                      setCheckListNameError('');
                    }
                  }}
                  style={{
                    width: '100%',
                    height: '40px',
                    border: checkListNameError ? '1px solid #EF4444' : '1px solid #d1d5db',
                    borderRadius: '6px',
                    padding: '0 12px',
                    fontSize: '14px',
                  }}
                />
                {checkListNameError && (
                  <span
                    style={{
                      color: '#EF4444',
                      fontSize: '12px',
                      marginTop: '4px',
                      display: 'block',
                    }}
                  >
                    {checkListNameError}
                  </span>
                )}
              </div>
            </div>

            {/* Check List Items Section */}
            <div className="border border-[#EAEAEA] rounded-[3px] mb-6">
              <div
                className="px-4 py-2 border-b border-[#EAEAEA] font-semibold text-[#101828] text-[13px] flex justify-between items-center"
                style={{
                  background: 'rgb(105, 65, 198)',
                  color: '#fff',
                  borderRadius: '5px 5px 0 0',
                }}
              >
                <span>Check List Items</span>
                <Button
                  onClick={handleAddItem}
                  type="primary"
                  size="small"
                  style={{
                    backgroundColor: '#fff',
                    color: '#6941C6',
                    borderColor: '#fff',
                    fontWeight: 600,
                    fontSize: '12px',
                  }}
                >
                  + Add Item
                </Button>
              </div>

              <div className="">
                <div style={{ overflowX: 'auto' }}>
                  <Table
                    dataSource={checkListItems.map((item, index) => ({
                      ...item,
                      key: index,
                      sno: index + 1,
                    }))}
                    columns={[
                      { title: 'S.no', dataIndex: 'sno', key: 'sno', width: 80 },
                      { title: 'Item Name', dataIndex: 'ItemName', key: 'ItemName', width: 300 },
                      {
                        title: 'Required Parameter',
                        dataIndex: 'RequiredParameter',
                        key: 'RequiredParameter',
                        width: 300,
                      },
                      {
                        title: 'Action',
                        key: 'action',
                        width: 50,
                        fixed: 'right',
                        render: (_, record, index) => (
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <img
                              onClick={() => handleEditItem(record, index)}
                              src="edit-icon-dark.svg"
                              alt=""
                              style={{ width: '20px', height: '20px' }}
                              className="cursor-pointer"
                            />

                            {/* <Button
                              type="link"
                              danger
                              onClick={() => handleDeleteItem(index)}
                              style={{ padding: 0 }}
                            >
                              Delete
                            </Button> */}
                          </div>
                        ),
                      },
                    ]}
                    pagination={false}
                    bordered
                    size="small"
                    scroll={{ x: 'max-content' }}
                    locale={{ emptyText: 'No items added yet. Click "+ Add Item" to add items.' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Footer with Submit Button */}
          <div
            className="flex justify-end items-center p-4 border-t border-[#EAEAEA] bg-white"
            style={{
              flexShrink: 0,
              position: 'sticky',
              bottom: 0,
              backgroundColor: '#fff',
              zIndex: 1,
              width: '100%',
            }}
          >
            <Button
              onClick={saveCheckList}
              disabled={submitting}
              className="px-4 py-1.5  text-white rounded-[3px]  shadow-sm"
              style={{
                height: '32px',
                minWidth: '120px',
                textTransform: 'none',
                fontWeight: '600',
                padding: '10px 32px',
                backgroundColor: '#6941C6',
                color: '#fff',
              }}
            >
              {submitting ? 'Submitting...' : 'Submit'}
            </Button>
          </div>
        </div>
      </CustomDrawer>

      {/* Add/Edit Item Modal */}
      <Modal
        title={editingItemIndex !== null ? 'Edit Check List ' : 'Add Check List'}
        open={showItemModal}
        onCancel={handleModalClose}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {editingItemIndex !== null && (
                <Button
                  key="delete"
                  danger
                  onClick={() => {
                    Modal.confirm({
                      title: 'Delete Item',
                      content: 'Are you sure you want to delete this item?',
                      okText: 'Delete',
                      okType: 'danger',
                      cancelText: 'Cancel',
                      onOk: () => {
                        handleDeleteItem(editingItemIndex);
                        handleModalClose();
                      },
                    });
                  }}
                >
                  Delete
                </Button>
              )}
            </div>
            <div>
              <Button
                key="submit"
                type="primary"
                onClick={handleSubmitItem}
                disabled={submittingItem}
                style={{ backgroundColor: '#6941C6' }}
              >
                {submittingItem ? 'Saving...' : editingItemIndex !== null ? 'Update' : 'Add Item'}
              </Button>
            </div>
          </div>
        }
        width={600}
        centered
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
          <div>
            <label
              style={{ fontSize: '12px', fontWeight: 500, marginBottom: '8px', display: 'block' }}
            >
              Item Name <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Item Name"
              value={itemForm.itemName}
              onChange={(e) => {
                setItemForm({ ...itemForm, itemName: e.target.value });
                if (fieldErrors.itemName) {
                  setFieldErrors({ ...fieldErrors, itemName: '' });
                }
              }}
              style={{
                width: '100%',
                height: '40px',
                border: fieldErrors.itemName ? '1px solid #EF4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '0 12px',
                fontSize: '14px',
              }}
            />
            {fieldErrors.itemName && (
              <span
                style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}
              >
                {fieldErrors.itemName}
              </span>
            )}
          </div>
          <div>
            <label
              style={{ fontSize: '12px', fontWeight: 500, marginBottom: '8px', display: 'block' }}
            >
              Required Parameter <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Required Parameter"
              value={itemForm.parameters}
              onChange={(e) => {
                setItemForm({ ...itemForm, parameters: e.target.value });
                if (fieldErrors.parameters) {
                  setFieldErrors({ ...fieldErrors, parameters: '' });
                }
              }}
              style={{
                width: '100%',
                height: '40px',
                border: fieldErrors.parameters ? '1px solid #EF4444' : '1px solid #d1d5db',
                borderRadius: '6px',
                padding: '0 12px',
                fontSize: '14px',
              }}
            />
            {fieldErrors.parameters && (
              <span
                style={{ color: '#EF4444', fontSize: '12px', marginTop: '4px', display: 'block' }}
              >
                {fieldErrors.parameters}
              </span>
            )}
          </div>
        </div>
      </Modal>
    </>
  );
}
