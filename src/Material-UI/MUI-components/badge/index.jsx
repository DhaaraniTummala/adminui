import * as React from 'react';
import Badge from '@mui/material/Badge';
import Stack from '@mui/material/Stack';
import MailIcon from '@mui/icons-material/Mail';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';

export function ColorBadge() {
  return (
    <Stack spacing={2} direction="row">
      <Badge badgeContent={4} color="secondary">
        <MailIcon color="action" />
      </Badge>
      <Badge badgeContent={4} color="success">
        <MailIcon color="action" />
      </Badge>
    </Stack>
  );
}

export function CustomColorBadge() {
  return (
    <Stack spacing={2} direction="row">
      <Badge badgeContent={4} color="secondary">
        <MailIcon color="action" />
      </Badge>
      <Badge badgeContent={4} color="primary">
        <Button variant="outlined" color="success">
          Success
        </Button>
      </Badge>

      <Badge badgeContent={4} color="success">
        <Button variant="outlined" color="error">
          error
        </Button>
      </Badge>

      <Badge badgeContent={4} color="error">
        <Button variant="contained" color="warning">
          warning
        </Button>
      </Badge>
    </Stack>
  );
}

const shapeStyles = { bgcolor: 'primary.main', width: 40, height: 40 };
const shapeCircleStyles = { borderRadius: '50%' };
const rectangle = <Box component="span" sx={shapeStyles} />;
const circle = <Box component="span" sx={{ ...shapeStyles, ...shapeCircleStyles }} />;

export function BadgeOverlap() {
  return (
    <Stack spacing={4} direction="row">
      <Badge color="secondary" badgeContent="hii ">
        {rectangle}
      </Badge>
      <Badge color="secondary" badgeContent="  " variant="dot">
        {rectangle}
      </Badge>
      <Badge color="secondary" overlap="circular" badgeContent="  ">
        {circle}
      </Badge>
      <Badge color="secondary" overlap="circular" badgeContent=" " variant="dot">
        {circle}
      </Badge>
    </Stack>
  );
}
