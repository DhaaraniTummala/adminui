import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Divider,
  Tabs,
  Tab,
  Button,
  TextField,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  RadioGroup,
  FormControlLabel,
  FormLabel,
  Modal,
  CircularProgress,
} from '@mui/material';
import { Edit as EditIcon, RemoveCircleOutline, ArrowBack, Close } from '@mui/icons-material';
import { message } from 'antd';
import secureStorage from '../../utils/secureStorage';
import WithdrawalDrawer from './WithdrawalDrawer';
import UIHelper from '../BaseView/UIHelper';
import CheckListItemActions from './CheckListItemActions';
import CustomDrawer from '../common/CustomDrawer';
import API from '../../store/requests';
import { entityConfigs } from '../../configs/entityConfigs';
import GenericSection from '../common/GenericSection';
import { createGenericSection } from '../../utils/sectionUtils';
import SuccessModal from '../common/SuccessModal';
import { ASSET_STATUS_IDS } from '../../configs/assetConstants';
import StatusBadge from '../common/StatusBadge';
import Dates from '../../core/utils/date';

const AssetDetails = ({ recordId: assetId, tableId, entityName }) => {
  const navigate = useNavigate();
  const [tabIndex, setTabIndex] = useState(0);
  const [withdrawalModalOpen, setWithdrawalModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [currentAssetData, setCurrentAssetData] = useState(selectedRow);
  const [formRef, setFormRef] = useState(null);
  const [withdrawalData, setWithdrawalData] = useState({
    reason: '',
    method: '',
    condition: 'Poor',
    description: '',
  });

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataFound, setDataFound] = useState(false);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [withdrawalSuccessModalOpen, setWithdrawalSuccessModalOpen] = useState(false);

  // CheckList Items state
  const [checkListItems, setCheckListItems] = useState([]);
  const [showNewItemForm, setShowNewItemForm] = useState(false);
  const [newItem, setNewItem] = useState({ itemName: '', requiredActions: '', parameters: '' });
  const [addingItem, setAddingItem] = useState(false);
  const [assetData, setAssetData] = useState(null);
  const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [checklistEditDrawerOpen, setChecklistEditDrawerOpen] = useState(false);
  const [userLookupMap, setUserLookupMap] = useState({});

  // Asset configId for details form - use tableId prop if provided, otherwise default to asset config
  const assetConfig = entityConfigs.asset;
  const assetConfigId = tableId || assetConfig.configId;

  // Get user permissions and location data
  const isAdmin = secureStorage.getItem('isAdmin') === 'true';
  const sectionTypeId = secureStorage.getItem('sectionTypeId') || '';
  const locationTypeId = secureStorage.getItem('locationTypeId') || '';

  // Get user combo lookup from secureStorage (same as AG Grid uses)
  const getUserComboLookup = () => {
    try {
      const userTableId = secureStorage.getItem('userTable');
      const combosStr = secureStorage.getItem('combos');
      if (combosStr && userTableId) {
        const combos = JSON.parse(combosStr);
        return combos[userTableId] || [];
      }
    } catch (error) {
      console.error('Error getting user combo lookup:', error);
    }
    return [];
  };

  // Helper function to extract username using combo lookup (same as AG Grid)
  const getUserName = (item, fieldPrefix, userCombo = []) => {
    // Try different possible field name patterns first
    const patterns = [
      `${fieldPrefix}UserName`, // CreatedByUserName
      `${fieldPrefix}_UserName`, // CreatedBy_UserName
    ];

    for (const pattern of patterns) {
      if (item[pattern]) {
        return item[pattern];
      }
    }

    // Check if it's a nested object
    if (item[fieldPrefix] && typeof item[fieldPrefix] === 'object' && item[fieldPrefix].UserName) {
      return item[fieldPrefix].UserName;
    }

    // Use combo lookup to find DisplayValue (same as AG Grid ComboCellRenderer)
    const userId = item[fieldPrefix];
    if (userId && userCombo.length > 0) {
      const userEntry = userCombo.find((u) => u.LookupId === userId);
      if (userEntry && userEntry.DisplayValue) {
        return userEntry.DisplayValue;
      }
    }

    return userId || '-';
  };

  // Helper function to create payload based on user role and entity type
  const createPayload = (id, isCheckList = false) => {
    if (isAdmin) {
      // Admin payload
      return {
        Guid: id,
        action: 'LoadView',
      };
    } else {
      // Non-admin payload
      const payload = {
        action: 'LoadView',
        Mapper: {
          sectionTypeId: sectionTypeId,
          locationTypeId: locationTypeId,
        },
      };

      // Set the appropriate ID field based on entity type
      if (isCheckList) {
        payload.Mapper.checkListId = id;
      } else {
        payload.Mapper.assetId = id;
      }

      return payload;
    }
  };

  // Load API Call using assetId
  useEffect(() => {
    // For CheckList, load CheckList data first, then load asset details using AssetId
    if (entityName === 'CheckList') {
      if (assetId) {
        setLoading(true);

        const payload = createPayload(assetId, true); // true for CheckList

        API.triggerPost(assetConfigId, payload)
          .then((response) => {
            if (response?.data) {
              setSelectedRow(response.data);
              setCurrentAssetData(response.data);
              setDataFound(true);

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
            } else {
              alert('No Record Found');
              setDataFound(false);
            }
          })
          .catch((error) => {
            console.error('Error loading CheckList:', error);
            setDataFound(false);
          })
          .finally(() => {
            setLoading(false);
          });
      } else {
        setLoading(false);
        setDataFound(false);
        setSelectedRow(null);
      }
      return; // Exit early for CheckList
    }

    // For other entities (Asset, etc.), load asset data normally
    if (assetId) {
      // Reset states when starting new API call
      setLoading(true);
      setDataFound(false);
      setSelectedRow(null);

      // Create payload based on entity type and user role
      const isCheckList = entityName === 'CheckList';
      const payload = createPayload(assetId, isCheckList);

      API.triggerPost(assetConfigId, payload)
        .then((response) => {
          if (response?.data) {
            setSelectedRow(response.data);
            setCurrentAssetData(response.data);
            setDataFound(true);
          } else {
            alert('No Record Found');
            setDataFound(false);
          }
        })
        .catch((error) => {
          console.error('Error loading asset:', error);
          setDataFound(false);
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
      setDataFound(false);
      setSelectedRow(null);
    }
  }, [assetId, entityName, assetConfigId]);

  // Load Check List Items from database
  useEffect(() => {
    if (entityName === 'CheckList' && selectedRow?.CheckListId) {
      // First, try to get items from CheckListItemJson if available
      if (selectedRow.CheckListItemJson) {
        try {
          const parsedItems = JSON.parse(selectedRow.CheckListItemJson);
          if (Array.isArray(parsedItems)) {
            const items = parsedItems.map((item) => ({
              id: item.CheckListItemId || Date.now() + Math.random(),
              itemName: item.ItemName,
              requiredActions: item.RequiredActions,
              parameters: item.Parameters,
              createdDate: item.CreatedDate,
              createdBy: item.CreatedByUserName || '-',
              modifiedBy: item.ModifiedByUserName || '-',
              modifiedDate: item.ModifiedDate,
            }));
            console.log('Mapped items from CheckListItemJson:', items);
            setCheckListItems(items);
            return;
          }
        } catch (error) {
          console.error('Error parsing CheckListItemJson: ' + error);
        }
      }

      const payload = {
        action: 'list',
        PageNo: 0,
        PageSize: 100,
        ParentEntityField: 'CheckListId',
        ParentId: selectedRow.CheckListId,
      };

      API.triggerPost('10822', payload)
        .then((response) => {
          if (response?.data?.data && Array.isArray(response.data.data)) {
            console.log('Check List Items Response:', response.data.data);

            // Map items with usernames
            const items = response.data.data.map((item) => ({
              id: item.CheckListItemId || item.Id || Date.now() + Math.random(),
              itemName: item.ItemName,
              requiredActions: item.RequiredActions,
              parameters: item.Parameters,
              createdDate: item.CreatedDate,
              createdBy: item.CreatedByUserName || '-',
              modifiedBy: item.ModifiedByUserName || '-',
              modifiedDate: item.ModifiedDate,
            }));
            console.log('Mapped items from API:', items);
            setCheckListItems(items);
          }
        })
        .catch((error) => {
          console.error('Error loading Check List Items:', error);
        });
    }
  }, [entityName, selectedRow?.CheckListId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditDetails = () => {
    setEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  const handleToggle = (shouldRefresh) => {
    // Close modal
    setEditModalOpen(false);

    // Refresh data if needed (called from success modal dismiss)
    if (shouldRefresh) {
      // Show loading indicator
      setRefreshing(true);

      // Reload asset data from API
      const payload = { Guid: assetId, action: 'LoadView' };

      API.triggerPost(assetConfigId, payload)
        .then((response) => {
          if (response?.data) {
            setSelectedRow(response.data);
            setCurrentAssetData(response.data);
          }
        })
        .catch((error) => {
          console.error('Error reloading asset data:', error);
        })
        .finally(() => {
          // Hide loading indicator
          setRefreshing(false);
        });
    }
  };

  const handleWithdrawalAsset = async () => {
    setWithdrawalModalOpen(true);
  };

  const handleWithdrawalClose = () => {
    setWithdrawalModalOpen(false);
    setWithdrawalData({ reason: '', method: '', condition: 'Poor', description: '' });
  };

  const handleWithdrawalSubmit = async () => {
    try {
      // Prepare the payload for withdrawal
      const payload = {
        action: 'insert',
        AssetId: selectedRow?.AssetId,
        Reason: withdrawalData.reason,
        Method: withdrawalData.method,
        Condition: withdrawalData.condition,
        WithdrawalDescription: withdrawalData.description,
        apiIdentifier: 'AssetWithdrawal',
      };

      // Call the API to insert the withdrawal record
      const response = await API.triggerMultiPartPost('10746', payload, null, null);

      if (response?.data?.success) {
        // Close the withdrawal drawer
        handleWithdrawalClose();

        // Show success modal
        setSuccessModalOpen(true);

        // Reload asset data to show updated status
        await reloadAssetData();
      } else {
        message.error(response?.data?.info || 'Failed to record asset withdrawal');
      }
    } catch (error) {
      message.error('An error occurred while processing the withdrawal');
    }
  };

  const handleWithdrawalInputChange = (field, value) => {
    setWithdrawalData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Function to reload asset data
  const reloadAssetData = async () => {
    try {
      const payload = { Guid: assetId, action: 'LoadView' };
      const response = await API.triggerPost(assetConfigId, payload);

      if (response?.data) {
        setSelectedRow(response.data);
        setCurrentAssetData(response.data);
      }
    } catch (error) {
      message.error('Failed to reload asset data');
    }
  };

  // Function to reload Check List Items from database
  const reloadCheckListItems = async () => {
    if (entityName === 'CheckList' && selectedRow?.CheckListId) {
      if (selectedRow.CheckListItemJson) {
        try {
          const parsedItems = JSON.parse(selectedRow.CheckListItemJson);
          if (Array.isArray(parsedItems)) {
            const items = parsedItems.map((item) => ({
              id: item.CheckListItemId || Date.now() + Math.random(),
              itemName: item.ItemName,
              requiredActions: item.RequiredActions,
              parameters: item.Parameters,
              createdDate: item.CreatedDate,
              createdBy: item.CreatedByUserName || '-',
              modifiedBy: item.ModifiedByUserName || '-',
              modifiedDate: item.ModifiedDate,
            }));
            console.log('Reloaded items from CheckListItemJson:', items);
            setCheckListItems(items);
            return;
          }
        } catch (error) {
          console.error('Error parsing CheckListItemJson: ' + error);
        }
      }

      const payload = {
        action: 'list',
        PageNo: 0,
        PageSize: 100,
        ParentEntityField: 'CheckListId',
        ParentId: selectedRow.CheckListId,
      };

      try {
        const response = await API.triggerPost('10822', payload);
        if (response?.data?.data && Array.isArray(response.data.data)) {
          const items = response.data.data.map((item) => ({
            id: item.CheckListItemId || item.Id || Date.now() + Math.random(),
            itemName: item.ItemName,
            requiredActions: item.RequiredActions,
            parameters: item.Parameters,
            createdDate: item.CreatedDate,
            createdBy: item.CreatedByUserName || '-',
            modifiedBy: item.ModifiedByUserName || '-',
            modifiedDate: item.ModifiedDate,
          }));
          console.log('Reloaded items from API:', items);
          setCheckListItems(items);
        }
      } catch (error) {
        console.error('Error reloading Check List Items:', error);
      }
    }
  };

  // Handle adding new Check List item and call API immediately
  const handleAddNewItem = async () => {
    if (!newItem.itemName || !newItem.requiredActions) {
      message.error('Please fill in Item Name and Required Actions');
      return;
    }

    setAddingItem(true);
    try {
      const payload = {
        action: 'insert',
        CheckListId: selectedRow?.CheckListId,
        ItemName: newItem.itemName,
        RequiredActions: newItem.requiredActions,
        Parameters: newItem.parameters,
      };

      const response = await API.triggerMultiPartPost('10822', payload);

      if (response?.data?.success) {
        // Reload the Check List Items from the database
        await reloadCheckListItems();

        // Reset form and close modal
        setShowNewItemForm(false);
        setNewItem({ itemName: '', requiredActions: '', parameters: '' });
        message.success('Item added successfully');

        // Force grid to remount by toggling drawer state
        const currentDrawerState = checklistEditDrawerOpen;
        setChecklistEditDrawerOpen(false);
        setTimeout(() => {
          setChecklistEditDrawerOpen(currentDrawerState);
        }, 50);
      } else {
        message.error(response?.data?.Message || 'Failed to add item');
      }
    } catch (error) {
      message.error('Error while adding item');
    } finally {
      setAddingItem(false);
    }
  };

  // Show delete confirmation modal
  const handleDeleteCheckListItem = (itemId) => {
    setItemToDelete(itemId);
    setDeleteConfirmModalOpen(true);
  };

  // Handle actual deletion after confirmation
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      const payload = {
        action: 'delete',
        CheckListItemId: itemToDelete,
        identifier: '10822',
      };

      const response = await API.triggerPost('10822', payload);

      if (response?.data?.success) {
        // Remove the item from the checkListItems state
        const updatedItems = checkListItems.filter((item) => item.id !== itemToDelete);
        setCheckListItems(updatedItems);
        message.success('Item deleted successfully');
        setDeleteConfirmModalOpen(false);
        setItemToDelete(null);
      } else {
        message.error(response?.data?.Message || 'Failed to delete item');
      }
    } catch (error) {
      console.error('Error deleting Check List item:', error);
      message.error('Error while deleting item');
    }
  };

  // Show confirmation modal before approval
  const handleApprove = () => {
    setConfirmModalOpen(true);
  };

  // Handle actual approval after confirmation
  const handleConfirmApproval = async () => {
    try {
      const payload = {
        action: 'update',
        AssetId: selectedRow?.AssetId,
        AssetStatusTypeId: ASSET_STATUS_IDS.WITHDRAWN,
        apiIdentifier: 'Asset',
      };

      const response = await API.triggerMultiPartPost('10738', payload, null, null);

      if (response?.data?.success) {
        // Close confirmation modal
        setConfirmModalOpen(false);

        // Manually update the current data to show "Approved" status
        const updatedData = {
          ...selectedRow,
          AssetStatusTypeId: ASSET_STATUS_IDS.WITHDRAWN,
          AssetStatusType_Name: 'Withdrawn',
          Status: 'Approved',
        };
        setSelectedRow(updatedData);
        setCurrentAssetData(updatedData);

        // Close the drawer and reload asset data
        handleWithdrawalClose();
        await reloadAssetData();

        // Show withdrawal success modal
        setWithdrawalSuccessModalOpen(true);
      } else {
        message.error(response?.data?.info || 'Failed to approve withdrawal');
      }
    } catch (error) {
      message.error('An error occurred while approving the withdrawal');
    }
  };

  // Handle Reject withdrawal request
  const handleReject = async () => {
    try {
      const payload = {
        action: 'update',
        AssetId: selectedRow?.AssetId,
        AssetStatusTypeId: ASSET_STATUS_IDS.ACTIVE,
        apiIdentifier: 'Asset',
      };

      const response = await API.triggerMultiPartPost('10738', payload, null, null);

      if (response?.data?.success) {
        message.success('Withdrawal request rejected successfully!');

        // Close the drawer and reload asset data
        handleWithdrawalClose();
        await reloadAssetData();
      } else {
        message.error(response?.data?.info || 'Failed to reject withdrawal');
      }
    } catch (error) {
      message.error('An error occurred while rejecting the withdrawal');
    }
  };

  // Render asset details using createGenericSection
  const renderAssetDetails = (columnsPerRow = 4) => {
    return createGenericSection({
      title: 'Asset Details',
      fields: assetConfig.fields.filter((field) => {
        // Check if field has conditional logic
        if (field.conditional && selectedRow) {
          return field.conditional(selectedRow);
        }
        return true; // Show field if no conditional logic
      }),
      rowData: selectedRow,
      columnCount: columnsPerRow,
      styles: {
        label: {
          fontSize: '11px',
          color: '#475467',
          margin: '0 0 4px 0',
        },
        value: {
          fontSize: '11px',
          fontWeight: 600,
          margin: 0,
        },
      },
    });
  };

  if (loading) {
    return (
      <Box p={3}>
        {/* Header with back button */}
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton
            onClick={handleBack}
            sx={{
              mr: 2,
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            <ArrowBack />
          </IconButton>
        </Box>

        {/* Centered loading content */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
        >
          <CircularProgress size={40} sx={{ mb: 2, color: 'rgba(105, 65, 198, 1)' }} />
          <Typography variant="body1" color="text.secondary">
            Loading asset details...
          </Typography>
        </Box>
      </Box>
    );
  }

  if (!loading && !dataFound) {
    return (
      <Box p={3}>
        {/* Header with back button */}
        <Box display="flex" alignItems="center" mb={3}>
          <IconButton
            onClick={handleBack}
            sx={{
              mr: 2,
              color: '#1976d2',
              '&:hover': {
                backgroundColor: 'rgba(25, 118, 210, 0.04)',
              },
            }}
          >
            <ArrowBack />
          </IconButton>
        </Box>

        {/* Centered no data content */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
        >
          <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
            No Data Available
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No asset data found for this record.
          </Typography>
        </Box>
      </Box>
    );
  }

  // Tab panel helper
  function TabPanel(props) {
    const { children, value, index, ...other } = props;
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`asset-tabpanel-${index}`}
        aria-labelledby={`asset-tab-${index}`}
        {...other}
      >
        {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
      </div>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#fff', minHeight: '100vh', p: 2, position: 'relative' }}>
      {/* Loading Overlay */}
      {refreshing && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
            }}
          >
            <CircularProgress size={40} sx={{ color: 'rgba(105, 65, 198, 1)' }} />
            <Typography variant="body1" sx={{ color: '#374151', fontWeight: 500 }}>
              Updating asset details...
            </Typography>
          </Box>
        </Box>
      )}

      {/* Header with Back button, Title, and Action buttons */}
      <Box
        sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            startIcon={<ArrowBack />}
            onClick={handleBack}
            sx={{
              color: '#6366f1',
              '&:hover': { backgroundColor: 'rgba(99, 102, 241, 0.04)' },
              minWidth: 'auto',
              p: 1,
            }}
          ></Button>
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
                gap: 2,
              }}
            >
              {entityName === 'CheckList' ? (
                <>
                  Check List Items
                  {selectedRow?.CheckListLabelId && (
                    <span style={{ color: '#6B7280', fontWeight: 550, marginLeft: '-3px' }}>
                      {String(selectedRow.CheckListLabelId).padStart(4, '0')}
                    </span>
                  )}
                </>
              ) : (
                'View Assets Details'
              )}
              {entityName !== 'CheckList' && selectedRow?.EquipmentId && (
                <span style={{ color: '#6B7280', fontWeight: 600 }}>
                  {String(selectedRow.EquipmentId).padStart(4, '0')}
                </span>
              )}
              {entityName !== 'CheckList' && selectedRow?.AssetStatusTypeId && (
                <StatusBadge statusId={selectedRow.AssetStatusTypeId} size="default" />
              )}
            </Typography>
          </Box>
        </Box>
        {isAdmin && entityName === 'CheckList' && (
          <Button
            startIcon={<EditIcon />}
            onClick={() => {
              console.log('Edit button clicked, opening drawer');
              console.log('selectedRow:', selectedRow);
              console.log('assetData:', assetData);
              setChecklistEditDrawerOpen(true);
            }}
            variant="contained"
            sx={{
              backgroundColor: '#6941C6',
              color: 'white',
              '&:hover': {
                backgroundColor: '#5331b8',
              },
              '& .MuiButton-startIcon': {
                fontSize: '16px',
              },
              textTransform: 'none',
              fontSize: '12px',
              padding: '6px 12px',
              fontWeight: 600,
            }}
          >
            Edit
          </Button>
        )}

        {isAdmin && entityName !== 'CheckList' && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            {/* Show different buttons based on asset status */}
            {selectedRow?.AssetStatusTypeId === ASSET_STATUS_IDS.ACTIVE && (
              <Button
                onClick={handleWithdrawalAsset}
                variant="outlined"
                sx={{
                  borderColor: '#7F56D9',
                  color: '#7F56D9',
                  '&:hover': {
                    borderColor: '#7F56D9',
                  },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  padding: '10px 24px',
                  gap: '10px',
                }}
              >
                <img src="Withdrawal Asset.svg" alt="" style={{ width: '20px', height: '20px' }} />
                Withdrawal Asset
              </Button>
            )}

            {/* Show View Withdrawal Request button when status is Withdrawal Requested */}
            {selectedRow?.AssetStatusTypeId === ASSET_STATUS_IDS.WITHDRAWAL_REQUESTED && (
              <Button
                onClick={handleWithdrawalAsset}
                variant="outlined"
                sx={{
                  borderColor: 'rgba(53, 56, 205, 1)',
                  color: 'rgba(53, 56, 205, 1)',
                  backgroundColor: 'rgb(219, 222, 238)',
                  '&:hover': {
                    borderColor: 'rgba(53, 56, 205, 1)',
                    backgroundColor: 'rgba(240, 242, 255, 1)',
                  },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  padding: '10px 24px',
                  gap: '10px',
                }}
              >
                <img src="Withdrawal Asset.svg" alt="" style={{ width: '20px', height: '20px' }} />
                View Withdrawal Request
              </Button>
            )}

            {/* Show Edit Details button only when status is Active */}
            {selectedRow?.AssetStatusTypeId === ASSET_STATUS_IDS.ACTIVE && (
              <Button
                onClick={handleEditDetails}
                variant="contained"
                sx={{
                  backgroundColor: '#6941C6',
                  '&:hover': { backgroundColor: '#6941C6' },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  padding: '10px 24px',
                  gap: '10px',
                }}
              >
                <img src="edit-icon.svg" alt="" style={{ width: '20px', height: '20px' }} />
                Edit Details
              </Button>
            )}
          </Box>
        )}
      </Box>

      {entityName !== 'CheckList' && (
        <Card
          elevation={0}
          sx={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}
        >
          <CardContent sx={{ p: 4 }}>
            {/* Tabs for Asset Details, History and Documents - Hide for CheckList */}
            {entityName !== 'CheckList' && (
              <Box>
                <Tabs
                  value={tabIndex}
                  onChange={(_, v) => setTabIndex(v)}
                  sx={{
                    '& .MuiTab-root': {
                      textTransform: 'none',
                      fontWeight: 500,
                      color: '#6b7280',
                      '&.Mui-selected': {
                        color: '#6366f1',
                      },
                    },
                    '& .MuiTabs-indicator': {
                      backgroundColor: '#6366f1',
                    },
                  }}
                >
                  <Tab label="Asset Details" />
                  <Tab label="Asset History" />
                  <Tab label="Asset Documents" />
                </Tabs>
              </Box>
            )}

            {entityName !== 'CheckList' && (
              <>
                <TabPanel value={tabIndex} index={0}>
                  <Box sx={{ mb: 4 }}>
                    {/* Asset Image Section */}
                    <Box sx={{ mb: 4 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{
                          fontWeight: 600,
                          color: '#111827',
                          fontSize: '0.9375rem',
                          letterSpacing: '0.01em',
                          mb: 1.5,
                        }}
                      >
                        ASSET IMAGE
                      </Typography>
                      <Box
                        sx={{
                          position: 'relative',
                          width: '100%',
                          maxWidth: 300,
                          borderRadius: '12px',
                          overflow: 'hidden',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                        }}
                      >
                        <Box
                          component="img"
                          src={selectedRow?.ImageUrl || '/noProfilePic.png'}
                          alt="Asset"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'noProfilePic.png';
                          }}
                          sx={{
                            width: '100%',
                            height: 200,
                            objectFit: selectedRow?.ImageURL ? 'cover' : 'contain',
                            backgroundColor: selectedRow?.ImageURL ? 'transparent' : '#f8f9fa',
                            display: 'block',
                          }}
                        />
                        {/* Hide image edit button when status is Withdrawn or Withdrawal Requested or user is not admin */}
                        {isAdmin &&
                          selectedRow?.AssetStatusTypeId !== ASSET_STATUS_IDS.WITHDRAWN &&
                          selectedRow?.AssetStatusTypeId !==
                            ASSET_STATUS_IDS.WITHDRAWAL_REQUESTED && (
                            <IconButton
                              onClick={handleEditDetails}
                              sx={{
                                position: 'absolute',
                                bottom: 12,
                                right: 12,
                                backgroundColor: 'rgba(255, 255, 255, 0.9)',
                                '&:hover': {
                                  backgroundColor: 'rgba(255, 255, 255, 1)',
                                },
                                width: 36,
                                height: 36,
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                          )}
                      </Box>
                    </Box>

                    {/* Asset Details Section */}
                    {renderAssetDetails()}
                  </Box>
                </TabPanel>
                <TabPanel value={tabIndex} index={1}>
                  <Box
                    sx={{
                      height: '700px',
                      width: '100%',
                      overflow: 'auto',
                      overflowX: 'auto',
                    }}
                  >
                    {UIHelper.createReadOnlyChildGrid('10758', 'Asset', selectedRow)}
                  </Box>
                </TabPanel>
                <TabPanel value={tabIndex} index={2}>
                  {UIHelper.createAssetDocumentsGrid('10758', 'Asset', selectedRow, {
                    hideDelete:
                      !isAdmin ||
                      selectedRow?.AssetStatusTypeId === ASSET_STATUS_IDS.WITHDRAWAL_REQUESTED ||
                      selectedRow?.AssetStatusTypeId === ASSET_STATUS_IDS.WITHDRAWN,
                  })}
                </TabPanel>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Asset Details Section  */}
      {entityName === 'CheckList' && selectedRow?.CheckListId && assetData && (
        <Box sx={{ mt: 3 }}>
          <div
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                background: 'rgb(105, 65, 198)',

                padding: '13px 13px',
                borderBottom: '1px solid #ececec',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: '14px',
                  fontWeight: 600,
                  color: 'white',
                }}
              >
                Asset Details
              </p>
            </div>
            <div
              style={{
                padding: '16px',
                background: 'white',
                display: 'flex',
                flexDirection: 'row',
                gap: '24px',
              }}
            >
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>Equipment Id</span>
                <span style={{ fontSize: '11px', color: '#111827', fontWeight: 600 }}>
                  {assetData.EquipmentId || '-'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>Asset Name</span>
                <span style={{ fontSize: '11px', color: '#111827', fontWeight: 600 }}>
                  {assetData.AssetName || '-'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>Asset Category</span>
                <span style={{ fontSize: '11px', color: '#111827', fontWeight: 600 }}>
                  {assetData.AssetCategory || '-'}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
                <span style={{ fontSize: '11px', color: '#6B7280' }}>Asset Type</span>
                <span style={{ fontSize: '11px', color: '#111827', fontWeight: 600 }}>
                  {assetData.Asset || '-'}
                </span>
              </div>
            </div>
          </div>
        </Box>
      )}

      {/* Check List Items Grid  */}
      {entityName === 'CheckList' && selectedRow?.CheckListId && (
        <Box sx={{ mt: 3 }}>
          <style>
            {`
              .checklist-table-container {
                scrollbar-width: thin;
                scrollbar-color: #B3B3B3 #F7FAFC;
              }
              .checklist-table-container::-webkit-scrollbar {
                width: 12px;
                height: 12px;
              }
              .checklist-table-container::-webkit-scrollbar-track {
                background: #F7FAFC;
                border-radius: 6px;
              }
              .checklist-table-container::-webkit-scrollbar-thumb {
                background: #B3B3B3;
                border-radius: 6px;
                border: 2px solid #F7FAFC;
              }
              .checklist-table-container::-webkit-scrollbar-thumb:hover {
                background: #999999;
              }
              .checklist-table-container::-webkit-scrollbar-corner {
                background: #F7FAFC;
              }
            `}
          </style>
          {/* Table Container with horizontal scroll */}
          <div
            className="checklist-table-container"
            style={{
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              position: 'relative',
              overflow: 'scroll',
              overflowX: 'scroll',
              overflowY: 'scroll',
              maxHeight: '380px',
              height: '380px',
            }}
          >
            <table className="w-full text-[13px] text-[#444]" style={{ minWidth: '1400px' }}>
              <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
                <tr>
                  <th
                    className="py-4 px-4 text-left font-medium text-[#6B7280] text-[11px]"
                    style={{ fontWeight: 600 }}
                  >
                    Sr. No
                  </th>
                  <th
                    className="py-4 px-4 text-left font-medium text-[#6B7280] text-[11px]"
                    style={{ fontWeight: 600 }}
                  >
                    Item Name
                  </th>
                  <th
                    className="py-4 px-4 text-left font-medium text-[#6B7280] text-[11px]"
                    style={{ fontWeight: 600 }}
                  >
                    Required Actions
                  </th>
                  <th
                    className="py-4 px-4 text-left font-medium text-[#6B7280] text-[11px]"
                    style={{ fontWeight: 600 }}
                  >
                    Parameters
                  </th>
                  <th
                    className="py-4 px-4 text-left font-medium text-[#6B7280] text-[11px]"
                    style={{ fontWeight: 600 }}
                  >
                    Created Date
                  </th>
                  <th
                    className="py-4 px-4 text-left font-medium text-[#6B7280] text-[11px]"
                    style={{ fontWeight: 600 }}
                  >
                    CreatedBy
                  </th>
                  <th
                    className="py-4 px-4 text-left font-medium text-[#6B7280] text-[11px]"
                    style={{ fontWeight: 600 }}
                  >
                    ModifiedBy
                  </th>
                  <th
                    className="py-4 px-4 text-left font-medium text-[#6B7280] text-[11px]"
                    style={{ fontWeight: 600 }}
                  >
                    ModifiedDate
                  </th>
                </tr>
              </thead>
              <tbody>
                {checkListItems.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="py-16 px-4 text-center text-[#9CA3AF] text-[11px]"
                      style={{ verticalAlign: 'middle' }}
                    >
                      No Record
                    </td>
                  </tr>
                ) : (
                  checkListItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="border-b border-[#E5E7EB]"
                      style={{ backgroundColor: 'white' }}
                    >
                      <td className="py-2 px-4">{String(index + 1).padStart(2, '0')}</td>
                      <td className="py-2 px-4">{item.itemName}</td>
                      <td className="py-2 px-4">{item.requiredActions}</td>
                      <td className="py-2 px-4">{item.parameters}</td>
                      <td className="py-2 px-4">
                        {item.createdDate ? Dates.DateTimeWithLocalTimeZone(item.createdDate) : '-'}
                      </td>
                      <td className="py-2 px-4">{item.createdBy || '-'}</td>
                      <td className="py-2 px-4">{item.modifiedBy || '-'}</td>
                      <td className="py-2 px-4">
                        {item.modifiedDate
                          ? Dates.DateTimeWithLocalTimeZone(item.modifiedDate)
                          : '-'}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Box>
      )}

      {/* Withdrawal Drawer */}
      <WithdrawalDrawer
        open={withdrawalModalOpen}
        onClose={handleWithdrawalClose}
        onWithdrawalInputChange={handleWithdrawalInputChange}
        onWithdrawalSubmit={handleWithdrawalSubmit}
        selectedRow={selectedRow}
        renderAssetDetails={renderAssetDetails}
        withdrawalData={withdrawalData}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Edit Drawer */}
      <CustomDrawer
        open={editModalOpen}
        onClose={handleEditModalClose}
        title="Edit Asset Details"
        width="82%"
        containerStyle={{ padding: 0 }}
      >
        <div style={{ padding: '32px 30px' }}>
          {UIHelper.createForm(assetConfigId, 'Asset', currentAssetData, {
            mode: 'edit',
            toggle: handleToggle,
            documentUploader: true,
            activeRecordId: currentAssetData ? currentAssetData.AssetId : 'NEW_RECORD',
            onWithdrawal: handleWithdrawalAsset,
          })}
        </div>
      </CustomDrawer>

      {/* Success Modal */}
      <SuccessModal
        open={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Asset Withdrawal Request Submitted"
        message=""
        buttonText="Dismiss"
      />

      {/* Confirmation Modal */}
      <SuccessModal
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Asset Withdrawal"
        message=""
        showCancelButton={true}
        onConfirm={handleConfirmApproval}
        confirmButtonText="Yes, Withdraw"
        cancelButtonText="Cancel"
        iconType="warning"
      />

      {/* Withdrawal Success Modal */}
      <SuccessModal
        open={withdrawalSuccessModalOpen}
        onClose={() => setWithdrawalSuccessModalOpen(false)}
        title="Asset Withdrawn Successfully!"
        message=""
        buttonText="Dismiss"
        iconType="success"
      />

      {/* Delete Check List Item Confirmation Modal */}
      <SuccessModal
        open={deleteConfirmModalOpen}
        onClose={() => {
          setDeleteConfirmModalOpen(false);
          setItemToDelete(null);
        }}
        title="Are you sure you want to delete this record ?"
        message="Are you sure you want to delete this item? This action cannot be undone."
        showCancelButton={true}
        onConfirm={handleConfirmDelete}
        confirmButtonText="Yes, Delete"
        cancelButtonText="Cancel"
        iconType="warning"
      />

      {/* Check List Items Edit Drawer */}
      <CustomDrawer
        key={`checklist-drawer-${selectedRow?.CheckListId || 'new'}`}
        open={checklistEditDrawerOpen}
        onClose={() => setChecklistEditDrawerOpen(false)}
        title="Edit Check List Items"
        width="80%"
        bodyStyle={{
          padding: '24px',
          position: 'relative',
        }}
      >
        <style>
          {`
            .ant-dropdown {
              z-index: 9999 !important;
            }
            ul.ant-dropdown-menu.ant-dropdown-menu-root.ant-dropdown-menu-vertical {
              margin-top: 5px !important;
              margin-right: -13px !important;
            }
            .ant-dropdown-menu[role="menu"] {
              margin-top: 5px !important;
              margin-right: -13px !important;
            }
            ul[class*="ant-dropdown-menu"] {
              margin-top: 5px !important;
              margin-right: -13px !important;
            }
            .ag-theme-material {
              overflow: visible !important;
            }
            .ag-center-cols-container {
              overflow: visible !important;
            }
          `}
        </style>

        {/* Asset Id and New Items Button in same row */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginTop: '16px',
            marginBottom: '16px',
            padding: '0 10px 0 10px',
          }}
        >
          {(assetData?.EquipmentId || selectedRow?.EquipmentId) && (
            <Typography
              sx={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#374151',
                marginLeft: '12px',
              }}
            >
              <span style={{ marginRight: '7px' }}>
                {' '}
                {assetData?.EquipmentId || selectedRow?.EquipmentId}
              </span>
              <span> {assetData?.CheckListLabelId || selectedRow?.CheckListLabelId}</span>
            </Typography>
          )}

          <Button
            variant="contained"
            onClick={() => setShowNewItemForm(true)}
            sx={{
              backgroundColor: '#6941C6',
              color: 'white',
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '12px',
              padding: '8px 16px',
              '&:hover': {
                backgroundColor: '#5331b8',
              },
            }}
          >
            + New Items
          </Button>
        </Box>

        <Box
          sx={{ marginTop: assetData?.EquipmentId || selectedRow?.EquipmentId ? '0px' : '60px' }}
        >
          {checklistEditDrawerOpen &&
            UIHelper.createChildGrid('10822', 'CheckList', selectedRow, {
              hidePaging: true,
              pagination: false,
              readOnlyGrid: true,
              onSuccess: () => {
                // Reload check list items after update
                reloadCheckListItems();
              },
            })}
        </Box>
      </CustomDrawer>

      {/* Add New Check List Item Modal */}
      <Modal
        open={showNewItemForm}
        onClose={() => {
          setShowNewItemForm(false);
          setNewItem({ itemName: '', requiredActions: '', parameters: '' });
        }}
        aria-labelledby="add-checklist-item-modal"
        sx={{
          zIndex: 9999,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 450,
            bgcolor: 'background.paper',
            borderRadius: '8px',
            boxShadow: 24,
            p: 3,
          }}
        >
          <IconButton
            onClick={() => {
              setShowNewItemForm(false);
              setNewItem({ itemName: '', requiredActions: '', parameters: '' });
            }}
            sx={{
              position: 'absolute',
              right: 16,
              top: 16,
              color: '#9CA3AF',
              '&:hover': {
                backgroundColor: 'rgba(156, 163, 175, 0.1)',
              },
            }}
          >
            <Close fontSize="small" />
          </IconButton>

          <Typography
            variant="h6"
            component="h2"
            sx={{
              mb: 2,
              fontWeight: 600,
              fontSize: '18px',
              color: '#111827',
            }}
          >
            Add New Check List Item
          </Typography>

          {/* Item Name Field */}
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                mb: 1,
                fontSize: '11px',
                fontWeight: 500,
                color: '#374151',
              }}
            >
              Item Name
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter item name"
              value={newItem.itemName}
              onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  fontSize: '11px',
                },
                '& .MuiOutlinedInput-input': {
                  padding: '8px 12px',
                },
              }}
            />
          </Box>

          {/* Required Actions Field */}
          <Box sx={{ mb: 2 }}>
            <Typography
              sx={{
                mb: 1,
                fontSize: '11px',
                fontWeight: 500,
                color: '#374151',
              }}
            >
              Required Actions
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={2}
              placeholder="Enter required actions"
              value={newItem.requiredActions}
              onChange={(e) => setNewItem({ ...newItem, requiredActions: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  fontSize: '11px',
                },
                '& .MuiOutlinedInput-input': {
                  padding: '-5px -5px',
                },
              }}
            />
          </Box>

          {/* Parameters Field */}
          <Box sx={{ mb: 3 }}>
            <Typography
              sx={{
                mb: 1,
                fontSize: '11px',
                fontWeight: 500,
                color: '#374151',
              }}
            >
              Parameters
            </Typography>
            <TextField
              fullWidth
              placeholder="Enter parameters (comma separated)"
              value={newItem.parameters}
              onChange={(e) => setNewItem({ ...newItem, parameters: e.target.value })}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '6px',
                  fontSize: '11px',
                },
                '& .MuiOutlinedInput-input': {
                  padding: '8px 12px',
                },
              }}
            />
          </Box>

          {/* Action Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleAddNewItem}
              disabled={addingItem || !newItem.itemName.trim()}
              sx={{
                backgroundColor: '#6941C6',
                color: 'white',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '11px',
                padding: '8px 24px',
                borderRadius: '6px',
                '&:hover': {
                  backgroundColor: '#5331b8',
                },
                '&:disabled': {
                  backgroundColor: '#E5E7EB',
                  color: '#9CA3AF',
                },
              }}
            >
              {addingItem ? 'Adding...' : 'Add Item'}
            </Button>
          </Box>
        </Box>
      </Modal>
    </Box>
  );
};

export default AssetDetails;
