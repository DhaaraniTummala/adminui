import React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

const StyledGrid = styled(Grid)({
  '&.spacing': {
    padding: '0 15px !important',
  },
});

function GridItem({ children, className = '', spacing, ...rest }) {
  return (
    <StyledGrid item {...rest} className={`${spacing ? 'spacing' : ''} ${className}`.trim()}>
      {children}
    </StyledGrid>
  );
}

export default GridItem;
