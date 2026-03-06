const defaultFont = {
  fontFamily: '"Inter", sans-serif',
  fontWeight: '300',
  lineHeight: '1.5em',
};

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

const boxShadow = {
  boxShadow:
    '0 10px 30px -12px rgba(' +
    hexToRgb(blackColor) +
    ', 0.42), 0 4px 25px 0px rgba(' +
    hexToRgb(blackColor) +
    ', 0.12), 0 8px 10px -5px rgba(' +
    hexToRgb(blackColor) +
    ', 0.2)',
};

const primaryBoxShadow = {
  boxShadow:
    '0 4px 20px 0 rgba(' +
    hexToRgb(blackColor) +
    ',.14), 0 7px 10px -5px rgba(' +
    hexToRgb(primaryColor[0]) +
    ',.4)',
};
const infoBoxShadow = {
  boxShadow:
    '0 4px 20px 0 rgba(' +
    hexToRgb(blackColor) +
    ',.14), 0 7px 10px -5px rgba(' +
    hexToRgb(infoColor[0]) +
    ',.4)',
};
const successBoxShadow = {
  boxShadow:
    '0 4px 20px 0 rgba(' +
    hexToRgb(blackColor) +
    ',.14), 0 7px 10px -5px rgba(' +
    hexToRgb(successColor[0]) +
    ',.4)',
};
const warningBoxShadow = {
  boxShadow:
    '0 4px 20px 0 rgba(' +
    hexToRgb(blackColor) +
    ',.14), 0 7px 10px -5px rgba(' +
    hexToRgb(warningColor[0]) +
    ',.4)',
};
const dangerBoxShadow = {
  boxShadow:
    '0 4px 20px 0 rgba(' +
    hexToRgb(blackColor) +
    ',.14), 0 7px 10px -5px rgba(' +
    hexToRgb(dangerColor[0]) +
    ',.4)',
};
const roseBoxShadow = {
  boxShadow:
    '0 4px 20px 0 rgba(' +
    hexToRgb(blackColor) +
    ',.14), 0 7px 10px -5px rgba(' +
    hexToRgb(roseColor[0]) +
    ',.4)',
};

import { styled } from '@mui/material/styles';
import Snackbar from '@mui/material/Snackbar';

export const StyledSnackbar = styled(Snackbar)({
  '& .MuiSnackbarContent-root': {
    ...defaultFont,
    flexWrap: 'unset',
    position: 'relative',
    padding: '20px 15px',
    lineHeight: '20px',
    marginBottom: '20px',
    fontSize: '14px',
    backgroundColor: 'white',
    color: grayColor[6],
    borderRadius: '3px',
    boxShadow:
      '0 12px 20px -10px rgba(' +
      hexToRgb(whiteColor) +
      ', 0.28), 0 4px 20px 0px rgba(' +
      hexToRgb(blackColor) +
      ', 0.12), 0 7px 8px -5px rgba(' +
      hexToRgb(whiteColor) +
      ', 0.2)',
    '&.MuiSnackbarContent-message': {
      padding: '0',
      display: 'block',
      maxWidth: '89%',
    },
    '&.MuiSnackbarContent-action': {
      padding: '0',
    },
  },
  '& .MuiSnackbar-anchorOriginTopCenter': {
    top: '20px',
  },
  '& .MuiSnackbar-anchorOriginTopRight, & .MuiSnackbar-anchorOriginTopLeft': {
    top: '40px',
  },
  '& .MuiSnackbarContent-root.info': {
    backgroundColor: infoColor[3],
    color: whiteColor,
    ...infoBoxShadow,
  },
  '& .MuiSnackbarContent-root.success': {
    backgroundColor: successColor[3],
    color: whiteColor,
    ...successBoxShadow,
  },
  '& .MuiSnackbarContent-root.warning': {
    backgroundColor: warningColor[3],
    color: whiteColor,
    ...warningBoxShadow,
  },
  '& .MuiSnackbarContent-root.danger': {
    backgroundColor: dangerColor[3],
    color: whiteColor,
    ...dangerBoxShadow,
  },
  '& .MuiSnackbarContent-root.primary': {
    backgroundColor: primaryColor[3],
    color: whiteColor,
    ...primaryBoxShadow,
  },
  '& .MuiSnackbarContent-root.rose': {
    backgroundColor: roseColor[3],
    color: whiteColor,
    ...roseBoxShadow,
  },
});

export const StyledIconButton = styled('button')({
  width: '24px',
  height: '24px',
  padding: '0',
  border: 'none',
  background: 'transparent',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
});

export const StyledIcon = styled('div')(({ theme, color = 'info' }) => ({
  width: '38px',
  height: '38px',
  display: 'block',
  left: '15px',
  position: 'absolute',
  marginTop: '-39px',
  fontSize: '20px',
  backgroundColor: 'white',
  padding: '9px',
  borderRadius: '50%',
  maxWidth: '38px',
  boxShadow:
    '0 10px 30px -12px rgba(' +
    hexToRgb(blackColor) +
    ', 0.42), 0 4px 25px 0px rgba(' +
    hexToRgb(blackColor) +
    ', 0.12), 0 8px 10px -5px rgba(' +
    hexToRgb(blackColor) +
    ', 0.2)',
  color: {
    info: infoColor[3],
    success: successColor[3],
    warning: warningColor[3],
    danger: dangerColor[3],
    primary: primaryColor[3],
    rose: roseColor[3],
  }[color],
}));

export const MessageWrapper = styled('div')({
  paddingLeft: '50px',
  display: 'block',
});
