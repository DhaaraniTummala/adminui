import React from 'react';
import { Box } from '@mui/material';

const GenericTable = ({ data, fields, renderers = {} }) => {
  return (
    <Box
      sx={{
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        overflow: 'hidden',
        backgroundColor: '#fff',
        fontSize: '0.875rem',
      }}
    >
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 2fr',
          gap: 0,
        }}
      >
        {fields.flatMap((field, index) => {
          const renderer = renderers[field.key] || field.render;
          const value = data?.[field.key];

          return [
            <Box
              key={`${field.key}-label`}
              sx={{
                p: 2,
                backgroundColor: '#f9fafb',
                borderBottom: index < fields.length - 1 ? '1px solid #e5e7eb' : 'none',
                fontWeight: 600,
                color: '#374151',
              }}
            >
              {field.label || field.key}
            </Box>,
            <Box
              key={`${field.key}-value`}
              sx={{
                p: 2,
                borderBottom: index < fields.length - 1 ? '1px solid #e5e7eb' : 'none',
                color: '#6b7280',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {renderer
                ? renderer(value, data)
                : value !== undefined && value !== null
                  ? value
                  : '-'}
            </Box>,
          ];
        })}
      </Box>
    </Box>
  );
};

export default GenericTable;
