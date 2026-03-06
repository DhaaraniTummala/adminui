import { Card, CardBody, Typography } from '@material-tailwind/react';
import PropTypes from 'prop-types';

export function ProjectCard({ title, discription, onClick }) {
  return (
    // <Card className="rounded-md border-1 border-[#95A4FC] " onClick={onClick}>
    //   <CardBody className="p-4 text-right ">
    //     <Typography
    //       variant="small"
    //       className=" font-poppins text-black text-lg text-left "
    //       style={{ fontWeight: '600' }}
    //     >
    //       {title}
    //     </Typography>
    //     <Typography
    //       variant="small"
    //       color="blue-gray"
    //       className="mt-2 text-blue-gray-400 tracking-[.5px] font-poppins text-left"
    //     >
    //       {discription}
    //     </Typography>
    //   </CardBody>
    // </Card>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Card
        className="rounded-md border border-[#95A4FC] w-full max-w-[400px] mx-auto"
        onClick={onClick}
      >
        <CardBody className="p-4">
          <Typography
            variant="body1"
            className="font-poppins text-black text-lg font-semibold text-left"
          >
            {title}
          </Typography>
          <Typography
            variant="body2"
            color="#1C1C1C66"
            className="mt-2 text-blue-gray-400 tracking-wide font-poppins text-left"
            style={{ fontSize: '14px', lineHeight: '1.3' }}
          >
            {discription}
          </Typography>
        </CardBody>
      </Card>
    </div>
  );
}

ProjectCard.defaultProps = {
  color: 'blue',
  footer: null,
};

ProjectCard.propTypes = {
  color: PropTypes.oneOf([
    'white',
    'blue-gray',
    'gray',
    'brown',
    'deep-orange',
    'orange',
    'amber',
    'yellow',
    'lime',
    'light-green',
    'green',
    'teal',
    'cyan',
    'light-blue',
    'blue',
    'indigo',
    'deep-purple',
    'purple',
    'pink',
    'red',
  ]),
  icon: PropTypes.node.isRequired,
  title: PropTypes.node.isRequired,
  value: PropTypes.node.isRequired,
  footer: PropTypes.node,
};

ProjectCard.displayName = '/src/widgets/cards/ProjectCard.jsx';

export default ProjectCard;
