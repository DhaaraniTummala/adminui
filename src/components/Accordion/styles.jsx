const primaryColor = ['#9c27b0', '#ab47bc', '#8e24aa', '#af2cc5', '#7b1fa2'];
const warningColor = ['#ff9800', '#ffa726', '#fb8c00', '#ffa21a', '#f57c00', '#faf2cc', '#fcf8e3'];
const dangerColor = ['#f44336', '#ef5350', '#e53935', '#f55a4e', '#d32f2f', '#ebcccc', '#f2dede'];
const successColor = ['#4caf50', '#66bb6a', '#43a047', '#5cb860', '#388e3c', '#d0e9c6', '#dff0d8'];
const infoColor = ['#00acc1', '#26c6da', '#00acc1', '#00d3ee', '#0097a7', '#c4e3f3', '#d9edf7'];
const roseColor = ['#c31d1d', '#ec407a', '#d81b60', '#eb3573', '#c2185b'];
const grayColor = [
  '#999',
  '#777',
  '#3C4858',
  '#AAAAAA',
  '#D2D2D2',
  '#DDD',
  '#555555',
  '#333',
  '#eee',
  '#ccc',
  '#e4e4e4',
  '#E5E5E5',
  '#f9f9f9',
  '#f5f5f5',
  '#495057',
  '#e7e7e7',
  '#212121',
  '#c8c8c8',
  '#505050',
];

const accordionStyle = (theme) => ({
  root: {
    flexGrow: 1,
    marginBottom: '20px',
  },
  expansionPanel: {
    boxShadow: 'none',
    '&:before': {
      display: 'none !important',
    },
  },
  expansionPanelExpanded: {
    margin: '0',
  },
  expansionPanelSummary: {
    minHeight: 'auto !important',
    backgroundColor: 'transparent',
    borderBottom: '1px solid ' + grayColor[5],
    padding: '0px',
    borderTopLeftRadius: '3px',
    borderTopRightRadius: '3px',
    color: grayColor[2],
    '&:hover': {
      color: primaryColor[0],
    },
  },
  expansionPanelSummaryExpaned: {
    color: primaryColor[0],
    '& $expansionPanelSummaryExpandIcon': {
      [theme.breakpoints.up('md')]: {
        top: 'auto !important',
      },
      transform: 'rotate(180deg)',
      [theme.breakpoints.down('sm')]: {
        top: '10px !important',
      },
    },
  },
  expansionPanelSummaryContent: {
    margin: '0 !important',
  },
  expansionPanelSummaryExpandIcon: {
    [theme.breakpoints.up('md')]: {
      top: 'auto !important',
    },
    transform: 'rotate(0deg)',
    color: 'inherit',
    [theme.breakpoints.down('sm')]: {
      top: '10px !important',
    },
  },
  expansionPanelSummaryExpandIconExpanded: {},
  title: {
    fontSize: '15px',
    fontWeight: 'bolder',
    marginTop: '0',
    marginBottom: '0',
    color: 'inherit',
  },
  expansionPanelDetails: {
    padding: '0px',
  },
});

export default accordionStyle;
