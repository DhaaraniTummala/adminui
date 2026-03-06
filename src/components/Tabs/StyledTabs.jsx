import { styled } from '@mui/material/styles';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';

const primaryColor = ['#9c27b0', '#ab47bc', '#8e24aa', '#af2cc5', '#7b1fa2'];
const whiteColor = '#FFF';

export const StyledTabs = styled(Tabs)(({ theme }) => ({
  marginTop: '20px',
  paddingLeft: '0',
  marginBottom: '0',
  overflow: 'visible !important',
  '& .MuiTabs-flexContainer': {
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      flexWrap: 'wrap',
    },
  },
  '& .MuiTabs-indicator': {
    display: 'none !important',
  },
  '&.MuiTabs-fixed': {
    overflowX: 'visible',
  },
}));

export const StyledTab = styled(Tab, {
  shouldForwardProp: (prop) => prop !== 'horizontal' && prop !== 'noRadius',
})(({ theme, horizontal, noRadius }) => ({
  float: 'left',
  position: 'relative',
  display: 'block',
  borderRadius: noRadius ? '0px' : '8px',
  minWidth: '100px',
  textAlign: 'center',
  transition: 'all .3s',
  padding: '10px 25px',
  color: whiteColor,
  height: 'auto',
  maxWidth: '100%',
  marginBottom: '-30px !important',
  backgroundColor: '#c6c7f8 !important',
  marginRight: '8px',
  '&.Mui-selected': {
    color: whiteColor,
    backgroundColor: '#95a4fc !important',
    borderBottom: 'none',
    borderRadius: '8px',
  },
  '&:hover': {
    opacity: 1,
  },
  '& .MuiTab-wrapper': {
    lineHeight: '24px',
    textTransform: 'uppercase',
    fontSize: '12px',
    fontWeight: '500',
    position: 'relative',
    display: 'block',
    color: 'inherit',
  },
  ...(horizontal && {
    width: '100%',
    float: 'none !important',
    '& + button': {
      margin: '10px 0',
    },
  }),
}));

export const TabContentWrapper = styled('div')({
  marginTop: '20px',
});

export const TabIcon = styled('div')({
  width: '30px',
  height: '30px',
  display: 'block',
  margin: '15px 0',
});
