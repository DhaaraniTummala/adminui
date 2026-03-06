import React from 'react';
import { InputComponent } from '../input-component';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterMoment } from '@mui/x-date-pickers/AdapterMoment';
import moment from 'moment';
import 'moment/locale/de';

export class CustomDateInput extends InputComponent {
  render() {
    const { disabledDate, name, ...otherProps } = this.props;

    // Apply minDate only for Work Order Date field (WODate)
    const shouldApplyMinDate = name === 'WODate';

    return (
      <LocalizationProvider dateAdapter={AdapterMoment} adapterLocale="de">
        <DatePicker
          {...otherProps}
          format="DD-MM-YYYY"
          minDate={shouldApplyMinDate ? moment().startOf('day') : undefined}
          slotProps={{
            textField: {
              fullWidth: true,
              variant: 'outlined',
              InputProps: {
                style: {
                  border: '1.5px solid lightgray', // Another test border
                  borderRadius: '8px',
                  height: '48px',
                },
              },
            },
          }}
        />
      </LocalizationProvider>
    );
  }
}
