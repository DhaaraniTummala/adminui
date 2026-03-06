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

const blackColor = '#000';
const whiteColor = '#FFF';
const twitterColor = '#55acee';
const facebookColor = '#3b5998';
const googleColor = '#dd4b39';
const linkedinColor = '#0976b4';
const pinterestColor = '#cc2127';
const youtubeColor = '#e52d27';
const tumblrColor = '#35465c';
const behanceColor = '#1769ff';
const dribbbleColor = '#ea4c89';
const redditColor = '#ff4500';

// ##############################
// // // Function that converts from hex color to rgb color
// // // Example: input = #9c27b0 => output = 156, 39, 176
// // // Example: input = 9c27b0 => output = 156, 39, 176
// // // Example: input = #999 => output = 153, 153, 153
// // // Example: input = 999 => output = 153, 153, 153
// #############################
const hexToRgb = (input) => {
  input = input + '';
  input = input.replace('#', '');
  let hexRegex = /[0-9A-Fa-f]/g;
  if (!hexRegex.test(input) || (input.length !== 3 && input.length !== 6)) {
    throw new Error('input is not a valid hex color.');
  }
  if (input.length === 3) {
    let first = input[0];
    let second = input[1];
    let last = input[2];
    input = first + first + second + second + last + last;
  }
  input = input.toUpperCase(input);
  let first = input[0] + input[1];
  let second = input[2] + input[3];
  let last = input[4] + input[5];
  return parseInt(first, 16) + ', ' + parseInt(second, 16) + ', ' + parseInt(last, 16);
};

const navPillsStyle = (theme) => ({
  root: {
    marginTop: '20px',
    paddingLeft: '0',
    marginBottom: '0',
    overflow: 'visible !important',
  },
  flexContainer: {
    [theme.breakpoints.down('xs')]: {
      display: 'flex',
      flexWrap: 'wrap',
    },
  },
  displayNone: {
    display: 'none !important',
  },
  fixed: {
    overflowX: 'visible',
  },
  horizontalDisplay: {
    display: 'block',
  },
  pills: {
    float: 'left',
    position: 'relative',
    display: 'block',
    borderRadius: '8px',
    // border:'1px solid black',
    minWidth: '100px',
    textAlign: 'center',
    transition: 'all .3s',
    padding: '10px 25px',
    color: whiteColor,
    height: 'auto',
    // opacity: '1',
    maxWidth: '100%',
    marginBottom: '-30px !important',
    backgroundColor: '#c6c7f8 !important',
    marginRight: '8px',
  },
  pillsWithIcons: {
    borderRadius: '4px',
  },
  pillsWithOutRadius: {
    borderRadius: '0px',
  },
  tabIcon: {
    width: '30px',
    height: '30px',
    display: 'block',
    margin: '15px 0',
  },
  horizontalPills: {
    width: '100%',
    float: 'none !important',
    '& + button': {
      margin: '10px 0',
    },
  },
  labelContainer: {
    padding: '0!important',
    color: 'inherit',
  },
  label: {
    lineHeight: '24px',
    textTransform: 'uppercase',
    fontSize: '12px',
    fontWeight: '500',
    position: 'relative',
    display: 'block',
    color: 'inherit',
  },
  contentWrapper: {
    marginTop: '20px',
  },
  primary: {
    '&,&:hover': {
      color: whiteColor,
      backgroundColor: '#95a4fc !important',
      borderBottom: 'none ',
      borderRadius: '8px',
      // other styles...
    },
  },
  info: {
    '&,&:hover': {
      color: whiteColor,
      backgroundColor: infoColor[0],
      boxShadow:
        '0 4px 20px 0px rgba(' +
        hexToRgb(blackColor) +
        ', 0.14), 0 7px 10px -5px rgba(' +
        hexToRgb(successColor[0]) +
        ', 0.4)',
    },
  },
  success: {
    '&,&:hover': {
      color: whiteColor,
      backgroundColor: successColor[0],
      boxShadow:
        '0 2px 2px 0 rgba(' +
        hexToRgb(successColor[0]) +
        ', 0.14), 0 3px 1px -2px rgba(' +
        hexToRgb(successColor[0]) +
        ', 0.2), 0 1px 5px 0 rgba(' +
        hexToRgb(successColor[0]) +
        ', 0.12)',
    },
  },
  warning: {
    '&,&:hover': {
      color: whiteColor,
      backgroundColor: warningColor[0],
      boxShadow:
        '0 4px 20px 0px rgba(' +
        hexToRgb(blackColor) +
        ', 0.14), 0 7px 10px -5px rgba(' +
        hexToRgb(warningColor[0]) +
        ', 0.4)',
    },
  },
  danger: {
    '&,&:hover': {
      color: whiteColor,
      backgroundColor: dangerColor[0],
      boxShadow:
        '0 4px 20px 0px rgba(' +
        hexToRgb(blackColor) +
        ', 0.14), 0 7px 10px -5px rgba(' +
        hexToRgb(warningColor[0]) +
        ', 0.4)',
    },
  },
  rose: {
    '&,&:hover': {
      color: whiteColor,
      backgroundColor: roseColor[0],
      boxShadow:
        '0 4px 20px 0px rgba(' +
        hexToRgb(blackColor) +
        ', 0.14), 0 7px 10px -5px rgba(' +
        hexToRgb(roseColor[0]) +
        ', 0.4)',
    },
  },
  alignCenter: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default navPillsStyle;
