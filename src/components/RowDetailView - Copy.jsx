import React, { useEffect, useState, Suspense, lazy } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Box, Button, Typography, CircularProgress } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';

// Lazy load components to avoid circular dependencies
const AssetDetails = lazy(() => import('./AssetDetails/AssetDetails'));

// Entity type to component mapping with lazy loading
const ENTITY_COMPONENTS = {
  10738: AssetDetails, // Asset
};

const RowDetailView = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [recordId, setRecordId] = useState(null);
  const [entityType, setEntityType] = useState(null);
  const [EntityComponent, setEntityComponent] = useState(null);
  const [loading, setLoading] = useState(true);

  // Extract ID from URL query string
  useEffect(() => {
    const id = searchParams.get('Id');
    if (id) {
      setRecordId(id);
    }
  }, [searchParams]);

  useEffect(() => {
    // Get entity type from URL path and mode
    const pathParts = window.location.hash.split('/');
    const entityPath = pathParts[pathParts.length - 1].split('?')[0];
    const mode = searchParams.get('mode');

    // Map URL paths to entity types and names
    const ENTITY_PATH_MAP = {
      Asset: { table: '10738', entity: 'Asset' },
    };

    const entityConfig = ENTITY_PATH_MAP[entityPath] || { table: '10738', entity: 'Asset' };
    setEntityType(entityConfig);

    // Only set the component if in viewDetail mode
    if (mode === 'viewDetail') {
      const DetailComponent = ENTITY_COMPONENTS[entityConfig.table];
      setEntityComponent(() => DetailComponent);
    }

    setLoading(false);
  }, [searchParams]);

  const handleBack = () => {
    navigate(-1);
  };

  // Only show detail view if in viewDetail mode
  if (searchParams.get('mode') !== 'viewDetail' || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  if (!EntityComponent) {
    return (
      <Box p={3}>
        <Typography variant="h6" color="error">
          Error: Could not load the requested component
        </Typography>
      </Box>
    );
  }

  return (
    <Suspense
      fallback={
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
          <CircularProgress />
        </Box>
      }
    >
      <EntityComponent recordId={recordId} mode="viewDetail" onBack={handleBack} />
    </Suspense>
  );
};

export default RowDetailView;
