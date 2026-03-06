/**
 * View Registrations - Central place to register all custom views
 * Import this file to automatically register all custom views with the ViewManager
 */

import React from 'react';

// Import custom views
import ProjectView from './ProjectView.jsx';
import ViewRegistry from '../../core/ViewRegistry';

// Import custom components to ensure they register their customizations
import './ProjectTask.jsx';
import './Asset.jsx';
import './NoFeverActivity.jsx';
import './AssetCompliant.jsx';
import './AssetBreakDown.jsx';
import './WorkOrder.jsx';
import './UserManagement.jsx';
import './CheckList.jsx';
import './VehicleTracking.jsx';
import './VisitorTracking.jsx';

// Register configuration overrides for specific tables
ViewRegistry.registerConfig('10715', (baseConfig) => ({
  ...baseConfig,
  // Add custom configuration for Tasks table
  customToolbar: true,
  allowKanbanView: true,
  defaultView: 'kanban',
}));

// Register hooks for work tracking
ViewRegistry.registerHooks('10715', {
  beforeRender: (context) => {
    console.log('Rendering Tasks view with custom enhancements');
    return context;
  },
  afterMount: (context) => {
    console.log('Tasks view mounted successfully');
    return context;
  },
});

// Register global hooks that apply to all views
ViewRegistry.registerGlobalMiddleware({
  beforeConstruct: (context, tableName) => {
    console.log(`Constructing view for table: ${tableName}`);
    return context;
  },
  afterMount: (context, tableName) => {
    // Add analytics tracking for all views
    if (window.analytics) {
      window.analytics.track('View Loaded', {
        tableName,
        timestamp: new Date().toISOString(),
      });
    }
    return context;
  },
});

// Example: Register a custom grid configuration
ViewRegistry.registerGridConfig('Users', {
  columns: [
    // Add custom column configurations
    {
      dataIndex: 'avatar',
      title: 'Avatar',
      type: 'image',
      width: 80,
    },
  ],
  options: {
    rowSelection: {
      type: 'checkbox',
    },
    pagination: {
      pageSize: 20,
    },
  },
});

// Example: Register custom actions
ViewRegistry.registerActions('10719', {
  exportToExcel: {
    label: 'Export to Excel',
    icon: 'ExportOutlined',
    handler: (selectedRows, viewInstance) => {
      console.log('Exporting projects to Excel', selectedRows);
      // Custom export logic here
    },
  },
  bulkStatusUpdate: {
    label: 'Update Status',
    icon: 'EditOutlined',
    handler: (selectedRows, viewInstance) => {
      console.log('Bulk updating project status', selectedRows);
      // Custom bulk update logic here
    },
  },
});

// Example: Register an extended view with additional content
// Note: This is commented out to avoid JSX syntax issues in .js files
// ViewRegistry.registerExtendedView('Users', (position, props) => {
//   if (position === 'before') {
//     return React.createElement('div', {
//       className: 'user-stats mb-4 p-4 bg-blue-50 rounded-lg'
//     }, [
//       React.createElement('h3', {}, 'User Statistics'),
//       React.createElement('p', {}, `Total Users: ${props.totalCount || 'Loading...'}`)
//     ]);
//   }
//   return null;
// }, {
//   beforeDefault: true
// });

console.log('Custom views registered successfully');

export { ProjectView };
