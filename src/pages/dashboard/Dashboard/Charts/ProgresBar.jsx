import LinearProgress from '@mui/material/LinearProgress';
import { Typography } from '@material-tailwind/react';

const ProgresBar = () => {
  return (
    <div className="flex items-center justify-between">
      <div className="bg-white  rounded-md  lg:mt-6 lg:p-12  mt-0 h-[285px]  w-full">
        <div className="w-67 mb-2 flex items-center">
          <Typography
            variant="body1"
            className="mr-[60px] font-poppins text-[14px] w-10 "
            style={{
              fontWeight: 500,
            }}
          >
            Downloads
          </Typography>
          <div className="flex-grow">
            <LinearProgress
              variant="determinate"
              value={100}
              sx={{
                height: 10,
                bgcolor: '#fff',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#95A4FC',
                },
              }}
            />
          </div>
        </div>
        <div className="w-67 mb-2 flex items-center">
          <Typography
            variant="body1"
            className="mr-[60px] font-poppins text-[14px] w-10 "
            style={{
              fontWeight: 500,
            }}
          >
            Views
          </Typography>
          <div className="flex-grow">
            <LinearProgress
              variant="determinate"
              value={80}
              sx={{
                height: 10,
                bgcolor: '#fff',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#95A4FC',
                },
              }}
            />
          </div>
        </div>
        <div className="w-67 mb-2 flex items-center">
          <Typography
            variant="body1"
            className="mr-[60px] font-poppins text-[14px] w-10 "
            style={{
              fontWeight: 500,
            }}
          >
            Share
          </Typography>
          <div className="flex-grow rounded-r-lg">
            <LinearProgress
              variant="determinate"
              value={95}
              sx={{
                height: 10,
                bgcolor: '#fff',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#95A4FC',
                },
              }}
            />
          </div>
        </div>
        <div className="w-67 mb-2 flex items-center">
          <Typography
            variant="body1"
            className="mr-[60px] font-poppins text-[14px] w-10 "
            style={{
              fontWeight: 500,
            }}
          >
            Delete
          </Typography>
          <div className="flex-grow">
            <LinearProgress
              variant="determinate"
              value={70}
              sx={{
                height: 10,
                bgcolor: '#fff',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#95A4FC',
                },
              }}
            />
          </div>
        </div>
        <div className="w-67 mb-2 flex items-center">
          <Typography
            variant="body1"
            className="mr-[60px] font-poppins text-[14px] w-10 "
            style={{
              fontWeight: 500,
            }}
          >
            Edit
          </Typography>
          <div className="flex-grow">
            <LinearProgress
              variant="determinate"
              value={75}
              sx={{
                height: 10,
                bgcolor: '#fff',
                '& .MuiLinearProgress-bar': {
                  bgcolor: '#95A4FC',
                },
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProgresBar;
