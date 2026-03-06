import React from 'react';
import Layout from '../../../components/Layout';

import { ProjectCard } from '../../../widgets/cards';
import { Button, Typography } from '@material-tailwind/react';
import { GrAdd } from 'react-icons/gr';
import OrganizatiopnCardsData from '../../../data/OrganizatiopnCardsData';
import AddModuleModal from '../../../components/Modals/AddModuleModal';
import AddOrganizationModal from '../../../components/Modals/AddOrganizationModal';
import { withTranslation } from 'react-i18next';

const ProjectPage = (props) => {
  const { t } = props;
  return (
    <div>
      <div className="flex justify-between mt-4">
        <Typography className="text-xl text-black font-poppins" style={{ fontWeight: '600' }}>
          {t('Organizations')}
        </Typography>

        <AddOrganizationModal />
      </div>

      <div className="mb-12 grid gap-y-10 gap-x-6 md:grid-cols-2 xl:grid-cols-4 mt-6">
        {OrganizatiopnCardsData.map(({ icon, title, footer, ...rest }) => (
          <ProjectCard key={title} {...rest} title={title} />
        ))}
      </div>
    </div>
  );
};

export default withTranslation()(Layout(ProjectPage));
