import React from 'react';
import viewManager from './ViewManager';

/**
 * ViewRegistry - A convenient API for registering custom views
 * Provides helper methods and common patterns for view registration
 */
class ViewRegistry {
  /**
   * Register a custom view that completely replaces the default view
   * @param {string} tableName - The table name identifier
   * @param {React.Component} ViewComponent - The custom view component
   * @param {Object} options - Additional options
   */
  static registerCustomView(tableName, ViewComponent, options = {}) {
    if (!tableName || typeof tableName !== 'string') {
      throw new Error('tableName must be a non-empty string');
    }
    if (!ViewComponent) {
      throw new Error('ViewComponent is required');
    }
    return viewManager.registerView(tableName, ViewComponent, {
      replaceDefault: true,
      ...options,
    });
  }

  /**
   * Register a view wrapper that enhances the default view
   * @param {string} tableName - The table name identifier
   * @param {React.Component} WrapperComponent - The wrapper component
   * @param {Object} options - Additional options
   */
  static registerViewWrapper(tableName, WrapperComponent, options = {}) {
    return viewManager.registerView(tableName, WrapperComponent, {
      replaceDefault: false,
      ...options,
    });
  }

  /**
   * Register configuration overrides for a table
   * @param {string} tableName - The table name identifier
   * @param {Object|Function} configOverride - Configuration object or function
   */
  static registerConfig(tableName, configOverride) {
    return viewManager.registerConfig(tableName, configOverride);
  }

  /**
   * Register lifecycle hooks for a table
   * @param {string} tableName - The table name identifier
   * @param {Object} hooks - Object containing hook functions
   */
  static registerHooks(tableName, hooks) {
    return viewManager.registerHooks(tableName, hooks);
  }

  /**
   * Register a custom grid configuration
   * @param {string} tableName - The table name identifier
   * @param {Object} gridConfig - Grid configuration overrides
   */
  static registerGridConfig(tableName, gridConfig) {
    return viewManager.registerConfig(tableName, (baseConfig) => ({
      ...baseConfig,
      gridColumns: gridConfig.columns || baseConfig.gridColumns,
      gridOptions: {
        ...baseConfig.gridOptions,
        ...gridConfig.options,
      },
    }));
  }

  /**
   * Register custom form configuration
   * @param {string} tableName - The table name identifier
   * @param {Object} formConfig - Form configuration overrides
   */
  static registerFormConfig(tableName, formConfig) {
    return viewManager.registerConfig(tableName, (baseConfig) => ({
      ...baseConfig,
      formFields: formConfig.fields || baseConfig.formFields,
      formOptions: {
        ...baseConfig.formOptions,
        ...formConfig.options,
      },
    }));
  }

  /**
   * Register custom actions for a table
   * @param {string} tableName - The table name identifier
   * @param {Object} actions - Custom action definitions
   */
  static registerActions(tableName, actions) {
    return viewManager.registerConfig(tableName, (baseConfig) => ({
      ...baseConfig,
      customActions: {
        ...baseConfig.customActions,
        ...actions,
      },
    }));
  }

  /**
   * Register entity customizations directly with ViewManager
   * This is the preferred way to register customizations instead of using window globals
   *
   * @param {string} key - The table name or entity identifier
   * @param {Object} customizations - The customizations object
   *
   * @example
   * // Instead of using window.ViewManagerRegistry (unreliable):
   * // window.ViewManagerRegistry['10715'] = myComponent;
   *
   * // Use this reliable method:
   * ViewRegistry.registerEntityCustomizations('10715', myComponent);
   *
   * // Your component should have a getCustomizations method:
   * class MyComponent {
   *   getCustomizations() {
   *     return {
   *       tableName: '10715',
   *       customToolbar: this.getCustomToolbar(),
   *       filterHandlers: this.getFilterHandlers()
   *     };
   *   }
   * }
   */
  static registerEntityCustomizations(key, customizations) {
    return viewManager.registerEntityCustomizations(key, customizations);
  }

  /**
   * Create a higher-order component for custom views
   * @param {React.Component} WrappedComponent - The component to wrap
   * @returns {Function} HOC function
   */
  static withCustomView(WrappedComponent) {
    return (props) => {
      const { tableName, baseRender, renderBase, baseViewInstance, ...otherProps } = props;

      return React.createElement(WrappedComponent, {
        ...otherProps,
        tableName: tableName,
        baseViewInstance: baseViewInstance,
        renderDefault: renderBase,
        defaultView: baseRender,
      });
    };
  }

  /**
   * Register a view that extends the default with additional content
   * @param {string} tableName - The table name identifier
   * @param {Function} renderExtensions - Function that returns additional content
   * @param {Object} options - Additional options
   */
  static registerExtendedView(tableName, renderExtensions, options = {}) {
    const ExtendedView = ViewRegistry.withCustomView((props) => {
      const { renderDefault, ...otherProps } = props;

      return React.createElement(
        'div',
        { className: 'extended-view' },
        [
          options.beforeDefault && renderExtensions('before', otherProps),
          renderDefault && renderDefault(),
          options.afterDefault && renderExtensions('after', otherProps),
          !options.beforeDefault &&
            !options.afterDefault &&
            renderExtensions('replace', otherProps),
        ].filter(Boolean),
      );
    });

    return viewManager.registerView(tableName, ExtendedView, {
      replaceDefault: false,
      ...options,
    });
  }

  /**
   * Register a view with custom toolbar
   * @param {string} tableName - The table name identifier
   * @param {React.Component} ToolbarComponent - Custom toolbar component
   * @param {Object} options - Additional options
   */
  static registerViewWithToolbar(tableName, ToolbarComponent, options = {}) {
    const ViewWithToolbar = ViewRegistry.withCustomView((props) => {
      const { renderDefault, baseViewInstance, ...otherProps } = props;

      return React.createElement(
        'div',
        { className: 'view-with-custom-toolbar' },
        [
          React.createElement(ToolbarComponent, {
            ...otherProps,
            baseViewInstance: baseViewInstance,
          }),
          renderDefault && renderDefault(),
        ].filter(Boolean),
      );
    });

    return viewManager.registerView(tableName, ViewWithToolbar, {
      replaceDefault: false,
      ...options,
    });
  }

  /**
   * Register global middleware that applies to all views
   * @param {Object} middleware - Middleware functions
   */
  static registerGlobalMiddleware(middleware) {
    return viewManager.registerGlobalHooks(middleware);
  }

  /**
   * Get information about registered views
   * @returns {Object} Registry information
   */
  static getRegistryInfo() {
    return {
      registeredViews: viewManager.getRegisteredViews(),
      totalViews: viewManager.getRegisteredViews().length,
    };
  }

  /**
   * Remove a registered view
   * @param {string} tableName - The table name identifier
   */
  static unregister(tableName) {
    return viewManager.unregisterView(tableName);
  }

  /**
   * Clear all registrations
   */
  static clear() {
    return viewManager.clear();
  }
}

export default ViewRegistry;
