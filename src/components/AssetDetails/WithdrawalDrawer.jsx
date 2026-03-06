import React, { useState, useEffect } from 'react';
import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  FormControlLabel,
  FormLabel,
} from '@mui/material';
import { ArrowBack, Close } from '@mui/icons-material';
import SuccessModal from '../common/SuccessModal';
import { ASSET_STATUS_IDS } from '../../configs/assetConstants';
import GenericTable from '../common/GenericTable';
import GenericSection from '../common/GenericSection';
import { createGenericSection } from '../../utils/sectionUtils';

const WithdrawalDrawer = ({
  open,
  onClose,
  withdrawalData,
  onWithdrawalInputChange,
  onWithdrawalSubmit,
  selectedRow,
  renderAssetDetails,
  onApprove,
  onReject,
}) => {
  // Check if asset StatusTypeId matches the withdrawal request status
  const isWithdrawalRequested =
    selectedRow?.AssetStatusTypeId === ASSET_STATUS_IDS.WITHDRAWAL_REQUESTED;

  // Check if asset is withdrawn (approved)
  const isWithdrawn = selectedRow?.AssetStatusTypeId === ASSET_STATUS_IDS.WITHDRAWN;

  // Show table for both request and withdrawn status
  const showWithdrawalTable = isWithdrawalRequested || isWithdrawn;

  // State for confirmation modal
  const [showRejectConfirmation, setShowRejectConfirmation] = useState(false);

  // Handle reject button click - show confirmation modal
  const handleRejectClick = () => {
    setShowRejectConfirmation(true);
  };

  // Handle actual rejection after confirmation
  const handleConfirmReject = () => {
    setShowRejectConfirmation(false);
    onReject(); // Call the original onReject function
  };

  // Handle cancel rejection
  const handleCancelReject = () => {
    setShowRejectConfirmation(false);
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: 600,
          borderRadius: '12px',
          maxHeight: 'calc(100vh - 40px)',
          top: 20,
          right: 20,
          bottom: 20,
          height: 'auto',
        },
      }}
      SlideProps={{
        direction: 'left',
      }}
    >
      {/* Custom Header - Modified to center title after removing close icon */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 2,
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: '#FCFCFD',
        }}
      >
        {/* Left side - Back button */}
        <IconButton
          onClick={onClose}
          sx={{
            color: '#04080B',
          }}
        >
          <ArrowBack />
        </IconButton>

        {/* Center - Title */}
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: '#374151',
            fontSize: '16px',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        >
          Withdrawal Asset
        </Typography>

        {/* Right side - Asset ID */}
        {selectedRow?.EquipmentId ? (
          <Typography
            variant="h6"
            sx={{
              color: '#6B7280',
              fontWeight: 600,
              fontSize: '16px',
            }}
          >
            {String(selectedRow.EquipmentId).padStart(4, '0')}
          </Typography>
        ) : (
          <Box sx={{ width: 40 }} /> // Placeholder to maintain layout balance
        )}

        {/* Close icon commented out - removed to simplify header and prevent accidental closure */}
        {/* <IconButton
          onClick={onClose}
          sx={{
            color: '#04080B',
          }}
        >
          <Close />
        </IconButton> */}
      </Box>

      {/* Descriptive Heading */}
      <Box
        sx={{
          p: 3,
          pb: 2,
          backgroundColor: 'white',
        }}
      >
       
      </Box>

      {/* Content */}
      <Box sx={{ p: 3, pt: 0, flex: 1, overflowY: 'auto' }}>
        {/* Asset Details Table */}
        <Box sx={{ mb: 3 }}>
          <Box>{renderAssetDetails(2)}</Box>
        </Box>

        {/* Conditional Content: Table or Form */}
        <Box>
          {showWithdrawalTable ? (
            /* Show Withdrawal Details with Asset Details styling */
            <Box>
              {createGenericSection({
                title: isWithdrawalRequested ? 'Withdrawal Request Details' : 'Withdrawal Details',
                fields: [
                  { key: 'AssetWithdrawal_Reason', title: 'Reason' },
                  { key: 'AssetWithdrawal_Method', title: 'Method' },
                  { key: 'AssetWithdrawal_Condition', title: 'Condition' },
                  { key: 'Status', title: 'Status' },
                  { key: 'AssetWithdrawal_WithdrawalDescription', title: 'Description' },
                ],
                rowData: selectedRow,
                columnCount: 2,
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
              })}
            </Box>
          ) : (
            /* Show Withdrawal Form */
            <Box>
              <Typography
                variant="h6"
                sx={{
                  mb: 2,
                  fontWeight: 600,
                  color: '#374151',
                  fontSize: '1rem',
                }}
              >
                Withdrawal Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {/* First Row: Reason and Method side by side */}
                <Box sx={{ display: 'flex', gap: 2, width: '100%' }}>
                  {/* Reason */}
                  <Box sx={{ flex: 1 }}>
                    <FormControl fullWidth required>
                      <InputLabel>Reason *</InputLabel>
                      <Select
                        value={withdrawalData.reason}
                        onChange={(e) => onWithdrawalInputChange('reason', e.target.value)}
                        label="Reason *"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#9ca3af',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#6366f1',
                              borderWidth: '1px',
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select Reason</MenuItem>
                        <MenuItem value="damaged">Damaged</MenuItem>
                        <MenuItem value="obsolete">Obsolete</MenuItem>
                        <MenuItem value="sold">Sold</MenuItem>
                        <MenuItem value="donation">Donation</MenuItem>
                        <MenuItem value="transfer">Transfer</MenuItem>
                        <MenuItem value="return">Return</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>

                  {/* Method */}
                  <Box sx={{ flex: 1 }}>
                    <FormControl fullWidth required>
                      <InputLabel>Method *</InputLabel>
                      <Select
                        value={withdrawalData.method}
                        onChange={(e) => onWithdrawalInputChange('method', e.target.value)}
                        label="Method *"
                        sx={{
                          '& .MuiOutlinedInput-root': {
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            '&:hover .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#9ca3af',
                            },
                            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                              borderColor: '#6366f1',
                              borderWidth: '1px',
                            },
                          },
                        }}
                      >
                        <MenuItem value="">Select Method</MenuItem>
                        <MenuItem value="disposal">Disposal</MenuItem>
                        <MenuItem value="sale">Sale</MenuItem>
                        <MenuItem value="donation">Donation</MenuItem>
                        <MenuItem value="transfer">Transfer</MenuItem>
                        <MenuItem value="return">Return</MenuItem>
                      </Select>
                    </FormControl>
                  </Box>
                </Box>

                {/* Second Row: Condition */}
                <Box>
                  <FormControl component="fieldset" fullWidth>
                    <FormLabel
                      component="legend"
                      sx={{
                        fontWeight: 500,
                        color: '#374151',
                        mb: 1,
                        fontSize: '0.875rem',
                        '&.Mui-focused': {
                          color: '#374151',
                        },
                      }}
                    >
                      Condition *
                    </FormLabel>
                    <Box sx={{ display: 'flex', gap: 3, mt: 0.5 }}>
                      {['Poor', 'Good', 'Repairable'].map((option) => (
                        <FormControlLabel
                          key={option}
                          value={option.toLowerCase()}
                          control={
                            <Radio
                              size="small"
                              checked={withdrawalData.condition === option.toLowerCase()}
                              onChange={() =>
                                onWithdrawalInputChange('condition', option.toLowerCase())
                              }
                              sx={{
                                color: '#9ca3af',
                                '&.Mui-checked': {
                                  color: '#6366f1',
                                },
                                '&:hover': {
                                  backgroundColor: 'rgba(99, 102, 241, 0.04)',
                                },
                                padding: '8px',
                              }}
                            />
                          }
                          label={
                            <Typography variant="body2" sx={{ fontSize: '0.875rem' }}>
                              {option}
                            </Typography>
                          }
                          sx={{
                            margin: 0,
                            '& .MuiFormControlLabel-label': {
                              fontSize: '0.875rem',
                            },
                          }}
                        />
                      ))}
                    </Box>
                  </FormControl>
                </Box>

                {/* Third Row: Description */}
                <Box>
                  <TextField
                    fullWidth
                    label="Description *"
                    multiline
                    rows={4}
                    value={withdrawalData.description}
                    onChange={(e) => onWithdrawalInputChange('description', e.target.value)}
                    placeholder="Enter description..."
                    required
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        borderRadius: '8px',
                        backgroundColor: '#fff',
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#9ca3af',
                        },
                        '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                          borderColor: '#6366f1',
                          borderWidth: '1px',
                        },
                      },
                      '& .MuiInputLabel-root': {
                        color: '#6b7280',
                        '&.Mui-focused': {
                          color: '#6366f1',
                        },
                      },
                    }}
                  />
                </Box>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Footer Actions */}
      <Box
        sx={{
          p: 2,
          borderTop: '1px solid #e5e7eb',
          display: 'flex',
          gap: 2,
          justifyContent: 'space-between',
        }}
      >
        {isWithdrawalRequested ? (
          /* Show Approve and Reject buttons when status is Request */
          <>
            <Button
              onClick={handleRejectClick}
              variant="text"
              disableRipple
              disableElevation
              disableFocusRipple
              disableTouchRipple
              sx={{
                border: 'none',
                color: '#B42318',
                backgroundColor: '#FFFBFA',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 500,
                padding: '10px 16px',
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: '#FFFBFA !important',
                  color: '#B42318 !important',
                },
                '&:focus': {
                  backgroundColor: '#FFFBFA !important',
                },
                '&:active': {
                  backgroundColor: '#FFFBFA !important',
                },
                '&.MuiButton-root:hover': {
                  backgroundColor: '#FFFBFA !important',
                },
                '&.MuiButton-text:hover': {
                  backgroundColor: '#FFFBFA !important',
                },
                '&.Mui-focusVisible': {
                  backgroundColor: '#FFFBFA !important',
                },
              }}
            >
              ✕ Reject Request
            </Button>
            <Button
              onClick={onApprove}
              variant="contained"
              disableRipple
              disableElevation
              disableFocusRipple
              disableTouchRipple
              sx={{
                backgroundColor: '#039855',
                color: 'white',
                borderRadius: '12px',
                textTransform: 'none',
                fontWeight: 500,
                padding: '10px 16px',
                minWidth: 'auto',
                '&:hover': {
                  backgroundColor: '#039855 !important',
                  color: 'white !important',
                },
                '&:focus': {
                  backgroundColor: '#039855 !important',
                },
                '&:active': {
                  backgroundColor: '#039855 !important',
                },
                '&.MuiButton-root:hover': {
                  backgroundColor: '#039855 !important',
                },
                '&.MuiButton-contained:hover': {
                  backgroundColor: '#039855 !important',
                },
                '&.Mui-focusVisible': {
                  backgroundColor: '#039855 !important',
                },
              }}
            >
              Approved
            </Button>
          </>
        ) : (
          /* Show Submit button for new withdrawal */
          <>
            {/* Cancel button commented out - removed to simplify UI and prevent accidental form cancellation */}
            {/* <Button
              onClick={onClose}
              variant="outlined"
              sx={{
                borderColor: '#D0D5DD',
                color: '#344054',
                fontWeight: 500,
                fontSize: '14px',
                textTransform: 'none',
                '&:hover': {
                  borderColor: '#D0D5DD',
                  backgroundColor: '#F9FAFB',
                },
              }}
            >
              Cancel
            </Button> */}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
              <Button
                onClick={onWithdrawalSubmit}
                variant="contained"
                disabled={
                  !withdrawalData.reason.trim() ||
                  !withdrawalData.method.trim() ||
                  !withdrawalData.description.trim()
                }
                sx={{
                  backgroundColor: '#7F56D9',
                  '&:hover': { backgroundColor: '#6B46C1' },
                  '&:disabled': { backgroundColor: '#f3f4f6', color: '#9ca3af' },
                  borderRadius: '8px',
                  textTransform: 'none',
                  fontWeight: 500,
                  px: 3,
                  fontSize: '12px',
                  padding: '10px 30px',
                }}
              >
                Submit
              </Button>
            </Box>
          </>
        )}
      </Box>

      {/* Reject Confirmation Modal */}
      <SuccessModal
        open={showRejectConfirmation}
        onClose={handleCancelReject}
        title="Reject Withdrawal Request"
        message=""
        showCancelButton={true}
        onConfirm={handleConfirmReject}
        confirmButtonText="Yes, Reject"
        cancelButtonText="Cancel"
        iconType="warning"
        autoFocusCancel={true}
      />
    </Drawer>
  );
};

export default WithdrawalDrawer;
