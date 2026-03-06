import React from 'react';
import { getComponentName, loadCustomizationModule } from './entityMap';

/**
 * ViewManager - A centralized system for managing dynamic views
 * Allows registration of custom view components and configurations
 * without requiring inheritance from DynamicBaseView (removed)
 */
class ViewManager {
  constructor() {
    this.registeredViews = new Map();
    this.viewConfigs = new Map();
    this.renderHooks = new Map();
    this.globalHooks = [];

    // Entity customization capabilities (merged from EntityCustomizationManager)
    this.entityCustomizations = new Map();
    this.buttonComponents = new Map();
    this.filterHandlers = new Map();
    this.dataTransformers = new Map();
    this.toolbarConfigs = new Map();
    // Feature flag: enable legacy overrides (dynamic import). Keep off for prod builds.
    this.enableLegacyOverrides = false;
  }

  /**
   * Register a custom view component for a specific table name
   * @param {string} tableName - The table name identifier
   * @param {React.Component} ViewComponent - The custom view component
   * @param {Object} options - Additional options for the view
   */
  registerView(tableName, ViewComponent, options = {}) {
    this.registeredViews.set(tableName, {
      component: ViewComponent,
      options: {
        priority: 0,
        replaceDefault: false,
        ...options,
      },
    });

    console.log(`ViewManager: Registered custom view for table '${tableName}'`);
    return this;
  }

  /**
   * Register configuration overrides for a specific table name
   * @param {string} tableName - The table name identifier
   * @param {Object|Function} configOverride - Configuration object or function
   */
  registerConfig(tableName, configOverride) {
    this.viewConfigs.set(tableName, configOverride);
    console.log(`ViewManager: Registered config override for table '${tableName}'`);
    return this;
  }

  /**
   * Register render hooks for specific lifecycle events
   * @param {string} tableName - The table name identifier
   * @param {Object} hooks - Object containing hook functions
   */
  registerHooks(tableName, hooks) {
    this.renderHooks.set(tableName, {
      ...this.renderHooks.get(tableName),
      ...hooks,
    });
    console.log(`ViewManager: Registered hooks for table '${tableName}'`);
    return this;
  }

  /**
   * Register global hooks that apply to all views
   * @param {Object} hooks - Object containing global hook functions
   */
  registerGlobalHooks(hooks) {
    this.globalHooks.push(hooks);
    console.log('ViewManager: Registered global hooks');
    return this;
  }

  /**
   * Get the appropriate view component for a table name
   * @param {string} tableName - The table name identifier
   * @returns {React.Component|null} The custom view component or null
   */
  getViewComponent(tableName) {
    const viewInfo = this.registeredViews.get(tableName);
    return viewInfo ? viewInfo.component : null;
  }

  /**
   * Get view options for a table name
   * @param {string} tableName - The table name identifier
   * @returns {Object} The view options
   */
  getViewOptions(tableName) {
    const viewInfo = this.registeredViews.get(tableName);
    return viewInfo ? viewInfo.options : {};
  }

  /**
   * Check if a custom view is registered for a table name
   * @param {string} tableName - The table name identifier
   * @returns {boolean} True if a custom view is registered
   */
  hasCustomView(tableName) {
    return this.registeredViews.has(tableName);
  }

  /**
   * Execute hooks for a specific event and table name
   * @param {string} event - The event name (e.g., 'beforeRender', 'afterRender')
   * @param {string} tableName - The table name identifier
   * @param {Object} context - The context object to pass to hooks
   * @returns {Object} The modified context
   */
  executeHooks(event, tableName, context = {}) {
    let modifiedContext = { ...context };

    // Execute global hooks first
    this.globalHooks.forEach((hooks) => {
      if (hooks[event] && typeof hooks[event] === 'function') {
        try {
          modifiedContext = hooks[event](modifiedContext, tableName) || modifiedContext;
        } catch (error) {
          console.error(`Error executing global hook '${event}' for table '${tableName}':`, error);
        }
      }
    });

    // Execute table-specific hooks
    const tableHooks = this.renderHooks.get(tableName);
    if (tableHooks && tableHooks[event] && typeof tableHooks[event] === 'function') {
      try {
        modifiedContext = tableHooks[event](modifiedContext) || modifiedContext;
      } catch (error) {
        console.error(`Error executing table hook '${event}' for table '${tableName}':`, error);
      }
    }

    return modifiedContext;
  }

  /**
   * Get all registered view names
   * @returns {Array<string>} Array of registered table names
   */
  getRegisteredViews() {
    return Array.from(this.registeredViews.keys());
  }

  /**
   * Remove a registered view
   * @param {string} tableName - The table name identifier
   */
  unregisterView(tableName) {
    this.registeredViews.delete(tableName);
    this.viewConfigs.delete(tableName);
    this.renderHooks.delete(tableName);
    console.log(`ViewManager: Unregistered view for table '${tableName}'`);
    return this;
  }

  /**
   * Clear all registered views and configurations
   */
  clear() {
    this.registeredViews.clear();
    this.viewConfigs.clear();
    this.renderHooks.clear();
    this.globalHooks = [];

    // Clear entity customizations
    this.entityCustomizations.clear();
    this.buttonComponents.clear();
    this.filterHandlers.clear();
    this.dataTransformers.clear();
    this.toolbarConfigs.clear();

    console.log('ViewManager: Cleared all registrations and customizations');
    return this;
  }

  // ==================== ENTITY CUSTOMIZATION METHODS ====================
  // Merged from EntityCustomizationManager to provide unified view management

  /**
   * Initialize entity customizations for BaseView
   */
  async initializeEntityCustomizations(baseView, config) {
    const tableName = config?.tableName || config?.entity?.tableName;
    if (!tableName) {
      console.warn('ViewManager: No tableName found in config for entity customizations');
      return;
    }

    try {
      const customizations = await this.loadEntityCustomizations(tableName);

      if (customizations) {
        // Register any custom button components
        if (customizations.buttonComponents) {
          Object.entries(customizations.buttonComponents).forEach(([key, component]) => {
            this.registerButtonComponent(key, component);
          });
        }

        // Register custom filter handlers
        if (customizations.filterHandlers) {
          Object.entries(customizations.filterHandlers).forEach(([key, handler]) => {
            this.registerFilterHandler(key, handler);
          });
        }

        // Register data transformers
        if (customizations.dataTransformers) {
          Object.entries(customizations.dataTransformers).forEach(([key, transformer]) => {
            this.registerDataTransformer(key, transformer);
          });
        }

        console.log(`ViewManager: Successfully initialized customizations for ${tableName}`);
      } else {
        console.log(`ViewManager: No customizations found for ${tableName}`);
      }
    } catch (error) {
      console.error(`ViewManager: Failed to initialize customizations for ${tableName}:`, error);
    }
  }

  /**
   * Load entity customizations from custom components or config overrides
   */
  async loadEntityCustomizations(tableName) {
    if (this.entityCustomizations.has(tableName)) {
      const customizations = this.entityCustomizations.get(tableName);

      // If it's a component instance with getCustomizations method, call it
      if (customizations && typeof customizations.getCustomizations === 'function') {
        return customizations.getCustomizations();
      }

      return customizations;
    }

    try {
      // Try to load from custom component first (preferred modern approach)
      const customizations = await this.loadFromCustomComponent(tableName);
      if (customizations) {
        this.entityCustomizations.set(tableName, customizations);
        console.log(
          `ViewManager: Loaded entity customizations from custom component for ${tableName}`,
        );
        return customizations;
      }
    } catch (error) {
      console.debug(
        `ViewManager: No entity customizations found for ${tableName}:`,
        error?.message || error,
      );
    }

    return null;
  }

  /**
   * Dynamically load entity customizations from a custom component.
   * Accepts numeric IDs (e.g., '10715'), actual table names (e.g., 'Maiden_Task'),
   * and component aliases (e.g., 'ProjectTask').
   */
  async loadFromCustomComponent(tableName) {
    try {
      // Normalize key to string
      const key = (tableName || '').toString();

      // Resolve component via centralized map
      const componentName = getComponentName(key);
      if (!componentName) {
        console.debug('ViewManager.loadFromCustomComponent: No component mapping for', key);
        return null;
      }

      // 1) Try global registry first (in case the component already registered itself)
      const fromRegistry = this.tryLoadFromEntityCustomizations(key, componentName);
      if (fromRegistry) return fromRegistry;

      // 2) Dynamically import via centralized loader
      const mod = await loadCustomizationModule(key);
      if (!mod) return null;

      // Module can export an instance (default) with getCustomizations()
      const instance = mod?.default;
      if (instance && typeof instance.getCustomizations === 'function') {
        const customizations = instance.getCustomizations();
        return customizations || null;
      }

      // Or the imported module might have registered itself to the global registry
      const afterImport = this.tryLoadFromEntityCustomizations(key, componentName);
      return afterImport || null;
    } catch (err) {
      console.debug(
        'ViewManager.loadFromCustomComponent: failed for',
        tableName,
        err?.message || err,
      );
      return null;
    }
  }

  /**
   * Load customizations synchronously from already imported components
   * This is used when getAvailableButtons needs customizations immediately
   */
  loadCustomizationsSync(tableName) {
    try {
      // First, check if we already have customizations registered for this table
      const existingCustomizations = this.entityCustomizations.get(tableName);
      if (existingCustomizations) {
        // If it's a component instance with getCustomizations method, call it
        if (
          existingCustomizations &&
          typeof existingCustomizations.getCustomizations === 'function'
        ) {
          return existingCustomizations.getCustomizations();
        }

        // If it's already the customizations object, return it directly
        if (existingCustomizations && existingCustomizations.customToolbar) {
          return existingCustomizations;
        }

        return existingCustomizations;
      }

      // Resolve component via centralized map
      const componentName = getComponentName(tableName);
      if (!componentName) {
        return null;
      }

      // Try to get customizations from our registered entity customizations
      return this.tryLoadFromEntityCustomizations(tableName, componentName);
    } catch (error) {
      console.debug(
        `ViewManager: Failed to load customizations synchronously for ${tableName}:`,
        error.message,
      );
      return null;
    }
  }

  /**
   * Try to load customizations from the registered entity customizations
   * This is the primary and reliable way to get customizations
   */
  tryLoadFromEntityCustomizations(tableName, componentName) {
    // First try to get customizations from our registered entity customizations
    const customizations = this.entityCustomizations.get(tableName);
    if (customizations) {
      // If it's a component instance with getCustomizations method, call it
      if (customizations && typeof customizations.getCustomizations === 'function') {
        return customizations.getCustomizations();
      }

      return customizations;
    }

    // Try with component name as fallback
    const componentCustomizations = this.entityCustomizations.get(componentName);
    if (componentCustomizations) {
      // If it's a component instance with getCustomizations method, call it
      if (
        componentCustomizations &&
        typeof componentCustomizations.getCustomizations === 'function'
      ) {
        return componentCustomizations.getCustomizations();
      }

      return componentCustomizations;
    }

    return null;
  }

  /**
   * Register a button component
   */
  registerButtonComponent(key, componentConfig) {
    this.buttonComponents.set(key, componentConfig);
    console.log(`ViewManager: Registered button component '${key}'`);
    return this;
  }

  /**
   * Register a filter handler
   */
  registerFilterHandler(key, handler) {
    this.filterHandlers.set(key, handler);
    console.log(`ViewManager: Registered filter handler '${key}'`);
    return this;
  }

  /**
   * Register a data transformer
   */
  registerDataTransformer(key, transformer) {
    this.dataTransformers.set(key, transformer);
    console.log(`ViewManager: Registered data transformer '${key}'`);
    return this;
  }

  /**
   * Register a toolbar configuration
   */
  registerToolbarConfig(key, config) {
    this.toolbarConfigs.set(key, config);
    console.log(`ViewManager: Registered toolbar config '${key}'`);
    return this;
  }

  /**
   * Register entity customizations directly
   * This is the preferred way to register customizations instead of using window globals
   * @param {string} key - The table name or entity identifier
   * @param {Object} customizations - The customizations object
   */
  registerEntityCustomizations(key, customizations) {
    if (!key || typeof key !== 'string') {
      throw new Error('key must be a non-empty string');
    }
    if (!customizations || typeof customizations !== 'object') {
      throw new Error('customizations must be a non-null object');
    }

    this.entityCustomizations.set(key, customizations);
    console.log(`ViewManager: Registered entity customizations for '${key}'`);
    return this;
  }

  /**
   * Get button component by key
   */
  getButtonComponent(key) {
    return this.buttonComponents.get(key);
  }

  /**
   * Get filter handler by key
   */
  getFilterHandler(key) {
    return this.filterHandlers.get(key);
  }

  /**
   * Get data transformer by key
   */
  getDataTransformer(key) {
    return this.dataTransformers.get(key);
  }

  /**
   * Get toolbar configuration by key
   */
  getToolbarConfig(key) {
    return this.toolbarConfigs.get(key);
  }

  /**
   * Check if entity has custom toolbar
   */
  hasCustomToolbar(tableName) {
    const customizations = this.entityCustomizations.get(tableName);
    return customizations && (customizations.customToolbar || customizations.toolbarConfig);
  }

  /**
   * Get available buttons for entity (merged with default common buttons)
   */
  getAvailableButtons(tableName) {
    // Check if customizations are already loaded
    let customizations = this.entityCustomizations.get(tableName);

    // If not loaded, try to load them synchronously from imported components
    if (!customizations) {
      customizations = this.loadCustomizationsSync(tableName);
    }

    if (customizations && customizations.customToolbar) {
      // Get custom buttons from entity
      const customButtons =
        customizations.customToolbar.customButtons || customizations.customToolbar.buttons || [];
      const commonButtonOptions = customizations.customToolbar.commonButtonOptions || {};

      return {
        customButtons,
        commonButtonOptions,
        needsMerging: true,
      };
    }

    // Return default common buttons only
    return {
      customButtons: [],
      commonButtonOptions: {},
      needsMerging: true,
    };
  }

  /**
   * Get toolbar layout configuration
   */
  getToolbarLayout(tableName) {
    const customizations = this.entityCustomizations.get(tableName);
    if (customizations) {
      // Check new component format first
      if (customizations.customToolbar && customizations.customToolbar.layout) {
        return customizations.customToolbar.layout;
      }
      // Check legacy format
      if (customizations.toolbarConfig && customizations.toolbarConfig.layout) {
        return customizations.toolbarConfig.layout;
      }
    }
    return {
      position: 'top',
      alignment: 'space-between',
      spacing: 8,
      padding: '8px 16px',
    };
  }

  /**
   * Setup entity-specific button components
   */
  setupEntityButtonComponents(config) {
    const tableName = config?.tableName || config?.entity?.tableName;
    const customization = this.entityCustomizations.get(tableName);

    if (!customization?.customToolbar?.buttons) return;

    // Register each button component from the entity customization
    customization.customToolbar.buttons.forEach((button) => {
      if (button.key && button.component) {
        this.registerButtonComponent(button.key, {
          component: button.component,
          position: button.position,
          order: button.order,
          tooltip: button.tooltip,
          style: button.style,
        });
      }
    });
  }

  /**
   * Setup entity-specific toolbar configuration
   */
  setupEntityToolbarConfig(baseView, config) {
    const tableName = config?.tableName || config?.entity?.tableName;
    const customization = this.entityCustomizations.get(tableName);

    if (!customization?.customToolbar) return;

    // Register toolbar configuration with ToolbarManager
    const toolbarKey = this.generateToolbarKey(config);
    if (baseView.toolbarManager) {
      baseView.toolbarManager.registerToolbar(toolbarKey, customization.customToolbar);
    }
  }

  /**
   * Generate toolbar key from configuration
   */
  generateToolbarKey(config) {
    const moduleName = config.moduleName || 'default';
    const entity = config.entity?.name || config.entityName || 'default';
    return `${moduleName}_${entity}`;
  }

  /**
   * Generate entity key from configuration
   */
  getEntityKey(config) {
    return config.tableName || config.entity?.tableName || 'unknown';
  }

  /**
   * Execute entity-specific filter
   */
  executeFilter(key, baseView, ...args) {
    const handler = this.filterHandlers.get(key);
    if (handler) {
      return handler(baseView, ...args);
    } else {
      console.warn(`ViewManager: Filter handler '${key}' not found`);
    }
  }

  /**
   * Apply data transformation
   */
  applyTransformation(key, data, operation, baseView) {
    const transformer = this.dataTransformers.get(key);
    if (transformer) {
      return transformer(data, operation, baseView);
    }
    return data;
  }

  /**
   * Create a higher-order component that wraps a view with ViewManager capabilities
   * @param {React.Component} WrappedComponent - The component to wrap
   * @param {string} tableName - The table name identifier
   * @returns {React.Component} The wrapped component
   */
  withViewManager(WrappedComponent, tableName) {
    const viewManager = this;

    return React.forwardRef((props, ref) => {
      // Execute beforeRender hooks
      const context = viewManager.executeHooks('beforeRender', tableName, {
        props,
        tableName,
        viewManager,
      });

      // Apply configuration overrides
      const enhancedProps = {
        ...props,
        ...context.props,
        viewManager,
        tableName,
      };

      // Execute afterRender hooks in useEffect equivalent
      React.useEffect(() => {
        viewManager.executeHooks('afterMount', tableName, {
          props: enhancedProps,
          tableName,
          viewManager,
        });

        return () => {
          viewManager.executeHooks('beforeUnmount', tableName, {
            props: enhancedProps,
            tableName,
            viewManager,
          });
        };
      }, []);

      return React.createElement(WrappedComponent, { ...enhancedProps, ref });
    });
  }
}

// Create a singleton instance
const viewManager = new ViewManager();

export default viewManager;
export { ViewManager };
