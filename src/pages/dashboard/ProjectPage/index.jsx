import React from 'react';
import Layout from '../../../components/Layout';
import ProjectCardsData from '../../../data/ProjectCardsData';
import { ProjectCard } from '../../../widgets/cards';
import { Button, Typography } from '@material-tailwind/react';
import { GrAdd } from 'react-icons/gr';
import { useNavigate } from 'react-router-dom';
import { withTranslation } from 'react-i18next';

const OrganizationPage = (props) => {
  const { t } = props;
  const navigate = useNavigate();
  return (
    <div>
      <div className="flex justify-between mt-4">
        <Typography className="text-xl text-black font-poppins font-bold">
          {t('Projects')}
        </Typography>
        <Button className="flex gap-2 items-center font-poppins bg-[#056EE9] capitalize">
          <GrAdd />
          {t('Create Project')}
        </Button>
      </div>

      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4 mt-6">
        {ProjectCardsData.map(({ icon, title, footer, ...rest }) => (
          <ProjectCard
            onClick={() => {
              navigate('/projectTable');
            }}
            key={title}
            {...rest}
            title={title}
          />
        ))}
      </div>
    </div>
  );
};

export default withTranslation()(Layout(OrganizationPage));
