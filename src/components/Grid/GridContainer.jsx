import React from 'react';
import { styled } from '@mui/material/styles';
import Grid from '@mui/material/Grid';

const StyledGrid = styled(Grid)({
  margin: '0 -15px',
  width: 'calc(100% + 30px)',
  // '&:before,&:after':{
  //   display: 'table',
  //   content: '" "',
  // },
  // '&:after':{
  //   clear: 'both',
  // }
});

function GridContainer({ children, className = '', ...rest }) {
  return (
    <StyledGrid container {...rest} className={className}>
      {children}
    </StyledGrid>
  );
}

export default GridContainer;
