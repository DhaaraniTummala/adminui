import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Stack from '@mui/material/Stack';
import { deepOrange, deepPurple } from '@mui/material/colors';
import AvatarGroup from '@mui/material/AvatarGroup';
import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';

//  variant

export function ImageAvatars() {
  return (
    <Stack direction="row" spacing={2}>
      <Avatar
        alt="Mr. Bean"
        src="https://www.hindustantimes.com/ht-img/img/2024/01/04/1600x900/mr_bean_1704383140543_1704383147458.jpg"
      />
      <Avatar
        alt="Rowan Atkinson"
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRa8CPLX5BMxkoOF6xbhahaO5qX5BTE1KivuVwiuGfUgU-05EqByT-JijntREb8B8r0qWwGJSDKpZ7qXyq1SfjX_xH98JMDINwha-j0PQ"
      />
      <Avatar
        alt="Charlie Chaplin"
        src="https://encrypted-tbn0.gstatic.com/licensed-image?q=tbn:ANd9GcSjPPQajzdVcA4pVFz9YkgqQENu4nePdHIN5YjSrueZ6D8mm-iSbAiT2A6VCvCVUxCWVf__WzujC-W9bVA"
      />
    </Stack>
  );
}

export function LetterAvatars() {
  return (
    <Stack direction="row" spacing={2}>
      <Avatar>H</Avatar>
      <Avatar sx={{ bgcolor: deepOrange[500] }}>N</Avatar>
      <Avatar sx={{ bgcolor: deepPurple[500] }}>OP</Avatar>
    </Stack>
  );
}

// sizes

export function SizeAvatars() {
  return (
    <Stack direction="row" spacing={2}>
      <Avatar
        alt="Mark Zuckerberg"
        src="https://encrypted-tbn1.gstatic.com/licensed-image?q=tbn:ANd9GcR7h6Tqs4jOu396fucpmNiEFICsncuwzZPh8tE3v6f08cY6jzpan9IDGgN-MEtvJOC4mEaM5O4uB4qquXw"
        sx={{ width: 24, height: 24 }}
      />
      <Avatar
        alt="Robert Downey Jr."
        src="https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcQol0lpZgGHuCh4IHU6oXoBtwDTBVldLkw-Z_3moAzEJ97CCd_tZDolPjhdGvL6B2S1QOi1HhAiCkvYdwlG5SaPlGCRmO_a7jlYxUo_0PA"
      />
      <Avatar
        alt="Emma Watson"
        src="https://encrypted-tbn3.gstatic.com/images?q=tbn:ANd9GcSvhujovWf6FwfvyaG1VgLVLMU-ap57dCur6eIuFeFcxUcveyug"
        sx={{ width: 56, height: 56 }}
      />
    </Stack>
  );
}

export function TotalAvatars() {
  return (
    <AvatarGroup total={24}>
      <Avatar
        alt="Brendan Eich"
        src="https://upload.wikimedia.org/wikipedia/commons/thumb/d/d1/Brendan_Eich_Mozilla_Foundation_official_photo.jpg/220px-Brendan_Eich_Mozilla_Foundation_official_photo.jpg"
      />
      <Avatar
        alt="Dennis Ritchie"
        src="https://media.wired.com/photos/59327f14f682204f73696455/master/pass/ritchie_HP.jpg"
      />
      <Avatar
        alt="Bjarne Stroustrup"
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR75iSgVK82Vs43og3JtkqIOtoCoejwcwTxjyOUq_CgzQ&s"
      />
      <Avatar
        alt="Guido van Rossum"
        src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT3n3P55syfqvpXvc8CcuDtQTg2p52r5Y6pf-8UVLuXULIbjKndYs5cGeGd1gOY13Jq9ps&usqp=CAU"
      />
    </AvatarGroup>
  );
}

const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: 22,
  height: 22,
  border: `2px solid ${theme.palette.background.paper}`,
}));

export function BadgeAvatars() {
  return (
    <Stack direction="row" spacing={2}>
      <StyledBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
      >
        <Avatar
          alt="Ileana D'Cruz"
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS6YW80I5gPE_1IUfpax5xdLLAfVYC6JcdsxX14i_ocn95t0QdO"
        />
      </StyledBadge>
      <Badge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        badgeContent={
          <SmallAvatar
            alt="Allu Arjun"
            src="https://stat4.bollywoodhungama.in/wp-content/uploads/2024/03/Allu-Arjun-addresses-the-need-620.jpg"
          />
        }
      >
        <Avatar
          alt="Travis Howard"
          src="https://upload.wikimedia.org/wikipedia/commons/7/74/AamirKhan.jpg"
        />
      </Badge>
    </Stack>
  );
}
