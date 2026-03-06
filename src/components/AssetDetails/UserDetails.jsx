import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  Divider,
  Button,
  Drawer,
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
import UIHelper from '../BaseView/UIHelper';
import API from '../../store/requests';
import { entityConfigs } from '../../configs/entityConfigs';
import GenericSection from '../common/GenericSection';
import { createGenericSection } from '../../utils/sectionUtils';
import SuccessModal from '../common/SuccessModal';
import AddNewUserModal from '../../views/custom/AddUserModel';

const UserDetails = ({ recordId: userId }) => {
  const navigate = useNavigate();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [currentUserData, setCurrentUserData] = useState(selectedRow);
  const [formRef, setFormRef] = useState(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dataFound, setDataFound] = useState(false);

  // User configId for details form
  const userConfig = entityConfigs.user;
  const userConfigId = userConfig.configId;

  // Function to load user data
  const loadUserData = async () => {
    if (userId) {
      setLoading(true);
      setDataFound(false);
      setSelectedRow(null);

      const payload = { Guid: userId, action: 'LoadView' };

      try {
        const response = await API.triggerPost(userConfigId, payload);
        console.log('API Response:', response);
        if (response?.data) {
          console.log('User data loaded:', response.data);
          setSelectedRow(response.data);
          setCurrentUserData(response.data);
          setDataFound(true);
        } else {
          console.error('Failed to load user - no data in response:', response);
          setDataFound(false);
        }
      } catch (error) {
        console.error('Error loading user:', error);
        setDataFound(false);
      } finally {
        setLoading(false);
      }
    } else {
      console.log('No userId provided');
      setLoading(false);
      setDataFound(false);
      setSelectedRow(null);
    }
  };

  // Load API Call using userId
  useEffect(() => {
    loadUserData();
  }, [userId]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleEditDetails = () => {
    console.log('Current user data for editing:', currentUserData);
    console.log('Available keys:', Object.keys(currentUserData || {}));
    setEditModalOpen(true);
  };
  console.log('Current user UserRoleJson UserRoleJson UserRoleJson:', currentUserData?.UserRoleJson);
  const handleEditModalClose = () => {
    setEditModalOpen(false);
  };

  // Render user details using createGenericSection
  const renderUserDetails = (columnsPerRow = 4) => {
    return createGenericSection({
      title: 'User Details',
      fields: userConfig.fields.filter((field) => {
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
            Loading user details...
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

        {/* Centered no data message */}
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          minHeight="300px"
        >
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No User Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The requested user could not be found or does not exist.
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ backgroundColor: '#f8f9fa', minHeight: '100vh', p: 2, position: 'relative' }}>
      {/* Refreshing Overlay */}
      {refreshing && (
        <Box
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
          }}
        >
          <Box
            sx={{
              backgroundColor: 'white',
              borderRadius: '12px',
              padding: '32px 48px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }}
          >
            <CircularProgress size={48} sx={{ color: 'rgba(105, 65, 198, 1)' }} />
            <Typography variant="body1" sx={{ fontWeight: 500, color: '#111827' }}>
              Updating user details...
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
              sx={{ fontWeight: 600, color: '#111827', mb: 0.5 }}
            >
              View User Details
              {selectedRow?.UserLabelId && (
                <span style={{ color: '#6B7280', fontWeight: 600, marginLeft: '8px' }}>
                  {selectedRow.UserLabelId}
                </span>
              )}
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
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
        </Box>
      </Box>

      <Card
        elevation={0}
        sx={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e5e7eb' }}
      >
        <CardContent sx={{ p: 4 }}>
          <Box sx={{ mb: 4 }}>
            {/* User Image Section */}

            {/* User Details Section */}
            {renderUserDetails()}
          </Box>
        </CardContent>
      </Card>

      <AddNewUserModal
        visible={editModalOpen}
        toggle={handleEditModalClose}
        activeRecordId={userId}
        initialData={currentUserData}
        userRoleJson={currentUserData?.UserRoleJson}
        onSuccess={async () => {
          // Set refreshing state and reload user data
          setRefreshing(true);
          await loadUserData();
          setRefreshing(false);
        }}
        onSave={(updatedData) => {
          setCurrentUserData(updatedData);
          setSelectedRow(updatedData);
          setEditModalOpen(false);
        }}
      />
    </Box>
  );
};

export default UserDetails;