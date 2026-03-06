import React from 'react';
import { Tooltip, Button } from 'antd';
import DateRangeSelect from '../common/DateRangeSelect.jsx';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';

// ==================== COMMON BUTTON ENUMS ====================

/**
 * Common toolbar button types that can be reused across entities
 * Only includes truly generic buttons that apply to most entities
 */
export const COMMON_BUTTONS = {
  ADD: 'add',
  EXPORT: 'export',
  DATE_RANGE: 'dateRange',
};

/**
 * Common button configurations that entities can extend/modify
 * Only includes truly generic buttons
 */
export const COMMON_BUTTON_CONFIGS = {
  [COMMON_BUTTONS.ADD]: {
    key: COMMON_BUTTONS.ADD,
    tooltip: 'Add New Item',
    type: 'primary',
    icon: <AddOutlinedIcon />,
    text: 'ADD',
    buttonStyle: {
      borderRadius: 20,
      padding: '0 14px',
      fontWeight: 600,
      textTransform: 'uppercase',
    },
    action: 'ADD',
    position: 'right',
    order: 1,
  },

  [COMMON_BUTTONS.EXPORT]: {
    key: COMMON_BUTTONS.EXPORT,
    tooltip: 'Export Data',
    type: 'default',
    icon: <ArrowUpwardIcon />,
    text: 'EXPORT',
    buttonStyle: {
      borderRadius: 20,
      padding: '0 14px',
      fontWeight: 600,
      border: '1px solid #1677ff',
      color: '#1677ff',
      background: '#fff',
      textTransform: 'uppercase',
    },
    action: 'EXPORT',
    actionParams: { format: 'xlsx' },
    position: 'right',
    order: 2,
  },

  [COMMON_BUTTONS.DATE_RANGE]: {
    key: COMMON_BUTTONS.DATE_RANGE,
    tooltip: 'Select Date Range',
    type: 'select',
    text: 'Select Range',
    width: 150,
    options: [
      { value: 'today', label: 'Today' },
      { value: 'thisWeek', label: 'This Week' },
      { value: 'thisMonth', label: 'This Month' },
      { value: 'lastMonth', label: 'Last Month' },
      { value: 'custom', label: 'Custom Range' },
    ],
    position: 'right',
    order: 3,
  },
};

/**
 * Helper function to create a button component from common config
 */
export const createCommonButton = (buttonKey, overrides = {}) => {
  const baseConfig = COMMON_BUTTON_CONFIGS[buttonKey];
  if (!baseConfig) {
    console.warn(`ToolbarManager: Unknown common button key: ${buttonKey}`);
    return null;
  }

  const config = { ...baseConfig, ...overrides };

  return {
    key: config.key,
    component: ({ baseView, style }) => {
      // Handle different button types
      if (config.type === 'select') {
        return (
          <Tooltip title={config.tooltip}>
            <Select
              placeholder={config.text}
              style={{ ...style, width: config.width }}
              onChange={(value) => {
                console.log(`${config.key} changed:`, value);
                if (baseView.handleAction) {
                  baseView.handleAction(config.key, { value });
                } else {
                  console.warn('BaseView.handleAction not available');
                }
              }}
            >
              {config.options?.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Tooltip>
        );
      }

      if (config.type === 'toggle') {
        const stateKey = `is${config.key.charAt(0).toUpperCase() + config.key.slice(1)}Selected`;
        const isSelected = baseView.state[stateKey] || false;

        return (
          <Tooltip title={config.tooltip}>
            <Button
              type={isSelected ? 'primary' : 'default'}
              style={style}
              onClick={() => {
                console.log(`${config.key} toggle clicked`);
                const newState = !isSelected;
                baseView.setState({ [stateKey]: newState });

                if (baseView.handleAction) {
                  baseView.handleAction(config.key, { active: newState });
                } else {
                  console.warn('BaseView.handleAction not available');
                }
              }}
            >
              {config.text}
            </Button>
          </Tooltip>
        );
      }

      // Default button type
      return (
        <Tooltip title={config.tooltip}>
          <Button
            type={config.type}
            style={{ ...(config.buttonStyle || {}), ...(style || {}) }}
            onClick={async () => {
              console.log(`${config.key} button clicked`);
              try {
                if (baseView.handleAction) {
                  await baseView.handleAction(config.key, config.actionParams);
                } else {
                  console.warn('No action handler available for button:', config.key);
                }
              } catch (error) {
                console.error(`Error executing ${config.key} action:`, error);
              }
            }}
          >
            {/* Render icon and text explicitly to avoid icon-only heuristics hiding text */}
            {config.icon ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  marginRight: 6,
                  color: 'inherit',
                }}
              >
                {config.icon}
              </span>
            ) : null}
            <span
              style={{
                color: 'inherit',
                fontWeight: (config.buttonStyle && config.buttonStyle.fontWeight) || 600,
              }}
            >
              {config.text}
            </span>
          </Button>
        </Tooltip>
      );
    },
    position: config.position,
    order: config.order,
  };
};

/**
 * ToolbarManager - Configurable toolbar system for BaseView
 * Replaces hard-coded toolbar conditions with dynamic configuration
 */
class ToolbarManager {
  constructor(baseView) {
    console.log('ToolbarManager: Constructor called with baseView:', baseView);
    try {
      this.baseView = baseView;
      this.toolbarConfigs = new Map();
      this.buttonComponents = new Map();
      this.filterHandlers = new Map();
      console.log('ToolbarManager: Maps initialized successfully');
      console.log('ToolbarManager: Constructor completed successfully');
    } catch (error) {
      console.error('ToolbarManager: Constructor failed:', error);
      throw error;
    }
  }

  /**
   * Register a toolbar configuration for a specific module/entity combination
   * @param {string} moduleEntity - Format: "ModuleName_EntityName" (e.g., "ProjectTracking_Maiden_Task")
   * @param {Object} config - Toolbar configuration
   */
  registerToolbarConfig(moduleEntity, config) {
    this.toolbarConfigs.set(moduleEntity, {
      buttons: config.buttons || [],
      layout: config.layout || 'horizontal',
      position: config.position || 'right',
      spacing: config.spacing || '5px',
      containerStyle: config.containerStyle || {},
      showDefaultButtons: config.showDefaultButtons !== false,
      ...config,
    });

    console.log(`ToolbarManager: Registered toolbar config for ${moduleEntity}`);
  }

  /**
   * Register a custom button component
   * @param {string} name - Button component name
   * @param {Object} component - Button component configuration
   */
  registerButtonComponent(name, component) {
    this.buttonComponents.set(name, {
      component: component.component,
      defaultProps: component.defaultProps || {},
      onClick: component.onClick,
      style: component.style || {},
      tooltip: component.tooltip,
      permissions: component.permissions || [],
      ...component,
    });
  }

  /**
   * Register a filter handler for custom filtering logic
   * @param {string} name - Filter handler name
   * @param {Function} handler - Filter handler function
   */
  registerFilterHandler(name, handler) {
    this.filterHandlers.set(name, handler);
  }

  /**
   * Get toolbar configuration for a module/entity combination
   * @param {string} moduleName - Module name
   * @param {string} entityName - Entity name
   * @returns {Object|null} Toolbar configuration or null if not found
   */
  getToolbarConfig(moduleName, entityName) {
    const key = `${moduleName}_${entityName}`;
    return this.toolbarConfigs.get(key) || null;
  }

  /**
   * Render toolbar using ViewManager's button configuration
   * Automatically merges custom buttons with default common buttons
   * @param {Object} props - Additional props to pass to toolbar
   * @returns {JSX.Element|null} Rendered toolbar or null
   */
  renderToolbar(props = {}) {
    // Get button configuration from ViewManager
    const tableName =
      this.baseView.props.config?.tableName || this.baseView.props.config?.entity?.tableName;
    console.log('ToolbarManager: renderToolbar called with tableName:', tableName);
    console.log('ToolbarManager: baseView.props.config:', this.baseView.props.config);

    if (!tableName) {
      console.log('ToolbarManager: No tableName found, returning null');
      return null;
    }

    const buttonConfig = this.baseView.viewManager.getAvailableButtons(tableName);
    console.log('ToolbarManager: buttonConfig from ViewManager:', buttonConfig);

    if (!buttonConfig || !buttonConfig.needsMerging) {
      console.log('ToolbarManager: No valid buttonConfig, returning null');
      return null;
    }

    // Merge custom buttons with default common buttons
    const allButtons = this.mergeButtonsWithDefaults(
      buttonConfig.customButtons || [],
      buttonConfig.commonButtonOptions || {},
    );

    if (allButtons.length === 0) return null;

    // Get layout configuration
    const layout = this.baseView.viewManager.getToolbarLayout(tableName);
    const containerStyle = {
      display: 'flex',
      justifyContent:
        layout.alignment === 'space-between'
          ? 'space-between'
          : layout.alignment === 'center'
            ? 'center'
            : layout.alignment === 'right'
              ? 'flex-end'
              : 'flex-start',
      alignItems: 'center',
      gap: layout.spacing || 8,
      padding: layout.padding || '8px 16px',
      width: '100%',
    };

    // Group buttons by position
    const leftButtons = allButtons.filter((btn) => btn.position === 'left');
    const rightButtons = allButtons.filter((btn) => btn.position === 'right');

    return (
      <div style={containerStyle}>
        {/* Left side buttons */}
        {leftButtons.length > 0 && (
          <div style={{ display: 'flex', gap: layout.spacing || 8, alignItems: 'center' }}>
            {leftButtons.map((button, index) => this.renderSingleButton(button, index, props))}
          </div>
        )}

        {/* Right side buttons */}
        {rightButtons.length > 0 && (
          <div style={{ display: 'flex', gap: layout.spacing || 8, alignItems: 'center' }}>
            {rightButtons.map((button, index) =>
              this.renderSingleButton(button, index + leftButtons.length, props),
            )}
          </div>
        )}
      </div>
    );
  }

  /**
   * Render a single button from the merged button configuration
   * @param {Object} button - Button configuration (from createCommonButton or custom)
   * @param {number} index - Button index
   * @param {Object} props - Additional props
   * @returns {JSX.Element} Rendered button
   */
  renderSingleButton(button, index, props) {
    if (!button || !button.component) {
      console.warn('ToolbarManager: Invalid button configuration', button);
      return null;
    }

    const buttonProps = {
      baseView: this.baseView,
      style: { marginLeft: index > 0 ? '8px' : '0' },
      ...props,
    };

    try {
      return React.cloneElement(button.component(buttonProps), { key: index });
    } catch (error) {
      console.error('ToolbarManager: Error rendering button:', error);
      return null;
    }
  }

  /**
   * Legacy render button method (kept for backward compatibility)
   * @param {Object} buttonComponent - Button component configuration
   * @param {Object} buttonConfig - Button instance configuration
   * @param {number} index - Button index
   * @param {Object} props - Additional props
   * @param {Function} t - Translation function
   * @returns {JSX.Element} Rendered button
   */
  renderButton(buttonComponent, buttonConfig, index, props, t) {
    // Handle special date range component
    if (buttonConfig.type === 'dateRange') {
      return (
        <DateRangeSelect
          key={index}
          defaultValue="Select Range"
          onChange={this.baseView.applyDateRangeFilter}
        />
      );
    }

    // Calculate dynamic styles
    let dynamicStyle = { ...buttonComponent.style };
    if (buttonConfig.style) {
      Object.keys(buttonConfig.style).forEach((key) => {
        const styleValue = buttonConfig.style[key];
        if (typeof styleValue === 'function') {
          dynamicStyle[key] = styleValue(this.baseView);
        } else {
          dynamicStyle[key] = styleValue;
        }
      });
    }

    const buttonProps = {
      ...buttonComponent.defaultProps,
      ...buttonConfig.props,
      variant: 'outlined',
      color: 'primary',
      className: 'main-button-color',
      ghost: true,
      onClick: () => this.handleButtonClick(buttonComponent, buttonConfig, props),
      style: dynamicStyle,
    };

    const ButtonElement = (
      <Button key={index} {...buttonProps}>
        {buttonConfig.icon && buttonConfig.icon}
        {t(buttonConfig.label || buttonComponent.tooltip || 'Button')}
      </Button>
    );

    if (buttonConfig.tooltip || buttonComponent.tooltip) {
      return (
        <Tooltip key={index} title={t(buttonConfig.tooltip || buttonComponent.tooltip)}>
          {ButtonElement}
        </Tooltip>
      );
    }

    return ButtonElement;
  }

  /**
   * Handle button click events
   * @param {Object} buttonComponent - Button component configuration
   * @param {Object} buttonConfig - Button instance configuration
   * @param {Object} props - Additional props
   */
  handleButtonClick(buttonComponent, buttonConfig, props) {
    if (buttonConfig.onClick) {
      buttonConfig.onClick(this.baseView, props);
    } else if (buttonComponent.onClick) {
      buttonComponent.onClick(this.baseView, props);
    } else {
      console.warn('ToolbarManager: No onClick handler defined for button');
    }
  }

  /**
   * Get default common buttons that all entities should have
   * These are automatically provided unless explicitly disabled
   */
  getDefaultCommonButtons() {
    return [
      createCommonButton(COMMON_BUTTONS.ADD, {
        tooltip: 'Add New Item',
        text: 'Add',
        position: 'right',
        order: 1,
      }),

      createCommonButton(COMMON_BUTTONS.EXPORT, {
        tooltip: 'Export Data',
        position: 'right',
        order: 2,
      }),

      createCommonButton(COMMON_BUTTONS.DATE_RANGE, {
        tooltip: 'Select Date Range',
        position: 'right',
        order: 3,
      }),
    ];
  }

  /**
   * Merge custom buttons with default common buttons
   * Entities can override or disable common buttons as needed
   */
  mergeButtonsWithDefaults(customButtons = [], options = {}) {
    const {
      includeAdd = true,
      includeExport = true,
      includeDateRange = true,
      addOverrides = {},
      exportOverrides = {},
      dateRangeOverrides = {},
    } = options;

    const defaultButtons = [];

    // Add default common buttons if not disabled
    if (includeAdd) {
      defaultButtons.push(
        createCommonButton(COMMON_BUTTONS.ADD, {
          tooltip: 'Add New Item',
          text: 'Add',
          position: 'right',
          order: 1,
          ...addOverrides,
        }),
      );
    }

    if (includeExport) {
      defaultButtons.push(
        createCommonButton(COMMON_BUTTONS.EXPORT, {
          tooltip: 'Export Data',
          position: 'right',
          order: 2,
          ...exportOverrides,
        }),
      );
    }

    if (includeDateRange) {
      defaultButtons.push(
        createCommonButton(COMMON_BUTTONS.DATE_RANGE, {
          tooltip: 'Select Date Range',
          position: 'right',
          order: 3,
          ...dateRangeOverrides,
        }),
      );
    }

    // Merge custom buttons with defaults
    const allButtons = [...customButtons, ...defaultButtons];

    // Sort by position and order
    return allButtons.sort((a, b) => {
      if (a.position !== b.position) {
        return a.position === 'left' ? -1 : 1;
      }
      return (a.order || 0) - (b.order || 0);
    });
  }

  /**
   * Setup default button components
   * ToolbarManager now provides common buttons automatically
   */
  setupDefaultButtons() {
    // ToolbarManager now automatically provides common buttons
    // Entities only need to specify their custom buttons
    console.log('ToolbarManager: Default common buttons available');
  }

  /**
   * Initialize default toolbar configurations
   * ToolbarManager is now fully generic - configurations come from ViewManager
   */
  initializeDefaultConfigs() {
    // No default configurations needed - all configurations now come from:
    // 1. ViewManager loading custom components (e.g., ProjectTask.jsx)
    // 2. Common button configurations via COMMON_BUTTON_CONFIGS
    console.log('ToolbarManager: Generic configuration initialization complete');
  }

  // Legacy method removed - configurations now come from ViewManager and custom components

  /**
   * Generate toolbar key from BaseView configuration
   * This creates a consistent key for toolbar registration
   */
  generateToolbarKey(config) {
    const moduleName = config.moduleName || 'default';
    const entity = config.entity?.name || config.entityName || 'default';
    return `${moduleName}_${entity}`;
  }
}

export default ToolbarManager;
