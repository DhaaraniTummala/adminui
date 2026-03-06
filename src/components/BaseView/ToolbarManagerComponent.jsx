import React, { Component } from 'react';
import { Button, Tooltip, Input, message } from 'antd';
import { withTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import ReportProblemOutlinedIcon from '@mui/icons-material/ReportProblemOutlined';
import { defaultLoader } from '../../core/utils';
import DateRangeSelect from '../common/DateRangeSelect.jsx';
import viewManager from '../../core/ViewManager';
import API from '../../store/requests';
import secureStorage from '../../utils/secureStorage';
import './toolbar-buttons.css';

// Custom styles for the right-side modal
const rightSideModalStyles = {
  modal: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    margin: 0,
    maxWidth: '500px',
    width: '100%',
    borderRadius: 0,
    padding: 0,
    height: '100%',
    maxHeight: '100vh',
  },
  body: {
    padding: '24px',
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 110px)',
  },
  header: {
    margin: 0,
    padding: '16px 24px',
    borderBottom: '1px solid #f0f0f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    margin: 0,
    padding: '10px 24px',
    borderTop: '1px solid #f0f0f0',
    textAlign: 'right',
  },
};

class ToolbarManagerComponent extends Component {
  shouldComponentUpdate(nextProps, nextState) {
    // Only re-render if these specific props change
    const propsToCheck = [
      'readOnlyGrid',
      'isChild',
      'displayLoader',
      'isReadOnly',
      't', // translation function
      'gridApi',
      'combos',
    ];

    // Check if any of the important props have changed
    const propsChanged = propsToCheck.some((prop) => {
      // Special handling for functions and objects
      if (typeof this.props[prop] === 'function' || typeof nextProps[prop] === 'function') {
        return this.props[prop] !== nextProps[prop];
      }
      return JSON.stringify(this.props[prop]) !== JSON.stringify(nextProps[prop]);
    });

    // Check customEditButton separately (React elements can't be stringified)
    const customEditButtonChanged = this.props.customEditButton !== nextProps.customEditButton;

    // Also check if internal state has changed
    const stateChanged =
      this.state && nextState && JSON.stringify(this.state) !== JSON.stringify(nextState);

    return propsChanged || customEditButtonChanged || stateChanged;
  }

  constructor(props) {
    super(props);
    this.state = {
      isMineSelected: false,
      isPendingSelected: false,
      entityConfig: null,
      buttonStates: {},
      allAssets: [],
      isAssetsLoaded: false,
      searchQuery: '',
      suggestions: [],
      selectedAsset: null,
      loadingAsset: false,
      // Complaint modal state
    };
  }

  hasFullAccess() {
    const isFullAccess = sessionStorage.getItem('fullAccess');
    return isFullAccess !== '0';
  }

  async getEntityToolbarConfig() {
    const { tableName } = this.props;
    if (!tableName) return null;
    try {
      let customizations = viewManager.loadCustomizationsSync(tableName);
      if (!customizations) {
        customizations = await viewManager.loadEntityCustomizations(tableName);
      }
      return customizations;
    } catch (error) {
      console.warn('ToolbarManagerComponent: Error getting entity config:', error);
      return null;
    }
  }

  async componentDidMount() {
    const entityConfig = await this.getEntityToolbarConfig();
    const defaults =
      (entityConfig && entityConfig.defaultButtonStates) ||
      (entityConfig?.customToolbar && entityConfig.customToolbar.defaultButtonStates) ||
      {};
    const actions =
      (entityConfig && entityConfig.defaultActions) ||
      (entityConfig?.customToolbar && entityConfig.customToolbar.defaultActions) ||
      [];

    // If entity has appendToolbar method, initialize it with default toolbar items
    if (entityConfig?.appendToolbar && typeof entityConfig.appendToolbar === 'function') {
      const baseViewCompat = this.getBaseViewCompat();
      try {
        const toolbarConfigs = await entityConfig.appendToolbar([], baseViewCompat);
        if (Array.isArray(toolbarConfigs)) {
          // Transform toolbar configs into React elements
          const customToolbarItems = toolbarConfigs.map((config, index) => {
            if (React.isValidElement(config)) {
              return config;
            }

            const { key, type = 'default', text, icon, onClick, style = {}, ...rest } = config;

            return (
              <Button
                key={key || `toolbar-btn-${index}`}
                type={type}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  ...style,
                }}
                onClick={(e) => {
                  e?.preventDefault?.();
                  e?.stopPropagation?.();
                  onClick?.(e);
                }}
                {...rest}
              >
                {icon}
                {text && <span>{text}</span>}
              </Button>
            );
          });

          this.setState({ customToolbarItems });
        }
      } catch (error) {
        console.error('Error in appendToolbar:', error);
      }
    }

    await this.setState({
      entityConfig,
      isMineSelected: !!defaults.isMineSelected,
      isPendingSelected: !!defaults.isPendingSelected,
      buttonStates: { ...defaults },
    });

    if (actions.length > 0) {
      setTimeout(() => {
        actions.forEach((a) => {
          if (a && a.key) {
            this.handleCustomAction(a.key, a.params || {});
          }
        });
      }, 500);
    }
  }

  handleCustomAction = async (actionKey, params = {}) => {
    const { tableName } = this.props;
    try {
      if (actionKey === 'mine') {
        this.setState((prev) => ({
          isMineSelected: params.active,
          buttonStates: { ...prev.buttonStates, isMineSelected: params.active },
        }));
      } else if (actionKey === 'pending') {
        this.setState((prev) => ({
          isPendingSelected: params.active,
          buttonStates: { ...prev.buttonStates, isPendingSelected: params.active },
        }));
      }

      const customizations = await viewManager.loadEntityCustomizations(tableName);
      if (customizations?.filterHandlers?.[actionKey]) {
        const baseViewCompat = this.getBaseViewCompat();
        return await customizations.filterHandlers[actionKey](baseViewCompat, params.active);
      } else {
        console.warn(
          `ToolbarManagerComponent: No handler found for '${actionKey}' in table ${tableName}`,
        );
      }
    } catch (error) {
      console.error(
        `ToolbarManagerComponent: Error executing custom action '${actionKey}':`,
        error,
      );
    }
  };

  getBaseViewCompat() {
    return {
      gridApi: this.props.gridApi,
      state: this.state,
      setState: (newState) => this.setState(newState),
      props: { combos: this.props.combos || {} },
      getCurrentUserId: () => secureStorage.getItem('userId') || 'unknown',
      refreshData: () => this.props.onRefresh && this.props.onRefresh(),
      forceUpdate: () => this.forceUpdate(),
    };
  }

  renderChildToolbar() {
    const { onCreateRow, onAddRow, onGetRowData, isEditable, t, tableName, title, ParentEntity } =
      this.props;

    // Special layout for WorkOrder child grids
    if (ParentEntity === 'WorkOrder') {
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            padding: '16px 0',
            gap: '16px',
          }}
        >
          {/* Dynamic heading */}
          <h1
            style={{
              fontSize: '24px',
              fontWeight: '600',
              color: '#04080B',
              margin: 0,
              lineHeight: '1.2',
              textAlign: 'left',
              fontFamily:
                '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          >
            {title || 'Work Order Details'}
          </h1>

          {/* Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Tooltip title="New">
              <Button
                type="primary"
                style={{
                  backgroundColor: '#6941C6',
                  color: '#FFF',
                  borderRadius: '8px',
                  border: 'none',
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textTransform: 'none',
                  boxShadow: 'none',
                }}
                onClick={isEditable ? onAddRow : onCreateRow}
              >
                {t('New')}
              </Button>
            </Tooltip>
            {this.props.customEditButton && this.props.customEditButton}
            {isEditable && (
              <Tooltip title="Save">
                <Button
                  type="primary"
                  style={{
                    backgroundColor: '#6941C6',
                    color: '#FFF',
                    borderRadius: '8px',
                    border: 'none',
                    padding: '10px 24px',
                    fontSize: '14px',
                    fontWeight: '500',
                    textTransform: 'none',
                    boxShadow: 'none',
                  }}
                  onClick={onGetRowData}
                >
                  {t('Save')}
                </Button>
              </Tooltip>
            )}
          </div>
        </div>
      );
    }

    // Default behavior for other child grids
    return (
      <>
        <Tooltip title="New">
          <Button
            variant="outlined"
            color="primary"
            className="main-button-color"
            ghost
            style={{ marginTop: 20, marginBottom: 20 }}
            onClick={isEditable ? onAddRow : onCreateRow}
          >
            {t('New')}
          </Button>
        </Tooltip>
        {isEditable && (
          <Tooltip title="Save">
            <Button
              variant="outlined"
              color="primary"
              className="main-button-color"
              ghost
              style={{ marginTop: 20, marginBottom: 20 }}
              onClick={onGetRowData}
            >
              {t('Save')}
            </Button>
          </Tooltip>
        )}
      </>
    );
  }

  renderCustomUI() {
    const { entityConfig } = this.state;
    if (entityConfig?.renderCustomUI && typeof entityConfig.renderCustomUI === 'function') {
      const baseViewCompat = this.getBaseViewCompat();
      try {
        return entityConfig.renderCustomUI(baseViewCompat);
      } catch (error) {
        console.error('Error in renderCustomUI:', error);
        return null;
      }
    }
    return null;
  }

  renderToolbarContent() {
    const { entityConfig = {}, customToolbarItems = [] } = this.state;
    const { isReadOnly } = this.props;

    // Safely access entityConfig properties with null checks
    const directButtons =
      entityConfig?.customButtons && Array.isArray(entityConfig.customButtons)
        ? entityConfig.customButtons
        : [];

    const nestedButtons =
      entityConfig?.customToolbar?.customButtons &&
      Array.isArray(entityConfig.customToolbar.customButtons)
        ? entityConfig.customToolbar.customButtons
        : [];

    // Filter out duplicate buttons by key
    const allButtons = [...directButtons, ...nestedButtons].reduce((acc, button) => {
      if (!acc.find((b) => b.key === button.key)) {
        acc.push(button);
      }
      return acc;
    }, []);

    // Convert custom toolbar items to button elements
    const customButtons = customToolbarItems
      .filter(Boolean)
      .map((item, index) => {
        if (React.isValidElement(item)) {
          return React.cloneElement(item, {
            key: item.key || `custom-${index}`,
            // Ensure we don't have duplicate click handlers
            onClick: item.props.onClick || (() => {}),
          });
        }
        return null;
      })
      .filter(Boolean);

    // Safely get common button options with fallbacks
    const directOptions =
      entityConfig?.commonButtonOptions && typeof entityConfig.commonButtonOptions === 'object'
        ? entityConfig.commonButtonOptions
        : {};

    const nestedOptions = entityConfig?.customToolbar?.commonButtonOptions || {};
    const commonButtonOptions = { ...directOptions, ...nestedOptions };

    // Filter out any duplicate buttons that might have been added through multiple sources
    const uniqueButtons = [];
    const buttonKeys = new Set();

    [...allButtons, ...customButtons].forEach((button) => {
      const key = button.key || JSON.stringify(button);
      if (!buttonKeys.has(key)) {
        buttonKeys.add(key);
        uniqueButtons.push(button);
      }
    });

    const items = [];

    // Custom buttons
    customButtons.forEach((button, index) => {
      if (button.component && typeof button.component === 'function') {
        const ButtonComponent = button.component;
        try {
          const element = (
            <ButtonComponent
              key={button.key || `custom-${index}`}
              buttonState={this.state.buttonStates || {}}
              onButtonStateChange={(newState) =>
                this.setState({
                  buttonStates: { ...(this.state.buttonStates || {}), ...newState },
                })
              }
              onAction={this.handleCustomAction}
              gridApi={this.props.gridApi}
              combos={this.props.combos}
              getCurrentUserId={() => secureStorage.getItem('userId') || 'unknown'}
              onCreateRow={this.props.onCreateRow}
              onExportToXlsx={this.props.onExportToXlsx}
              onApplyDateRangeFilter={onApplyDateRangeFilter}
            />
          );
          items.push({ order: typeof button.order === 'number' ? button.order : 0, element });
        } catch (error) {
          console.error('ToolbarManagerComponent: Error creating button element:', error);
        }
      } else {
        console.warn('ToolbarManagerComponent: Invalid button configuration:', button);
      }
    });

    // Common buttons
    if (!isReadOnly) {
      const currentPath = window.location.hash;

      //Hide rendering button only for BreakDown page
      if (currentPath !== '#/Asset/BreakDown') {
        const isComplaintPage = currentPath === '#/Asset/Complaint'; // Complaint page check
        const isEdit = this.getCurrentMenuItemEditStatus();
        const isCreateButtonDisabled = !isEdit;

        // Only show the button if user has edit permissions
        if (isEdit) {
          const addEl = (
            <Tooltip
              title={
                commonButtonOptions.addOverrides?.tooltip ||
                `${!isComplaintPage ? `New ${this.props.title || 'Record'}` : this.props.title || 'Record'}`
              }
              key="add"
            >
              <Button
                type="primary"
                onClick={this.props.onCreateRow}
                className="custom-add-button"
                style={{
                  backgroundColor: '#6941C6',
                  color: '#FFF',
                  borderRadius: '8px',
                  border: 'none',
                  padding: '10px 24px',
                  fontSize: '14px',
                  fontWeight: '500',
                  textTransform: 'none',
                  boxShadow: 'none',
                  minWidth: 'auto',
                  width: 'auto',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                  ...(commonButtonOptions.addOverrides?.style || {}),
                }}
              >
                <img
                  src="add.svg"
                  alt="Add"
                  style={{
                    fontSize: '16px',
                    width: '16px',
                    height: '16px',
                    flexShrink: 0,
                    opacity: 1,
                  }}
                />
                <span
                  style={{
                    color: 'inherit',
                    fontWeight: 500,
                    opacity: 1,
                  }}
                >
                  {commonButtonOptions.addOverrides?.text ||
                    `${!isComplaintPage ? `New ${this.props.title || 'Record'}` : this.props.title || 'Record'}`}
                </span>
              </Button>
            </Tooltip>
          );
          items.push({ order: 2, element: addEl });
        }
      }
    }

    // Export Button
    const exportEl = (
      <Tooltip title={commonButtonOptions.exportOverrides?.tooltip || 'Export'} key="export">
        <Button
          onClick={this.props.onExportToXlsx}
          className="custom-export-button"
          style={{
            borderRadius: '8px',
            border: '1px solid #6941C6',
            color: '#6941C6',
            backgroundColor: '#fff',
            padding: '10px 24px',
            fontSize: '14px',
            fontWeight: '500',
            textTransform: 'none',
            boxShadow: 'none',
            minWidth: 'auto',
            width: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '4px',
            ...(commonButtonOptions.exportOverrides?.style || {}),
          }}
        >
          <img
            src="export.svg"
            alt="Export"
            style={{ width: '16px', height: '16px', flexShrink: 0 }}
          />
          <span style={{ color: 'inherit', fontWeight: 500 }}>
            {commonButtonOptions.exportOverrides?.text || 'Export'}
          </span>
        </Button>
      </Tooltip>
    );
    items.push({ order: 1, element: exportEl });

    const dateRangeEl = (
      <div
        key="dateRange"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          borderRadius: '8px',
          border: '1px solid #E5E7EB',
          backgroundColor: '#fff',
          padding: '22px 20px',
          fontSize: '14px',
          fontWeight: '500',
          minWidth: '80px',
          height: '40px',
          cursor: 'pointer',
        }}
      >
        <img src="Filter.svg" alt="Filter" style={{ width: '24px', height: '24px' }} />
        <DateRangeSelect
          defaultValue={commonButtonOptions.dateRangeOverrides?.defaultValue || 'Filters'}
          style={{
            border: 'none',
            backgroundColor: 'transparent',
            padding: '0',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: 'none',
            outline: 'none',
            ...commonButtonOptions.dateRangeOverrides?.style,
          }}
          onChange={this.props.onApplyDateRangeFilter}
        />
      </div>
    );
    items.push({ order: 0.5, element: dateRangeEl });

    const sortedItems = items.sort((a, b) => a.order - b.order);
    const actionButtons = sortedItems.filter((item) => item.order <= 2.5);
    const filterControls = sortedItems.filter((item) => item.order > 2.5);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', width: '100%' }}>
        {/* Top row: heading and actions */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            width: '100%',
          }}
        >
          {/* Left side: Heading and description */}
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              flex: 1,
              alignItems: 'flex-start',
            }}
          >
            <h1
              style={{
                fontSize: '24px',
                fontWeight: '600',
                color: '#04080B',
                margin: 0,
                lineHeight: '1.2',
                textAlign: 'left',
                fontFamily:
                  '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
              }}
            >
              {this.props.title || 'Assets'}
            </h1>
            {this.props.subTitle && (
              <p
                style={{
                  fontSize: '12px',
                  color: '#6B7280',
                  margin: 0,
                  lineHeight: '1.4',
                  textAlign: 'left',
                  fontFamily:
                    '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                {this.props.subTitle}
              </p>
            )}
          </div>

          {/* Middle: Search bar (for Asset table only) */}
          {this.props.tableName === '10738' && (
            <div style={{ flex: 1, maxWidth: '400px', marginLeft: '24px' }}>
              <Input
                placeholder="Search AssetName"
                prefix={
                  <img
                    src="search-normal.svg"
                    alt="Search"
                    style={{ width: '18px', height: '18px' }}
                  />
                }
                onChange={(e) => this.handleAssetSearch(e.target.value)}
                style={{
                  borderRadius: '8px',
                  border: '1px solid #D0D5DD',
                  padding: '10px 14px',
                  fontSize: '14px',
                  backgroundColor: '#FFFFFF',
                  height: '44px',
                }}
                className="asset-search-input"
              />
            </div>
          )}

          {/* Right side: Action buttons */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              flexShrink: 0,
            }}
          >
            {actionButtons.map((it, idx) => (
              <span key={idx} style={{ display: 'inline-flex' }}>
                {it.element}
              </span>
            ))}
          </div>
        </div>

        {/* Separator */}
        {filterControls.length > 0 && (
          <div
            style={{
              width: '100%',
              height: '1px',
              backgroundColor: '#F2F4F7',
              margin: '8px 0 4px 0',
              alignSelf: 'stretch',
              color: '#000',
            }}
          />
        )}

        {/* Bottom row: Search left, Filters right with Grid */}
        <div
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr auto',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          {/* Left: Search */}
          {/* <div style={{ minWidth: 0 }}>
            <Input
              placeholder="Search..."
              prefix={<SearchIcon style={{ fontSize: '16px', color: '#9CA3AF' }} />}
              style={{
                width: '300px',
                height: '36px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                fontSize: '14px',
                minWidth: 0,
              }}
              onChange={(e) => {
                if (this.props.onSearch) this.props.onSearch(e.target.value);
              }}
            />
          </div> */}

          {/* Right: Filters */}
          {filterControls.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifySelf: 'end' }}>
              {filterControls.map((it, idx) => (
                <span key={idx} style={{ display: 'inline-flex' }}>
                  {it.element}
                </span>
              ))}
            </div>
          ) : (
            <div />
          )}
        </div>
      </div>
    );
  }

  fetchAllAssetsOnce = async () => {
    try {
      const payload = {
        RequestType: 'AssetSearch',
        InputJson: JSON.stringify({ AssetSearch: [{ SearchString: '' }] }),
        action: 'JsonRequest',
      };
      const response = await API.triggerPost('Plant', payload);
      const allAssets = (response?.data?.data || []).map((item) => ({
        AssetId: item.AssetId,
        AssetInfo: item.AssetInfo,
      }));
      this.setState({ allAssets, suggestions: allAssets });
    } catch (error) {
      console.error('fetchAllAssetsOnce error:', error);
    }
  };

  getCurrentMenuItemEditStatus() {
    try {
      const menuData = JSON.parse(secureStorage.getItem('menu2') || '{}');
      const currentPath = window.location.hash.replace('#', '');

      // Find the current menu item
      const menuItems = menuData?.Menu?.[0]?.PlantMenu || [];
      for (const menu of menuItems) {
        const subItems = menu.PlantMenuSub || [];
        for (const subItem of subItems) {
          const menuPath = `/${menu.LinkUrl}/${subItem.LinkUrl}`.replace(/\/+/g, '/');
          if (currentPath === menuPath) {
            return subItem.IsEdit === true;
          }
        }
      }
      return true; // Default to true if not found
    } catch (error) {
      console.error('Error getting menu item edit status:', error);
      return true; // Default to true on error
    }
  }

  handleAssetSearch = (searchTerm) => {
    const { gridPanel } = this.props;

    if (!gridPanel) {
      return;
    }

    // Clear any existing timeout
    if (this.searchTimeout) {
      clearTimeout(this.searchTimeout);
    }

    // Debounce the search
    this.searchTimeout = setTimeout(() => {
      // Build filter for ag-grid format (this includes filterType)
      const filter = [];

      // Add search filter if there's a search term
      if (searchTerm && searchTerm.trim() !== '') {
        filter.push({
          field: 'AssetName',
          data: {
            type: 'string',
            value: searchTerm.trim(),
          },
        });
      }

      console.log('Asset search - term:', searchTerm, 'filter:', filter);

      // Call loadData with filter
      if (gridPanel.loadData) {
        gridPanel.loadData({
          filter,
          sortInfo: gridPanel.state?.sortInfo || null,
          currentPage: 0,
          limit: gridPanel.state?.limit || 50,
        });
      }
    }, 300); // Wait 300ms after user stops typing
  };

  // getBaseViewCompat is already defined above
  render() {
    const { readOnlyGrid, isChild, displayLoader, isReadOnly } = this.props;

    // Early returns for simple cases
    if (readOnlyGrid || !this.hasFullAccess()) {
      return <div className="empty-grid-header" />;
    }

    if (isChild && !isReadOnly) {
      return this.renderChildToolbar();
    }
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-start', width: '100%', padding: '5px' }}>
        {displayLoader && defaultLoader()}
        <div style={{ width: '100%' }}>
          {this.renderToolbarContent()}
          {this.renderCustomUI()}
        </div>
      </div>
    );
  }
}

/// Memoize the component to prevent unnecessary re-renders
const MemoizedToolbarManager = React.memo(
  withTranslation()(ToolbarManagerComponent),
  (prevProps, nextProps) => {
    // Custom comparison function for memo
    const propsToCheck = [
      'readOnlyGrid',
      'isChild',
      'displayLoader',
      'isReadOnly',
      // Don't include gridApi as it's a complex object that shouldn't be stringified
      // 'gridApi',
      // 'combos' // Exclude combos if it contains circular references
    ];

    // Custom deep comparison that handles circular references
    const arePropsEqual = (a, b) => {
      try {
        // Quick reference check
        if (a === b) return true;

        // Handle null/undefined
        if (a == null || b == null) return a === b;

        // Handle primitives and functions
        const typeA = typeof a;
        const typeB = typeof b;
        if (typeA !== typeB) return false;
        if (typeA !== 'object') return a === b;

        // Handle React elements and components
        if (a.$$typeof || b.$$typeof) return a === b;

        // Handle DOM elements
        if (a instanceof HTMLElement || b instanceof HTMLElement) return a === b;

        // For objects, compare their keys and values
        const keysA = Object.keys(a);
        const keysB = Object.keys(b);

        if (keysA.length !== keysB.length) return false;

        return keysA.every((key) => {
          // Skip internal React properties
          if (key.startsWith('__reactInternalInstance$') || key.startsWith('__reactFiber$')) {
            return true;
          }
          return arePropsEqual(a[key], b[key]);
        });
      } catch (e) {
        console.warn('Error comparing props:', e);
        return false; // Default to false on error to be safe
      }
    };

    return !propsToCheck.some((prop) => !arePropsEqual(prevProps[prop], nextProps[prop]));
  },
);

export default MemoizedToolbarManager;
