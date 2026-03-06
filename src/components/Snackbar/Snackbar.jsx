import React from 'react';
import PropTypes from 'prop-types';

// @mui/material components
import Snack from '@mui/material/Snackbar';
import IconButton from '@mui/material/IconButton';

// @mui/icons-material
import Close from '@mui/icons-material/Close';
import { StyledSnackbar, StyledIconButton, StyledIcon, MessageWrapper } from './styles';

function Snackbar({ message, color = 'info', close, icon, place, open, closeNotification }) {
  const actions = [];

  if (close) {
    actions.push(
      <StyledIconButton key="close" aria-label="Close" onClick={closeNotification}>
        <Close sx={{ width: '11px', height: '11px' }} />
      </StyledIconButton>,
    );
  }

  return (
    <StyledSnackbar
      anchorOrigin={{
        vertical: place?.includes('t') ? 'top' : 'bottom',
        horizontal: place?.includes('l') ? 'left' : place?.includes('c') ? 'center' : 'right',
      }}
      open={open}
      className={color}
      message={
        <div>
          {icon && <StyledIcon color={color}>{icon}</StyledIcon>}
          <MessageWrapper style={{ display: icon ? 'block' : 'none' }}>{message}</MessageWrapper>
          {!icon && message}
        </div>
      }
      action={actions}
    />
  );
}

Snackbar.propTypes = {
  message: PropTypes.node.isRequired,
  color: PropTypes.oneOf(['info', 'success', 'warning', 'danger', 'primary', 'rose', 'default']),
  close: PropTypes.bool,
  icon: PropTypes.object,
  place: PropTypes.oneOf(['tl', 'tr', 'tc', 'br', 'bl', 'bc']),
  open: PropTypes.bool,
  closeNotification: PropTypes.func,
};

export default Snackbar;
