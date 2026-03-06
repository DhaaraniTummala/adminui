import React, { PureComponent } from 'react';
import BaseView from './BaseView/BaseView';
import { defaultGridColumns } from '../core/utils';

import viewManager from '../core/ViewManager';
import secureStorage from '../utils/secureStorage';

/**
 * EnhancedDynamicBaseView - Enhanced base view that integrates with ViewManager
 * Supports dynamic view registration and customization without inheritance
 * Includes dynamic configuration generation via generateConfig()
 */
class EnhancedDynamicBaseView extends BaseView {
  constructor(props) {
    super(props);

    const tableName = props.tableName.toString();

    // Prepare extra context for child/parent/selection scenarios
    const extraContext = {
      parentRecordId: props.parentRecordId,
      isChild: props.isChild,
      selectedRowParent: props.selectedRowParent,
      parentIdColumn: props.parentIdColumn,
      ParentEntity: props.ParentEntity,
      ParentEntityField: props.ParentEntityField,
      // Add more as needed
    };

    // Execute beforeConstruct hooks with extra context
    const context = viewManager.executeHooks('beforeConstruct', tableName, {
      props,
      tableName,
      ...extraContext,
    });

    // Merge customizations from ViewRegistry (if any) BEFORE generateConfig
    let custom = {};
    if (viewManager.entityCustomizations && viewManager.entityCustomizations.has(tableName)) {
      custom = viewManager.entityCustomizations.get(tableName);
    }

    // Generate base configuration, passing custom config for merging
    let config = generateConfig(tableName, custom);
    // Attach extra context/props to config for use in BaseView and grid
    Object.entries(extraContext).forEach(([k, v]) => {
      if (typeof v !== 'undefined') config[k] = v;
    });

    // Apply any additional config from hooks
    if (context.config) {
      config = { ...config, ...context.config };
    }

    if (config.childs && config.childs().length == 1 && config.childs()[0].childs().length == 0) {
      config.childView = 'flex';
    }

    let masterConfig = {};
    let entity = null;
    let moduleName = null;

    try {
      masterConfig = JSON.parse(secureStorage.getItem('entityMapping') || '{}');
      if (masterConfig[tableName]) {
        ({ entity, moduleName } = masterConfig[tableName]);
      }
    } catch (error) {
      console.warn('Failed to parse secureStorage.entityMapping:', error);
    }

    this.config = this.constructConfig(config, viewManager, props.showCustomContent);
    this.tableName = tableName.toString();
    this.viewManager = viewManager;

    // Execute afterConstruct hooks
    viewManager.executeHooks('afterConstruct', tableName, {
      props,
      tableName,
      config: this.config,
      instance: this,
    });
  }

  componentDidMount() {
    super.componentDidMount && super.componentDidMount();

    // Execute afterMount hooks
    this.viewManager.executeHooks('afterMount', this.tableName, {
      props: this.props,
      tableName: this.tableName,
      config: this.config,
      instance: this,
    });
  }

  componentWillUnmount() {
    // Execute beforeUnmount hooks
    this.viewManager.executeHooks('beforeUnmount', this.tableName, {
      props: this.props,
      tableName: this.tableName,
      config: this.config,
      instance: this,
    });

    super.componentWillUnmount && super.componentWillUnmount();
  }

  render() {
    // Check if there's a custom view registered for this table
    if (this.viewManager.hasCustomView(this.tableName)) {
      const CustomViewComponent = this.viewManager.getViewComponent(this.tableName);
      const viewOptions = this.viewManager.getViewOptions(this.tableName);

      // If replaceDefault is true, render only the custom component
      if (viewOptions.replaceDefault) {
        return React.createElement(CustomViewComponent, {
          ...this.props,
          config: this.config,
          tableName: this.tableName,
          viewManager: this.viewManager,
          baseViewInstance: this,
        });
      }

      // Otherwise, render custom component with base view as fallback or wrapper
      const baseRender = super.render();

      // Create a function that allows the wrapper to enhance the config
      const renderBaseWithConfig = (enhancedConfig = {}) => {
        // Merge any enhanced config into this.config
        const originalConfig = { ...this.config };
        this.config = { ...this.config, ...enhancedConfig };

        // Render with the enhanced config
        const result = super.render();

        // Restore original config
        this.config = originalConfig;

        return result;
      };

      return React.createElement(CustomViewComponent, {
        ...this.props,
        config: this.config,
        tableName: this.tableName,
        viewManager: this.viewManager,
        baseViewInstance: this,
        baseRender: baseRender,
        renderBase: renderBaseWithConfig,
      });
    }

    // Execute beforeRender hooks
    const context = this.viewManager.executeHooks('beforeRender', this.tableName, {
      props: this.props,
      tableName: this.tableName,
      config: this.config,
      instance: this,
    });

    // Render the default BaseView
    const rendered = super.render();

    // Execute afterRender hooks
    this.viewManager.executeHooks('afterRender', this.tableName, {
      props: this.props,
      tableName: this.tableName,
      config: this.config,
      instance: this,
      rendered,
    });

    return rendered;
  }
}

// Helper functions for dynamic configuration generation
const constructTabTitle = (config, idColumn) => {
  let titleColumns = [];
  var columns = config.details
    .filter(
      (item) =>
        item.dataIndex != 'CreatedBy' &&
        item.dataIndex != 'CreatedDate' &&
        item.dataIndex != 'ModifiedBy' &&
        item.dataIndex != 'ModifiedDate' &&
        item.dataIndex != idColumn,
    )
    .filter((item) => item.editor && item.editor.type != 'combo')
    .map((item) => item);
  if (columns.length <= 3) {
    columns.forEach((item) => {
      titleColumns.push(item.dataIndex);
    });
  } else {
    columns.slice(0, 3).forEach((item) => {
      titleColumns.push(item.dataIndex);
    });
  }
  return titleColumns;
};

const constructGridColumns = (config, idColumn, tableName) => {
  var columns = config.details
    .filter(
      (item) =>
        item.dataIndex != 'CreatedBy' &&
        item.dataIndex != 'CreatedDate' &&
        item.dataIndex != 'ModifiedBy' &&
        item.dataIndex != 'ModifiedDate' &&
        item.dataIndex != idColumn &&
        item.hideInGrid != true,
      // ✅ Removed: item.editor.type != 'imageUpload' filter
      // Now imageUpload fields will be conditionally included based on tableName
    )
    .map((item) => {
      let returnItem = {
        dataIndex: item.dataIndex,
        header: item.header,
        renderer: item.renderer
      };
      if (item.editor) {
        if (item.editor.type) {
          if (item.editor.type == 'combo') {
            if (item.editor.isMultiple) {
              returnItem = {
                ...returnItem,
                type: 'combo',
                comboType: item.editor.lookUpMapping
                  ? item.editor.lookUpMapping
                  : item.editor.comboType,
                renderer: 'multiple',
              };
            } else {
              returnItem = {
                ...returnItem,
                type: 'combo',
                comboType: item.editor.lookUpMapping
                  ? item.editor.lookUpMapping
                  : item.editor.comboType,
              };
            }
          } else if (item.editor.type == 'date') {
            returnItem = { ...returnItem, type: 'date' };
          } else if (item.editor.type == 'datetime') {
            returnItem = { ...returnItem, type: 'datetime' };
          } else if (item.editor.type == 'float' || item.editor.type == 'int') {
            returnItem = { ...returnItem, type: 'number' };
          } else if (item.editor.type == 'boolean') {
            returnItem = { ...returnItem, type: 'boolean' };
          } else if (item.editor.type == 'imageUpload') {
            // ✅ Only show images in grid for specific tables (Vehicle & Visitor Tracking)
            const showImageInGrid = ['10825', '10826'].includes(tableName?.toString());

            if (showImageInGrid) {
              // Show image thumbnail in grid for tracking tables
              returnItem = {
                ...returnItem,
                type: 'image',
                width: 100,
                editable: false,
                nofiltertype: true,
                notsortabletype: true,
              };
            } else {
              // For other tables (like Assets), skip imageUpload fields in grid
              return null;
            }
          }
        }
      }
      return returnItem;
    })
    .filter(item => item !== null); // Remove null items (filtered imageUpload fields)
  return columns;
};

const constructFormColumns = (config, idColumn) => {
  var columns = config.details
    .filter(
      (item) =>
        item.dataIndex != 'CreatedBy' &&
        item.dataIndex != 'CreatedDate' &&
        item.dataIndex != 'ModifiedBy' &&
        item.dataIndex != 'ModifiedDate' &&
        item.dataIndex != idColumn,
    )
    .map((item) => {
      var returnItem = {
        dataIndex: item.dataIndex,
        header: item.header,
        title: item.header,
        hideInForm: item.hideInForm || false,
      };
      if (item.editor) {
        if (item.editor.isRequired) {
          returnItem.isRequired = true;
        }
        if (item.editor.type) {
          if (item.editor.type == 'combo') {
            if (item.editor.isMultiple) {
              returnItem = {
                ...returnItem,
                type: 'combo',
                comboType: item.editor.lookUpMapping
                  ? item.editor.lookUpMapping
                  : item.editor.comboType,
                mode: 'multiple',
              };
            } else {
              returnItem = {
                ...returnItem,
                type: 'combo',
                comboType: item.editor.lookUpMapping
                  ? item.editor.lookUpMapping
                  : item.editor.comboType,
              };
            }
          } else if (item.editor.type == 'date') {
            returnItem = { ...returnItem, type: 'date' };
          } else if (item.editor.type == 'datetime') {
            returnItem = { ...returnItem, type: 'datetime' };
          } else if (item.editor.type == 'float' || item.editor.type == 'int') {
            returnItem = { ...returnItem, type: item.editor.type };
          } else if (item.editor.type == 'boolean') {
            returnItem = { ...returnItem, type: 'boolean' };
          } else if (item.editor.type == 'textmax') {
            returnItem = { ...returnItem, type: 'textMax' };
          } else if (item.editor.type == 'imageUpload') {
            returnItem = { ...returnItem, type: 'imageUpload' };
          }
        }
      }
      return returnItem;
    });

  return columns;
};

const constructCombos = (config, idColumn) => {
  var columns = config.details
    .filter(
      (item) =>
        item.dataIndex != 'CreatedBy' &&
        item.dataIndex != 'CreatedDate' &&
        item.dataIndex != 'ModifiedBy' &&
        item.dataIndex != 'ModifiedDate' &&
        item.dataIndex != idColumn &&
        item.editor &&
        item.editor.type &&
        item.editor.type == 'combo' &&
        (item.editor.comboType || item.editor.lookUpMapping),
    )
    .map((item) => {
      var returnItem = {};
      if (item.editor.lookUpMapping) {
        returnItem = {
          type: item.editor.lookUpMapping,
          lookUpType: item.editor.lookUpMapping,
          ValueField: item.editor.mappingValueField,
        };
      } else {
        returnItem = {
          type: item.editor.comboType,
          ValueField: item.editor.mappingValueField,
          IDField: item.editor.mappingIdField,
        };
      }
      return returnItem;
    });
  return columns;
};

const constructChilds = (config) => {
  if (config.childs) {
    var childItems = [];
    for (var item of config.childs.split(',')) {
      childItems.push({
        ...generateConfig(item),
        // Removed Overides reference - using ViewManager instead
      });
    }
    return childItems;
  } else {
    return [];
  }
};

const generateConfig = (tableName, custom = {}) => {
  let masterConfig = JSON.parse(secureStorage.getItem('entityMapping') || '{}');
  let config = { ...masterConfig[tableName], ...custom };
  let idColumn = config.entity + 'Id';
  return {
    key: tableName.toString(),
    title: config.title,
    idColumn: idColumn,
    getGridColumns: () => [...constructGridColumns(config, idColumn, tableName), ...defaultGridColumns(tableName)],
    getFormColumns: () => [...constructFormColumns(config, idColumn)],
    childs: () => [...constructChilds(config)],
    comboTypes: [...constructCombos(config, idColumn)],
    tabTitle: constructTabTitle(config, idColumn),
  };
};

export { generateConfig };
export default EnhancedDynamicBaseView;
