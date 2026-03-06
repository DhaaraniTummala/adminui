import React from 'react';
import { InputComponent } from '../input-component';
import { TextField } from '@mui/material';

export class CustomInput extends InputComponent {
  render() {
    return (
      <TextField
        fullWidth
        variant="outlined"
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: '#FFFFFF',
            borderRadius: '8px',
            fontSize: '16px',
            border: '1px solid #F2F4F7',
            '& fieldset': {
              borderColor: '#F2F4F7',
              borderWidth: '1px',
            },
            '&:hover fieldset': {
              borderColor: '#F2F4F7',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#F2F4F7',
              boxShadow: '0px 0px 0px 4px rgba(127, 86, 217, 0.12)',
              borderWidth: '1px',
            },
            '&.Mui-disabled': {
              backgroundColor: '#F9FAFB',
              borderColor: '#E4E7EC',
            },
          },
          '& .MuiInputBase-input': {
            padding: '12px 14px',
            fontSize: '16px',
            lineHeight: '24px',
            color: '#101828',
            '&::placeholder': {
              color: '#667085',
              opacity: 1,
            },
            '&.Mui-disabled': {
              color: '#98A2B3',
            },
          },
        }}
        {...this.props}
      />
    );
  }
}
