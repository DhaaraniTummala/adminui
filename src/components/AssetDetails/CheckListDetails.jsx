import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Button as MuiButton,
  CircularProgress,
} from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { message, Table, Modal, Button } from 'antd';
import API from '../../store/requests';
import secureStorage from '../../utils/secureStorage';
import SuccessModal from '../../components/common/SuccessModal';
import AssetDetailsDisplay from './AssetDetailsDisplay';

const CheckListDetails = ({ recordId: checkListId }) => {
  const navigate = useNavigate();
  const [selectedRow, setSelectedRow] = useState(null);
  const [assetData, setAssetData] = useState(null);
  const [assetId, setAssetId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [checkListItems, setCheckListItems] = useState([]);
  const [showItemModal, setShowItemModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [itemForm, setItemForm] = useState({
    itemName: '',
    parameters: '',
  });
  const [fieldErrors, setFieldErrors] = useState({
    itemName: '',
    parameters: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showItemSuccessModal, setShowItemSuccessModal] = useState(false);
  const [itemSuccessMessage, setItemSuccessMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteItemIndex, setDeleteItemIndex] = useState(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);

  const checkListConfigId = '10821'; // CheckList table ID

  // Get user permissions and location data
  const isAdmin = secureStorage.getItem('isAdmin') === 'true';
  const sectionTypeId = secureStorage.getItem('sectionTypeId') || '';
  const locationTypeId = secureStorage.getItem('locationTypeId') || '';

  // Helper function to create payload based on user role
  const createPayload = (id) => {
    if (isAdmin) {
      return {
        Guid: id,
        action: 'LoadView',
      };
    } else {
      return {
        action: 'LoadView',
        Mapper: {
          sectionTypeId: sectionTypeId,
          locationTypeId: locationTypeId,
          checkListId: id,
        },
      };
    }
  };

  // Load CheckList data
  const loadCheckListData = () => {
    if (checkListId) {
      setLoading(true);

      const payload = createPayload(checkListId);

      API.triggerPost(checkListConfigId, payload)
        .then((response) => {
          if (response?.data) {
            setSelectedRow(response.data);

            // Extract AssetId from response
            if (response.data.AssetId) {
              setAssetId(response.data.AssetId);
              console.log('AssetId extracted:', response.data.AssetId);
            }

            // Parse AssetJson if available
            if (response.data.AssetJson) {
              try {
                const assetData = JSON.parse(response.data.AssetJson);
                if (Array.isArray(assetData) && assetData.length > 0) {
                  setAssetData(assetData[0]);
                }
              } catch (error) {
                console.error('Error parsing AssetJson:', error);
              }
            }

            // Parse CheckListItemJson if available (note: singular, not plural)
            if (response.data.CheckListItemJson) {
              try {
                let items = [];
                if (typeof response.data.CheckListItemJson === 'string') {
                  items = JSON.parse(response.data.CheckListItemJson);
                } else if (Array.isArray(response.data.CheckListItemJson)) {
                  items = response.data.CheckListItemJson;
                }
                console.log('CheckList Items loaded from API:', items);
                setCheckListItems(items);
              } catch (error) {
                console.error('Error parsing CheckListItemJson:', error);
                setCheckListItems([]);
              }
            } else {
              console.log('No CheckListItemJson found in response');
              setCheckListItems([]);
            }
          }
        })
        .catch((error) => {
          console.error('Error loading CheckList:', error);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCheckListData();
  }, [checkListId]);

  // Save to cache whenever items change
  useEffect(() => {
    if (checkListId && checkListItems.length > 0) {
      const cacheKey = `checkList_${checkListId}_items`;
      const cacheData = {
        gridData: checkListItems,
        lastUpdated: new Date().toISOString(),
      };
      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
      console.log('CheckList items saved to cache:', cacheKey, checkListItems);
    }
  }, [checkListItems, checkListId]);

  // Load from cache on mount (if available)
  useEffect(() => {
    if (checkListId) {
      const cacheKey = `checkList_${checkListId}_items`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsedCache = JSON.parse(cached);
          if (parsedCache.gridData && parsedCache.gridData.length > 0) {
            console.log('Loading CheckList items from cache:', parsedCache.gridData);
            setCheckListItems(parsedCache.gridData);
          }
        } catch (e) {
          console.error('Error loading cache:', e);
        }
      }
    }
  }, [checkListId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleAddItem = () => {
    setEditingItem(null);
    setItemForm({ itemName: '', parameters: '' });
    setShowItemModal(true);
  };

  const handleEditItem = (item, index) => {
    setEditingItem(index);
    setItemForm({
      itemName: item.ItemName || '',
      parameters: item.RequiredParameter || '',
    });
    setShowItemModal(true);
  };

  const handleDeleteItem = (index) => {
    // Show confirmation modal instead of deleting immediately
    setDeleteItemIndex(index);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteItem = () => {
    if (deleteItemIndex !== null) {
      const updatedItems = checkListItems.filter((_, i) => i !== deleteItemIndex);
      setCheckListItems(updatedItems);
      setShowDeleteConfirm(false);
      setDeleteItemIndex(null);
      // Show success modal instead of toast
      setShowDeleteSuccess(true);
    }
  };

  const handleModalClose = () => {
    setShowItemModal(false);
    setEditingItem(null);
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
    if (editingItem !== null) {
      // Edit existing item
      updatedItems = checkListItems.map((item, index) => (index === editingItem ? newItem : item));
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

  const saveCheckListItems = async (items) => {
    setSubmitting(true);
    try {
      const payload = {
        action: 'JsonRequest',
        RequestType: 'CheckList_Add',
        InputJson: JSON.stringify({
          CheckList: [
            {
              AssetId: assetId,
              CheckListId: checkListId,
              CheckListName: selectedRow?.CheckListName || '',
              CheckListItemJson: items, // Changed from CheckListItemsJson to CheckListItemJson (singular)
            },
          ],
        }),
      };

      const response = await API.triggerPost('Plant', payload);

      // Check if response is successful (response exists and no error)
      if (response && !response.error) {
        const apiMessage =
          response?.data?.data?.Result?.[0]?.SucessMessage || 'Check list saved successfully';
        setSuccessMessage(apiMessage);

        // Clear cache after successful save
        const cacheKey = `checkList_${checkListId}_items`;
        localStorage.removeItem(cacheKey);
        console.log('Cache cleared after successful save:', cacheKey);

        // Show success modal
        setShowSuccessModal(true);
      } else {
        message.error('Failed to save items');
      }
    } catch (error) {
      console.error('Error saving CheckList items:', error);
      message.error('Failed to save items');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box p={3}>
        <MuiButton startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 2 }}>
          Back
        </MuiButton>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
        >
          <CircularProgress size={40} sx={{ mb: 2, color: 'rgba(105, 65, 198, 1)' }} />
          <Typography variant="body1" color="text.secondary">
            Loading check list details...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!selectedRow) {
    return (
      <Box p={3}>
        <MuiButton startIcon={<ArrowBack />} onClick={handleBack} sx={{ mb: 2 }}>
          Back
        </MuiButton>
        <Typography>No data found for this Check List.</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', p: 2 }}>
      {/* Header with Back button and Title */}
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <MuiButton
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{
              color: '#6366f1',
              '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.04)' },
              minWidth: 'auto',
              p: 1,
            }}
          ></MuiButton>
          <Box>
            <Typography
              variant="h5"
              component="h1"
              sx={{
                fontWeight: 600,
                color: '#111827',
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              <span style={{ color: '#18181A', fontWeight: 600 }}>
                Check List
                {selectedRow?.CheckListLabelId && (
                  <span style={{ color: '#6B7280', fontWeight: 550, marginLeft: '8px' }}>
                    {String(selectedRow.CheckListLabelId).padStart(4, '0')}{' '}
                    {selectedRow.CheckListName}
                  </span>
                )}
              </span>
            </Typography>
          </Box>
        </Box>
      </Box>

      <Card
        elevation={0}
        sx={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}
      >
        <CardContent sx={{ p: 4 }}>
          {/* Asset Details Section */}
          {assetData && (
            <Box sx={{ mb: 4 }}>
              <AssetDetailsDisplay
                assetDetails={{ AssetJson: JSON.stringify([assetData]) }}
                variant="detailed"
                columns={4}
              />
            </Box>
          )}

          {/* Check List Items Table */}
          <Box sx={{ mb: 4 }}>
            <div className="border border-[#EAEAEA] rounded-[3px]">
              <div
                className="px-4 py-2 border-b border-[#EAEAEA] font-semibold text-[#101828] text-[13px] flex justify-between items-center"
                style={{
                  background: 'rgb(105, 65, 198)',
                  color: '#fff',
                  borderRadius: '5px 5px 0 0',
                }}
              >
                <span>Check List Items</span>
                {isAdmin && (
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
                )}
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
                        title: 'Required Parameters',
                        dataIndex: 'RequiredParameter',
                        key: 'RequiredParameter',
                        width: 300,
                      },
                      ...(isAdmin
                        ? [
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
                                                                    onClick={() => handleDeleteItem(index)}
                                                                    sx={{
                                                                        color: '#DC2626',
                                                                        textTransform: 'none',
                                                                        fontSize: '12px',
                                                                        padding: 0,
                                                                        minWidth: 'auto',
                                                                    }}
                                                                >
                                                                    Delete
                                                                </Button> */}
                                </div>
                              ),
                            },
                          ]
                        : []),
                    ]}
                    pagination={false}
                    bordered
                    size="small"
                    scroll={{ x: 'max-content' }}
                    locale={{ emptyText: 'No items found' }}
                  />
                </div>
              </div>
            </div>
          </Box>

          {/* Submit Button */}
          {isAdmin && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                mt: 3,
                pt: 3,
                borderTop: '1px solid #e5e7eb',
              }}
            >
              <MuiButton
                onClick={() => saveCheckListItems(checkListItems)}
                disabled={submitting}
                variant="contained"
                sx={{
                  backgroundColor: '#6941C6',
                  '&:hover': { backgroundColor: '#5331b8' },
                  textTransform: 'none',
                  fontWeight: 600,
                  fontSize: '14px',
                  height: '32px',
                  minWidth: '120px',
                }}
              >
                {submitting ? 'Submitting...' : 'Submit'}
              </MuiButton>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Item Modal */}
      <Modal
        title={editingItem !== null ? 'Edit Check List Item' : 'Add Check List Item'}
        open={showItemModal}
        onCancel={handleModalClose}
        footer={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              {editingItem !== null && (
                <Button
                  key="delete"
                  danger
                  onClick={() => {
                    handleDeleteItem(editingItem);
                    handleModalClose();
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
                disabled={submitting}
                style={{ backgroundColor: '#6941C6' }}
              >
                {submitting ? 'Saving...' : editingItem !== null ? 'Update' : 'Add Item'}
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
                // Clear error when user types
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
                style={{
                  color: '#EF4444',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'block',
                }}
              >
                {fieldErrors.itemName}
              </span>
            )}
          </div>
          <div>
            <label
              style={{ fontSize: '12px', fontWeight: 500, marginBottom: '8px', display: 'block' }}
            >
              Required Parameters <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              placeholder="Enter Required Parameters"
              value={itemForm.parameters}
              onChange={(e) => {
                setItemForm({ ...itemForm, parameters: e.target.value });
                // Clear error when user types
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
                style={{
                  color: '#EF4444',
                  fontSize: '12px',
                  marginTop: '4px',
                  display: 'block',
                }}
              >
                {fieldErrors.parameters}
              </span>
            )}
          </div>
        </div>
      </Modal>

      {/* Success Modal for Submit */}
      <SuccessModal
        open={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          // Reload data after closing success modal
          loadCheckListData();
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

      {/* Delete Confirmation Modal */}
      <SuccessModal
        open={showDeleteConfirm}
        onClose={() => {
          setShowDeleteConfirm(false);
          setDeleteItemIndex(null);
        }}
        title="Are you sure you want to delete this item?"
        iconType="warning"
        showCancelButton={true}
        onConfirm={confirmDeleteItem}
        confirmButtonText="Yes, Delete"
      />

      {/* Delete Success Modal */}
      <SuccessModal
        open={showDeleteSuccess}
        onClose={() => {
          setShowDeleteSuccess(false);
        }}
        title="Item removed. Click Submit to save changes."
        iconType="success"
      />
    </Box>
  );
};

export default CheckListDetails;
