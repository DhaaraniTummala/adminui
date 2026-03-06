import React from 'react';
import { InputComponent } from '../input-component';
import { TextField } from '@mui/material';

export class CustomTextAreaInput extends InputComponent {
  constructor(props) {
    super(props);
  }
  render() {
    return <TextField style={{ width: '100%' }} multiline {...this.props} />;
  }
}
