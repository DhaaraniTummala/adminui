# ViewManager System Documentation

The ViewManager system provides a flexible way to dynamically register and customize views without having to extend the `DynamicBaseView` class (which has been removed). This allows for better separation of concerns and easier maintenance.

## Architecture Overview

### Core Components

1. **ViewManager** - Central manager for view registrations and configurations
2. **EnhancedDynamicBaseView** - Enhanced version that integrates with ViewManager and includes dynamic configuration generation
3. **ViewRegistry** - Convenient API for registering custom views and configurations

### Key Features

- **Dynamic View Registration** - Register custom views for specific table names
- **Configuration Overrides** - Apply custom configurations without modifying core files
- **Lifecycle Hooks** - Execute custom logic at various points in the view lifecycle
- **View Wrapping** - Enhance existing views with additional functionality
- **Complete Replacement** - Replace default views entirely with custom implementations

## Usage Examples

### 1. Registering a Custom View (Complete Replacement)

```javascript
import ViewRegistry from '../core/ViewRegistry';
import MyCustomView from './MyCustomView';

// Replace the default view entirely
ViewRegistry.registerCustomView('Tasks', MyCustomView, {
  priority: 10,
  description: 'Custom Kanban view for work tracking'
});
```

### 2. Registering a View Wrapper (Enhancement)

```javascript
import ViewRegistry from '../core/ViewRegistry';

const ProjectWrapper = ({ renderDefault, tableName, ...props }) => (
  <div>
    <div className="custom-header">Project Dashboard</div>
    {renderDefault && renderDefault()}
    <div className="custom-footer">Additional project info</div>
  </div>
);

// Enhance the default view with additional content
ViewRegistry.registerViewWrapper('Projects', ProjectWrapper);
```

### 3. Configuration Overrides

```javascript
// Override configuration for a specific table
ViewRegistry.registerConfig('Users', (baseConfig) => ({
  ...baseConfig,
  customToolbar: true,
  gridOptions: {
    ...baseConfig.gridOptions,
    pagination: { pageSize: 50 }
  }
}));

// Or use a simple object
ViewRegistry.registerConfig('Users', {
  allowExport: true,
  showAdvancedFilters: true
});
```

### 4. Lifecycle Hooks

```javascript
ViewRegistry.registerHooks('Tasks', {
  beforeRender: (context) => {
    console.log('About to render Tasks view');
    return context;
  },
  afterMount: (context) => {
    console.log('Tasks view mounted');
    // Add custom initialization logic
    return context;
  },
  beforeUnmount: (context) => {
    console.log('Tasks view unmounting');
    // Cleanup logic
    return context;
  }
});
```

### 5. Global Hooks (Apply to All Views)

```javascript
ViewRegistry.registerGlobalMiddleware({
  afterMount: (context, tableName) => {
    // Analytics tracking for all views
    if (window.analytics) {
      window.analytics.track('View Loaded', { tableName });
    }
    return context;
  }
});
```

### 6. Custom Grid Configuration

```javascript
ViewRegistry.registerGridConfig('Products', {
  columns: [
    {
      dataIndex: 'thumbnail',
      title: 'Image',
      type: 'image',
      width: 100
    }
  ],
  options: {
    rowSelection: { type: 'checkbox' },
    pagination: { pageSize: 25 }
  }
});
```

### 7. Custom Actions

```javascript
ViewRegistry.registerActions('Orders', {
  exportToExcel: {
    label: 'Export to Excel',
    icon: 'ExportOutlined',
    handler: (selectedRows, viewInstance) => {
      // Custom export logic
      console.log('Exporting orders', selectedRows);
    }
  }
});
```

## Custom View Component Structure

When creating a custom view component, you'll receive these props:

```javascript
const MyCustomView = (props) => {
  const {
    tableName,        // The table name identifier
    config,           // The merged configuration
    baseViewInstance, // Reference to the base view instance
    viewManager,      // Reference to the ViewManager
    renderDefault,    // Function to render the default view (for wrappers)
    ...otherProps     // All other props passed to the view
  } = props;

  return (
    <div>
      {/* Your custom view implementation */}
    </div>
  );
};
```

## Integration with Existing Code

The system is designed to be forward-looking. The old `DynamicBaseView` has been removed, and all functionality has been consolidated into `EnhancedDynamicBaseView` with ViewManager integration.

### Migration Steps

1. Use `EnhancedDynamicBaseView` in your routes (the old `DynamicBaseView` has been removed)
2. Import the custom view registrations: `import '../views/custom';`
3. Register your custom views using the ViewRegistry API

## File Structure

```
src/
├── core/
│   ├── ViewManager.js          # Core ViewManager class
│   ├── ViewRegistry.js         # Convenient registration API
│   └── ViewManager.README.md   # This documentation
├── components/
│   └── EnhancedDynamicBaseView.js # Enhanced version with ViewManager and dynamic config generation
└── views/
    └── custom/
        ├── index.js            # Central registration file
        ├── WorkTrackingView.js # Example custom view
        └── ProjectView.js      # Example wrapper view
```

## Best Practices

1. **Register views in a central location** - Use `views/custom/index.js` to register all custom views
2. **Use descriptive names** - Make table names and view names clear and consistent
3. **Leverage hooks for side effects** - Use lifecycle hooks for analytics, logging, etc.
4. **Keep views focused** - Each custom view should have a single responsibility
5. **Test thoroughly** - Ensure custom views work with all expected data scenarios

## Debugging

The ViewManager includes console logging for registration events. Check the browser console to see:
- View registrations
- Hook executions
- Configuration overrides

## Performance Considerations

- Custom views are only instantiated when needed
- Configuration overrides are applied once during construction
- Hooks are executed efficiently with minimal overhead
- The system maintains backward compatibility without performance impact
