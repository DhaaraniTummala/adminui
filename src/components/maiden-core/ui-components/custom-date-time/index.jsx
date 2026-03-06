import React from 'react';
import { InputComponent } from '../input-component';
import { DateTimePicker } from '@mui/x-date-pickers/DateTimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
//import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import 'moment/locale/de';

export class CustomDateTimeInput extends InputComponent {
  render() {
    const { slotProps, ...otherProps } = this.props;
    
    // Merge default slotProps with any passed slotProps
    const mergedSlotProps = {
      textField: {
        fullWidth: true,
        variant: 'outlined',
        InputProps: {
          style: {
            border: '1.5px solid lightgray',
            borderRadius: '8px',
            height: '48px',
          },
        },
        ...slotProps?.textField,
      },
    };
    
    return (
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="de">
        <DateTimePicker 
          {...otherProps}
          slotProps={mergedSlotProps}
        />
      </LocalizationProvider>
    );
  }
}
