import React from 'react';
import { Dialog, DialogContent, Box, Typography, Button, IconButton } from '@mui/material';
import { Close } from '@mui/icons-material';

const SuccessModal = ({
  open,
  onClose,
  title = 'Success',
  showCancelButton = false,
  onConfirm,
  confirmButtonText = 'Yes, Withdraw',
  iconType = 'success', // "success", "error", or "warning"
}) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      TransitionProps={{
        timeout: 300,
      }}
      PaperProps={{
        sx: {
          borderRadius: '16px',
          p: 0,
          maxWidth: '650px',
          animation: open ? 'modalFadeIn 0.3s ease-out' : 'modalFadeOut 0.3s ease-in',
          '@keyframes modalFadeIn': {
            '0%': {
              opacity: 0,
              transform: 'scale(0.8) translateY(-20px)',
            },
            '100%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            },
          },
          '@keyframes modalFadeOut': {
            '0%': {
              opacity: 1,
              transform: 'scale(1) translateY(0)',
            },
            '100%': {
              opacity: 0,
              transform: 'scale(0.8) translateY(-20px)',
            },
          },
        },
      }}
    >
      <DialogContent sx={{ p: 0, width: '650px',  }}>
        <Box sx={{ position: 'relative', p: 4,   }}>
          <IconButton
            onClick={onClose}
            sx={{
              position: 'absolute',
              right: 30,
              top: 16,
              color: '#9CA3AF',
              '&:hover': {
                backgroundColor: 'rgba(156, 163, 175, 0.1)',
              },
            }}
          >
            <Close fontSize="small" />
          </IconButton>

          <Box sx={{ pt: 1 }}>
            {/* Icon and Title side by side */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
              {/* Dynamic icon based on type */}
              {iconType === 'success' ? (
                <img
                  src="Verify.svg"
                  alt="Success"
                  width={48}
                  height={48}
                />
              ) : iconType === 'error' ? (
                <img
                  src="Warning.svg"
                  alt="Error"
                  width={48}
                  height={48}
                  style={{ filter: 'hue-rotate(0deg) saturate(2)' }}
                />
              ) : (
                <img
                  src="Warning.svg"
                  alt="Warning"
                  width={48}
                  height={48}
                />
              )}

              <Typography
                variant="h6"
                sx={{
                  fontWeight: 600,
                  color: '#111827',
                  fontSize: '18px',
                  lineHeight: 1.4,
                }}
              >
                {title}
              </Typography>
            </Box>

            {/* <Typography
              variant="body2"
              sx={{
                color: '#6B7280',
                mb: 4,
                lineHeight: 1.5,
                fontSize: '14px',
              }}
            >
              {message}
            </Typography> */}

            {/* Only show confirm button when showCancelButton is true */}
            {showCancelButton && onConfirm && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-start', gap: 2 }}>
                <Button
                  onClick={onConfirm}
                  sx={{
                    color: '#FFF',
                    backgroundColor: 'rgba(3, 152, 85, 1)',
                    border: '2px solid rgba(3, 152, 85, 1)',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 500,
                    fontSize: '14px',
                    px: 3,
                    py: 1,
                    minWidth: 'auto',
                    '&:hover': {
                      backgroundColor: 'rgba(3, 152, 85, 1)',
                      borderBottom: '2px solid rgba(3, 152, 85, 1)',
                      color: '#FFF',
                    },
                  }}
                >
                  {confirmButtonText}
                </Button>
              </Box>
            )}
          </Box>
        </Box>
      </DialogContent>
    </Dialog>
  );
};

export default SuccessModal;
