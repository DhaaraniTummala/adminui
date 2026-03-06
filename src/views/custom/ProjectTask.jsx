import React from 'react';
import { Button, Tooltip, Card, Tag } from 'antd';
import ViewRegistry from '../../core/ViewRegistry';
import secureStorage from '../../utils/secureStorage';

/**
 * ProjectTask - Minimal custom component for Maiden_Task (Table 10715)
 * Only adds Mine and Pending buttons to the toolbar
 */
class ProjectTask {
  constructor() {
    this.tableName = '10715';
    this.entityName = 'Maiden_Task';
    this.displayName = 'Project Task';
  }

  /**
   * Custom Work Tracking View Component with Kanban and Grid modes
   */
  getCustomView() {
    return ({ tableName, config, renderBase, baseViewInstance, ...props }) => {
      const [viewMode, setViewMode] = React.useState('kanban');

      // Update base view state when view mode changes
      React.useEffect(() => {
        if (baseViewInstance) {
          baseViewInstance.setState({
            currentViewMode: viewMode,
            customViewActive: true,
          });
        }
      }, [viewMode, baseViewInstance]);

      // View mode toggle toolbar (separate from main toolbar)
      const ViewModeToolbar = () => {
        return (
          <div className="flex justify-between items-center mb-4 p-4 bg-white rounded-lg shadow-sm">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-gray-800">Work Tracking</h2>
              <Tag color="blue">{tableName}</Tag>
            </div>

            <div className="flex items-center space-x-2">
              {/* View mode toggle buttons only */}
              <Button
                type={viewMode === 'kanban' ? 'primary' : 'default'}
                onClick={() => setViewMode('kanban')}
              >
                Kanban
              </Button>
              <Button
                type={viewMode === 'grid' ? 'primary' : 'default'}
                onClick={() => setViewMode('grid')}
              >
                Grid
              </Button>
            </div>
          </div>
        );
      };

      // Kanban view component
      const KanbanView = () => {
        const columns = [
          { title: 'To Do', status: 'todo', color: '#f0f0f0' },
          { title: 'In Progress', status: 'inprogress', color: '#e6f7ff' },
          { title: 'Review', status: 'review', color: '#fff7e6' },
          { title: 'Done', status: 'done', color: '#f6ffed' },
        ];

        const mockTasks = [
          {
            id: 1,
            title: 'Create Wiki Page',
            status: 'done',
            assignee: 'Shaikh',
            priority: 'high',
          },
          {
            id: 2,
            title: 'Offer Post Editor',
            status: 'done',
            assignee: 'Shaikh',
            priority: 'medium',
          },
          {
            id: 3,
            title: 'Bug Fix - Drop Down',
            status: 'done',
            assignee: 'Rohit',
            priority: 'high',
          },
          { id: 4, title: 'Text-Max Display', status: 'done', assignee: 'Das', priority: 'low' },
          {
            id: 5,
            title: 'Migrate Scouter',
            status: 'done',
            assignee: 'Prasha',
            priority: 'medium',
          },
          {
            id: 6,
            title: 'Set In Progress',
            status: 'inprogress',
            assignee: 'Das',
            priority: 'high',
          },
          {
            id: 7,
            title: 'Mapping User',
            status: 'review',
            assignee: 'Murali',
            priority: 'medium',
          },
          {
            id: 8,
            title: 'SQL Server Migration',
            status: 'todo',
            assignee: 'Prasha',
            priority: 'high',
          },
        ];

        return (
          <div className="grid grid-cols-4 gap-4">
            {columns.map((column) => (
              <div key={column.status} className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold mb-4 text-gray-700">{column.title}</h3>
                <div className="space-y-3">
                  {mockTasks
                    .filter((task) => task.status === column.status)
                    .map((task) => (
                      <Card
                        key={task.id}
                        size="small"
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        bodyStyle={{ padding: '12px' }}
                      >
                        <div className="space-y-2">
                          <h4 className="font-medium text-sm">{task.title}</h4>
                          <div className="flex justify-between items-center">
                            <Tag
                              color={
                                task.priority === 'high'
                                  ? 'red'
                                  : task.priority === 'medium'
                                    ? 'orange'
                                    : 'green'
                              }
                              size="small"
                            >
                              {task.priority}
                            </Tag>
                            <span className="text-xs text-gray-500">{task.assignee}</span>
                          </div>
                        </div>
                      </Card>
                    ))}
                </div>
              </div>
            ))}
          </div>
        );
      };

      // Grid view with GridPanel reference capture
      const GridView = () => {
        try {
          if (renderBase) {
            // If caller provided an onGridPanelReady, forward it; otherwise render directly
            if (config && config.onGridPanelReady) {
              return renderBase({ onGridPanelReady: config.onGridPanelReady });
            }
            return renderBase();
          }

          return <div>Grid view not available</div>;
        } catch (error) {
          console.error('Error rendering grid view:', error);
          return <div>Error loading grid view</div>;
        }
      };

      return (
        <div className="work-tracking-container">
          <ViewModeToolbar />
          <div className="view-content">
            {viewMode === 'kanban' ? <KanbanView /> : <GridView />}
          </div>
        </div>
      );
    };
  }

  /**
   * Handle custom actions for Project Tasks
   */
  async handleAction(actionKey, params = {}, baseView) {
    switch (actionKey) {
      case 'mine':
        return this.handleMineFilter(baseView, params.active);

      case 'pending':
        return this.handlePendingFilter(baseView, params.active);

      default:
        console.warn(`ProjectTask.handleAction: No handler for '${actionKey}'.`);
        return null;
    }
  }

  /**
   * Get custom toolbar - only specify Mine and Pending buttons
   * Common buttons (Add, Export, DateRange) are provided automatically
   */
  getCustomToolbar() {
    return {
      needsMerging: true,
      // Default button states for ProjectTask - Mine and Pending selected by default
      defaultButtonStates: {
        isMineSelected: true,
        isPendingSelected: true,
      },
      // Default actions to apply on component mount
      defaultActions: [
        { key: 'mine', params: { active: true } },
        { key: 'pending', params: { active: true } },
      ],
      customButtons: [
        {
          key: 'mine',
          component: ({ buttonState, onButtonStateChange, onAction, style }) => (
            <Tooltip title="Show My Tasks">
              <Button
                type={buttonState?.isMineSelected ? 'primary' : 'default'}
                style={style}
                onClick={() => {
                  const newState = !buttonState?.isMineSelected;
                  onButtonStateChange({ isMineSelected: newState });
                  onAction('mine', { active: newState });
                }}
              >
                Mine
              </Button>
            </Tooltip>
          ),
          position: 'right',
          order: 0.5, // Place before Add (order 1)
        },
        {
          key: 'pending',
          component: ({ buttonState, onButtonStateChange, onAction, style }) => (
            <Tooltip title="Show Pending Tasks">
              <Button
                type={buttonState?.isPendingSelected ? 'primary' : 'default'}
                style={style}
                onClick={() => {
                  const newState = !buttonState?.isPendingSelected;
                  onButtonStateChange({ isPendingSelected: newState });
                  onAction('pending', { active: newState });
                }}
              >
                Pending
              </Button>
            </Tooltip>
          ),
          position: 'right',
          order: 0.7, // Place between Mine and Add
        },
      ],
      commonButtonOptions: {
        addOverrides: { text: 'Add Task' },
      },
    };
  }

  /**
   * Get custom filter handlers for Project Tasks
   */
  getFilterHandlers() {
    return {
      mine: this.handleMineFilter.bind(this),
      pending: this.handlePendingFilter.bind(this),
    };
  }

  /**
   * Handle Mine filter - show tasks assigned to current user
   */
  handleMineFilter(baseView, isActive) {
    // Get current Pending state from baseView.state (which now contains buttonStates)
    const isPendingSelected = baseView.state?.isPendingSelected || false;
    this.applyCombinedFilters(baseView, isActive, isPendingSelected);
  }

  /**
   * Handle Pending filter - show tasks with Not Started or In Progress status
   */
  handlePendingFilter(baseView, isActive) {
    // Get current Mine state from baseView.state (which now contains buttonStates)
    const isMineSelected = baseView.state?.isMineSelected || false;
    this.applyCombinedFilters(baseView, isMineSelected, isActive);
  }

  /**
   * Get Mine filter configuration
   */
  getMineFilter(baseView) {
    return {
      AssignedUserId: {
        type: 'list',
        value: secureStorage.getItem('userId') || baseView.getCurrentUserId(),
      },
    };
  }

  /**
   * Get Pending filter configuration
   */
  getPendingFilter(baseView) {
    const statusCombos = baseView.props.combos['10713'] || [];

    const filterList = statusCombos
      .filter((item) => {
        return item.DisplayValue === 'Not Started' || item.DisplayValue === 'In Progress';
      })
      .map((item) => item.LookupId);

    const filter = {
      Maiden_TaskStatusId: {
        type: 'list',
        value: filterList.join(','),
      },
    };

    return filter;
  }

  /**
   * Apply combined filters (Mine and/or Pending)
   */
  applyCombinedFilters(baseView, isMineSelected, isPendingSelected) {
    if (!baseView.gridApi) {
      return;
    }

    const model = baseView.gridApi.getFilterModel() || {};

    if (isMineSelected) {
      const mineFilter = this.getMineFilter(baseView);
      Object.assign(model, mineFilter);
    } else {
      delete model.AssignedUserId;
    }

    if (isPendingSelected) {
      const pendingFilter = this.getPendingFilter(baseView);
      Object.assign(model, pendingFilter);
    } else {
      delete model.Maiden_TaskStatusId;
    }

    baseView.gridApi.setFilterModel(model);
    setTimeout(() => {
      baseView.gridApi.onFilterChanged();
    }, 500);
  }

  /**
   * Get all customizations for ViewManager
   * This method is called by ViewManager to load entity customizations
   */
  getCustomizations() {
    return {
      tableName: this.tableName,
      entityName: this.entityName,
      displayName: this.displayName,
      customToolbar: this.getCustomToolbar(),
      filterHandlers: this.getFilterHandlers(),
    };
  }
}

// Create and export an instance
const projectTask = new ProjectTask();

// Register with ViewRegistry for reliable access
ViewRegistry.registerEntityCustomizations('10715', projectTask);

export default projectTask;

// Register the custom view wrapper for table 10715
ViewRegistry.registerViewWrapper('10715', projectTask.getCustomView(), {
  priority: 10,
  description: 'Enhanced Work Tracking view with Kanban and Grid modes',
  features: ['kanban', 'grid', 'customToolbar', 'entityButtons'],
});
