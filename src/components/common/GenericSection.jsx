import React from 'react';
import { Box, Typography } from '@mui/material';

const GenericSection = ({ fields, data, columnsPerRow = 4 }) => {
  const renderFieldValue = (field, value) => {
    if (field.format && value !== undefined && value !== null) {
      return field.format(value);
    }
    return value !== null && value !== undefined ? String(value) : 'N/A';
  };

  const regularFields = fields.filter((field) => !field.fullWidth);
  const fullWidthFields = fields.filter((field) => field.fullWidth);

  return (
    <Box sx={{ p: 0 }}>
      {/* Regular fields in specified columns */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          mx: -1,
          '& > *': {
            px: 1,
            mb: 2,
            width: {
              xs: '100%',
              sm: columnsPerRow === 2 ? '50%' : '100%',
              md: columnsPerRow === 2 ? '50%' : '33.333%',
              lg: `${100 / columnsPerRow}%`,
            },
          },
        }}
      >
        {regularFields.map((field) => (
          <Box
            key={field.key}
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              p: 1.5,
              height: '100%',
              boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#6b7280',
                fontSize: '0.6875rem',
                fontWeight: 500,
                display: 'block',
                letterSpacing: '0.025em',
                textTransform: 'uppercase',
                mb: 0.5,
                lineHeight: 1.2,
              }}
            >
              {field.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#111827',
                fontWeight: 400,
                wordBreak: 'break-word',
                fontSize: '0.875rem',
                lineHeight: 1.5,
              }}
            >
              {renderFieldValue(field, data?.[field.key])}
            </Typography>
          </Box>
        ))}
      </Box>

      {/* Full width fields */}
      {fullWidthFields.map((field) => (
        <Box key={field.key} sx={{ mt: 2, width: '100%' }}>
          <Box
            sx={{
              backgroundColor: '#ffffff',
              borderRadius: '6px',
              p: 1.5,
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color: '#6b7280',
                fontSize: '0.6875rem',
                fontWeight: 500,
                letterSpacing: '0.025em',
                textTransform: 'uppercase',
                mb: 0.5,
                display: 'block',
              }}
            >
              {field.label}
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: '#111827',
                fontWeight: 400,
                wordBreak: 'break-word',
                fontSize: '0.875rem',
                lineHeight: 1.5,
                whiteSpace: 'pre-line',
              }}
            >
              {renderFieldValue(field, data?.[field.key])}
            </Typography>
          </Box>
        </Box>
      ))}
    </Box>
  );
};

export default GenericSection;
