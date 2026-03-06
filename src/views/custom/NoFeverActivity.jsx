import React from 'react';
import { Button, Tooltip } from 'antd';

/**
 * NoFeverActivity - Custom component for NoFever_Activity (Table 10372)
 * Contains entity-specific logic with automatic common buttons from ToolbarManager
 */
class NoFeverActivity {
  constructor() {
    this.tableName = '10372';
    this.entityName = 'NoFever_Activity';
    this.displayName = 'No Fever Activity';
  }

  /**
   * Handle custom actions for NoFever Activity
   */
  async handleAction(actionKey, params = {}, baseView) {
    switch (actionKey) {
      case 'risks':
        return this.handleRisksFilter(baseView);

      case 'controls':
        return this.handleControlsFilter(baseView);

      default:
        console.warn(`NoFeverActivity.handleAction: No handler for '${actionKey}'.`);
        return null;
    }
  }

  /**
   * Get custom toolbar - only specify entity-specific buttons
   * Common buttons (Add, Export, DateRange) are provided automatically
   */
  getCustomToolbar() {
    return {
      customButtons: [
        {
          key: 'risks',
          component: ({ baseView, style }) => (
            <Tooltip title="Risks">
              <Button
                variant="outlined"
                color="primary"
                className="main-button-color"
                ghost
                style={{ marginTop: 20, marginBottom: 20, ...style }}
                onClick={() => baseView.handleAction('risks')}
              >
                Risks
              </Button>
            </Tooltip>
          ),
          position: 'left',
          order: 1,
        },
        {
          key: 'controls',
          component: ({ baseView, style }) => (
            <Tooltip title="Controls">
              <Button
                variant="outlined"
                color="primary"
                className="main-button-color"
                ghost
                style={{ marginTop: 20, marginBottom: 20, ...style }}
                onClick={() => baseView.handleAction('controls')}
              >
                Controls
              </Button>
            </Tooltip>
          ),
          position: 'left',
          order: 2,
        },
      ],
    };
  }

  // Filter handlers
  handleRisksFilter(baseView) {
    const activityTypeCombos = baseView.props.combos['ActivityType'] || [];
    const filterList = activityTypeCombos
      .filter((item) => item.Type === 'Risks')
      .map((item) => item.LookupId);

    const model = {
      ActivityTypeId: {
        type: 'listCustom',
        value: filterList.join(','),
      },
    };

    if (baseView.gridApi) {
      baseView.gridApi.setFilterModel(model);
    }
  }

  handleControlsFilter(baseView) {
    const activityTypeCombos = baseView.props.combos['ActivityType'] || [];
    const filterList = activityTypeCombos
      .filter((item) => item.Type === 'Controls')
      .map((item) => item.LookupId);

    const model = {
      ActivityTypeId: {
        type: 'listCustom',
        value: filterList.join(','),
      },
    };

    if (baseView.gridApi) {
      baseView.gridApi.setFilterModel(model);
    }
  }

  getEntityConfig() {
    return {
      searchableFields: ['activityName', 'description', 'activityType'],
      dateFields: ['createdDate', 'updatedDate', 'dueDate'],
      statusField: 'status',
      filterFields: ['ActivityTypeId'],
    };
  }

  getValidationRules() {
    return {
      activityName: { required: true, minLength: 3, maxLength: 100 },
      description: { maxLength: 500 },
      activityType: { required: true },
    };
  }

  getFormConfig() {
    return {
      layout: 'vertical',
      sections: [
        { title: 'Basic Information', fields: ['activityName', 'description', 'activityType'] },
        { title: 'Timeline', fields: ['dueDate', 'estimatedHours'] },
      ],
    };
  }

  getGridConfig() {
    return {
      defaultSort: [{ field: 'createdDate', sort: 'desc' }],
      groupBy: null,
      pagination: { pageSize: 50, pageSizeOptions: [25, 50, 100, 200] },
      features: { export: true, filter: true, sort: true, grouping: true, columnResize: true },
    };
  }

  // Main method called by ViewManager
  getCustomizations() {
    return {
      tableName: this.tableName,
      entityName: this.entityName,
      displayName: this.displayName,
      customToolbar: this.getCustomToolbar(),
      entityConfig: this.getEntityConfig(),
      validationRules: this.getValidationRules(),
      formConfig: this.getFormConfig(),
      gridConfig: this.getGridConfig(),
    };
  }
}

// Create and export an instance
const noFeverActivity = new NoFeverActivity();

// Register with ViewRegistry for reliable access
import ViewRegistry from '../../core/ViewRegistry';
ViewRegistry.registerEntityCustomizations('10372', noFeverActivity);

export default noFeverActivity;
