import { useState } from 'react';
import PropTypes from 'prop-types';
import { Typography } from '@mui/material';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material';

const Modal = ({ open, onClose, onSave, title }) => {
  const [organizationName, setOrganizationName] = useState('');

  const handleInputChange = (e) => {
    setOrganizationName(e.target.value);
  };

  const handleSave = () => {
    onSave && onSave(organizationName);
    setOrganizationName('');
    onClose && onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      PaperProps={{
        style: {
          width: '750px',
          maxWidth: '90%',
        },
      }}
    >
      <DialogTitle style={{ marginBottom: '-10px' }}>
        <Typography
          variant="h6"
          className="text-sm"
          style={{ fontWeight: 'bold', fontSize: '12px' }}
        >
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent>
        <TextField
          variant="outlined"
          autoFocus
          margin="dense"
          label="Organization Name"
          type="text"
          fullWidth
          value={organizationName}
          onChange={handleInputChange}
          InputProps={{
            style: { padding: '8px 12px', fontSize: '14px' },
          }}
        />
      </DialogContent>

      <DialogActions
        style={{
          borderTop: '1.5px solid rgba(28, 28, 28, 0.1)',
          borderBottom: '1.5px solid rgba(28, 28, 28, 0.1)',
          marginBottom: '24px',
          marginTop: '24px',
          width: 'calc(100% - 48px)',
          marginLeft: '24px',
        }}
      >
        <Button
          onClick={onClose}
          color="inherit"
          style={{ background: 'rgba(28, 28, 28, 0.05)', padding: '8px 10px' }}
        >
          Discard
        </Button>
        <Button
          onClick={handleSave}
          style={{ background: '#056EE9', color: '#FFF', padding: '8px 10px' }}
        >
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

Modal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
};

export default Modal;
