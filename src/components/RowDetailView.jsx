import React, { useEffect, useState, Suspense } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Typography } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

const AssetDetails = React.lazy(() => import('./AssetDetails/AssetDetails'));
const UserDetails = React.lazy(() => import('./AssetDetails/UserDetails'));
const WorkOrderDetails = React.lazy(() => import('./AssetDetails/WorkOrderDetails'));
const CheckListDetails = React.lazy(() => import('./AssetDetails/CheckListDetails'));

// Entity type to component mapping
const ENTITY_COMPONENTS = {
  10738: AssetDetails, // Asset
  10689: UserDetails, // User
  10818: WorkOrderDetails, // Work Order
  10821: CheckListDetails, // CheckList
};

const RowDetailView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [recordId, setRecordId] = useState(null);

  // Extract ID from URL query string
  useEffect(() => {
    const id = searchParams.get('Id');
    if (id) {
      setRecordId(id);
    }
  }, [searchParams]);

  // Get entity type from URL path and mode
  const pathParts = window.location.hash.split('/');
  const entityPath = pathParts[pathParts.length - 1].split('?')[0];
  const mode = searchParams.get('mode');

  // Map URL paths to entity types and names
  const ENTITY_PATH_MAP = {
    Asset: { table: '10738', entity: 'Asset' },
    User: { table: '10689', entity: 'User' },
    WorkOrder: { table: '10818', entity: 'WorkOrder' },
    CheckList: { table: '10821', entity: 'CheckList' },
  };

  const entityConfig = ENTITY_PATH_MAP[entityPath] || { table: '10738', entity: 'Asset' };
  const DetailComponent = ENTITY_COMPONENTS[entityConfig.table];

  const handleBack = () => {
    navigate(-1);
  };

  // Only show detail view if in viewDetail mode
  if (mode !== 'viewDetail') {
    return null;
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DetailComponent
        recordId={recordId}
        mode={mode}
        onBack={handleBack}
        tableId={entityConfig.table}
        entityName={entityConfig.entity}
      />
    </Suspense>
  );
};

export default RowDetailView;
