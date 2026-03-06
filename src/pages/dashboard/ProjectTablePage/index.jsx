import React from 'react';
import Layout from '../../../components/Layout';

import { ProjectCard } from '../../../widgets/cards';
import { IconButton, Typography } from '@material-tailwind/react';
import { GrAdd } from 'react-icons/gr';
import OrganizatiopnCardsData from '../../../data/OrganizatiopnCardsData';
import SearchInput from '../../../common/SearchInput';
import AddModuleModal from '../../../components/Modals/AddModuleModal';

import AddOrganizationModal from '../../../components/Modals/AddOrganizationModal';
import EditIcon from './../../../assets/editicon.svg';
import StatusIcon from '../../../assets/StatusIcon';
import TableAgGrid from '../../../common/AgTable';
const ProjectTablePage = () => {
  return (
    <div>
      <div className="flex justify-between mt-4">
        <Typography className="text-xl text-black font-bold">Project 01</Typography>
        <AddOrganizationModal />
      </div>
      <div className="overflow-x-auto mt-5">
        <TableAgGrid />
      </div>
    </div>
  );
};

export default Layout(ProjectTablePage);
